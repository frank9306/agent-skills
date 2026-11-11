// status-bar.go — app-use StatusBar overlay window (Go native, Win32 API)
//
// Creates a topmost, no-activate, click-through, tool-window overlay
// that renders the "行进描边胶囊" status bar at top-center of the screen.
//
// Window flags:
//   WS_EX_NOACTIVATE    — does not steal foreground focus
//   WS_EX_TRANSPARENT   — mouse clicks pass through to windows below
//   WS_EX_TOOLWINDOW    — does not appear in Alt-Tab
//   WS_EX_TOPMOST       — stays on top (session-scoped, destroyed on exit)
//   WS_EX_LAYERED       — supports per-pixel alpha and smooth repaint
//
// The bar reads status events from stdin (one JSON object per line).
// On heartbeat timeout (2s), switches to "unknown" state.
// On extended silence (3s), hides the window.
// On stdin EOF or "stop" event, destroys the window and exits.

package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"math"
	"os"
	"strings"
	"syscall"
	"time"
	"unsafe"
)

// --- Win32 constants ---

const (
	WS_EX_NOACTIVATE   = 0x08000000
	WS_EX_TRANSPARENT  = 0x00000020
	WS_EX_TOOLWINDOW   = 0x00000080
	WS_EX_TOPMOST      = 0x00000008
	WS_EX_LAYERED      = 0x00080000
	WS_POPUP           = 0x80000000
	WS_VISIBLE         = 0x10000000
	WS_CLIPSIBLINGS    = 0x04000000
	WS_CLIPCHILDREN    = 0x02000000

	SW_SHOWNOACTIVATE = 4
	SW_HIDE           = 0

	CW_USEDEFAULT = 0x80000000

	WM_PAINT    = 0x000F
	WM_TIMER    = 0x0113
	WM_DESTROY  = 0x0002
	WM_GETOBJECT = 0x003D

	WM_APP = 0x8000

	// Custom messages used to marshal window-affecting calls onto the
	// window's own thread. ShowWindow called from another thread (or before
	// the message loop starts) is silently dropped, which leaves the overlay
	// created but never visible.
	WM_APP_SHOW = 0x8001
	WM_APP_HIDE = 0x8002

	COLOR_WINDOW = 5

	PS_SOLID       = 0
	PS_DASH        = 1
	PS_DASHDOT     = 3
	PS_ENDCAP_ROUND = 0x00000000
	PS_JOIN_ROUND   = 0x00000000

	DT_SINGLELINE = 0x00000020
	DT_VCENTER    = 0x00000004
	DT_NOCLIP     = 0x0100

	BUF_SIZE = 4096
)

const (
	timerAnimate  = 1  // 33ms — marching ant animation (~30fps)
	timerHeartbeat = 2 // 500ms — check for heartbeat timeout
)

// --- Win32 structs ---

type RECT struct {
	Left, Top, Right, Bottom int32
}

type POINT struct {
	X, Y int32
}

type WNDCLASSEX struct {
	Size       uint32
	Style      uint32
	WndProc    uintptr
	ClsExtra   int32
	WndExtra   int32
	Instance   syscall.Handle
	Icon       syscall.Handle
	Cursor     syscall.Handle
	Background syscall.Handle
	MenuName   *uint16
	ClassName  *uint16
	IconSm     syscall.Handle
}

type PAINTSTRUCT struct {
	Hdc         syscall.Handle
	Erase       bool
	PaintRect   RECT
	Restore     bool
	IncUpdate   bool
	RgbReserved [32]byte
}

type LOGFONT struct {
	Height         int32
	Width          int32
	Escapement     int32
	Orientation    int32
	Weight         int32
	Italic         byte
	Underline      byte
	StrikeOut      byte
	CharSet        byte
	OutPrecision   byte
	ClipPrecision  byte
	Quality        byte
	PitchAndFamily byte
	FaceName       [32]uint16
}

type BLENDFUNCTION struct {
	BlendOp             byte
	BlendFlags          byte
	SourceConstantAlpha byte
	AlphaFormat         byte
}

// --- Win32 functions ---

var (
	user32                       = syscall.NewLazyDLL("user32.dll")
	gdi32                        = syscall.NewLazyDLL("gdi32.dll")
	kernel32                     = syscall.NewLazyDLL("kernel32.dll")
	procRegisterClassEx          = user32.NewProc("RegisterClassExW")
	procCreateWindowEx           = user32.NewProc("CreateWindowExW")
	procDestroyWindow            = user32.NewProc("DestroyWindow")
	procDefWindowProc            = user32.NewProc("DefWindowProcW")
	procGetMessage               = user32.NewProc("GetMessageW")
	procDispatchMessage          = user32.NewProc("DispatchMessageW")
	procPostQuitMessage          = user32.NewProc("PostQuitMessage")
	procBeginPaint               = user32.NewProc("BeginPaint")
	procEndPaint                 = user32.NewProc("EndPaint")
	procSetTimer                 = user32.NewProc("SetTimer")
	procKillTimer                = user32.NewProc("KillTimer")
	procShowWindow               = user32.NewProc("ShowWindow")
	procGetSystemMetrics         = user32.NewProc("GetSystemMetrics")
	procInvalidateRect           = user32.NewProc("InvalidateRect")
	procSetLayeredWindowAttributes = user32.NewProc("SetLayeredWindowAttributes")
	procCreateSolidBrush         = gdi32.NewProc("CreateSolidBrush")
	procCreatePen                = gdi32.NewProc("CreatePen")
	procDeleteObject             = gdi32.NewProc("DeleteObject")
	procSelectObject             = gdi32.NewProc("SelectObject")
	procFillRect                 = user32.NewProc("FillRect")
	procRectangle                = gdi32.NewProc("Rectangle")
	procRoundRect                = gdi32.NewProc("RoundRect")
	procMoveToEx                 = gdi32.NewProc("MoveToEx")
	procLineTo                   = gdi32.NewProc("LineTo")
	procEllipse                  = gdi32.NewProc("Ellipse")
	procSetTextAlign             = gdi32.NewProc("SetTextAlign")
	procSetTextColor             = gdi32.NewProc("SetTextColor")
	procSetBkMode                = gdi32.NewProc("SetBkMode")
	procCreateFontIndirect       = gdi32.NewProc("CreateFontIndirectW")
	procDrawText                 = user32.NewProc("DrawTextW")
	procGetTextExtentPoint32     = gdi32.NewProc("GetTextExtentPoint32W")
	procGetCurrentProcess        = kernel32.NewProc("GetCurrentProcess")
	procGetCurrentThreadId       = kernel32.NewProc("GetCurrentThreadId")
	procSetProcessDPIAware       = user32.NewProc("SetProcessDPIAware")
	procPostMessage              = user32.NewProc("PostMessageW")
	procSetWindowPos             = user32.NewProc("SetWindowPos")
)

const (
	SM_CXSCREEN = 0
	SM_CYSCREEN = 1
	TA_LEFT     = 0
	TA_RIGHT    = 2
	TA_CENTER   = 6
	TRANSPARENT = 1
)

// --- Status event ---

type StatusEvent struct {
	Session        string  `json:"session"`
	Seq            int     `json:"seq"`
	At             float64 `json:"at"`
	Phase          string  `json:"phase"`
	Verb           string  `json:"verb"`
	Target         string  `json:"target"`
	App            string  `json:"app"`
	ActionExecuted bool    `json:"actionExecuted"`
	GoalVerified   bool    `json:"goalVerified"`
	ExpiresAt      float64 `json:"expiresAt"`
}

// --- Status bar state ---

type StatusBar struct {
	hwnd        syscall.Handle
	hdc         syscall.Handle
	phase       string
	verb        string
	target      string
	elapsed     string
	animOffset  float64
	perimeter   float64
	startTime   time.Time
	lastUpdate  time.Time
	hidden      bool
	barW        int32
	barH        int32
	radius      int32
	screenW     int32
	screenH     int32
}

type ColorScheme struct {
	Stroke [3]uint8 // RGB
	Point  [3]uint8
	ChipBg [3]uint8
	ChipFg [3]uint8
	Dot    [3]uint8
}

var colors = map[string]ColorScheme{
	"executing": {Stroke: [3]uint8{0x3B, 0x8A, 0xDD}, Point: [3]uint8{0x18, 0x5F, 0xA5}, ChipBg: [3]uint8{0xE6, 0xF1, 0xFB}, ChipFg: [3]uint8{0x0C, 0x44, 0x7C}, Dot: [3]uint8{0x37, 0x8A, 0xDD}},
	"preview":   {Stroke: [3]uint8{0xEF, 0x9F, 0x27}, Point: [3]uint8{0xBA, 0x75, 0x17}, ChipBg: [3]uint8{0xFA, 0xEE, 0xDA}, ChipFg: [3]uint8{0x63, 0x38, 0x06}, Dot: [3]uint8{0xEF, 0x9F, 0x27}},
	"verified":  {Stroke: [3]uint8{0x63, 0x99, 0x22}, Point: [3]uint8{0x3B, 0x6D, 0x11}, ChipBg: [3]uint8{0xEA, 0xF3, 0xDE}, ChipFg: [3]uint8{0x27, 0x50, 0x0A}, Dot: [3]uint8{0x63, 0x99, 0x22}},
	"blocked":   {Stroke: [3]uint8{0xE2, 0x4B, 0x4A}, Point: [3]uint8{0xA3, 0x2D, 0x2D}, ChipBg: [3]uint8{0xFC, 0xEB, 0xEB}, ChipFg: [3]uint8{0x79, 0x1F, 0x1F}, Dot: [3]uint8{0xE2, 0x4B, 0x4A}},
	"unknown":   {Stroke: [3]uint8{0x88, 0x87, 0x80}, Point: [3]uint8{0x5F, 0x5E, 0x5A}, ChipBg: [3]uint8{0xF1, 0xEF, 0xE8}, ChipFg: [3]uint8{0x44, 0x44, 0x41}, Dot: [3]uint8{0x88, 0x87, 0x80}},
}

var chipText = map[string]string{
	"executing": "执行中",
	"preview":   "预告",
	"verified":  "已验证",
	"blocked":   "已阻止",
	"unknown":   "未知",
}

var sb *StatusBar

// --- Window procedure ---

func wndProc(hwnd syscall.Handle, msg uint32, wParam, lParam uintptr) uintptr {
	switch msg {
	case WM_PAINT:
		var ps PAINTSTRUCT
		hdc, _, _ := procBeginPaint.Call(uintptr(hwnd), uintptr(unsafe.Pointer(&ps)))
		sb.hdc = syscall.Handle(hdc)
		sb.paint()
		procEndPaint.Call(uintptr(hwnd), uintptr(unsafe.Pointer(&ps)))
		return 0

	case WM_TIMER:
		switch wParam {
		case timerAnimate:
			sb.animOffset = math.Mod(sb.animOffset+12.0, sb.perimeter)
			if sb.shouldAnimate() {
				r := RECT{0, 0, sb.barW, sb.barH}
				procInvalidateRect.Call(uintptr(hwnd), uintptr(unsafe.Pointer(&r)), 0)
			}
		case timerHeartbeat:
			elapsed := time.Since(sb.lastUpdate)
			if elapsed >= 3*time.Second {
				if !sb.hidden {
					procPostMessage.Call(uintptr(hwnd), WM_APP_HIDE, 0, 0)
					sb.hidden = true
				}
			} else if elapsed >= 2*time.Second {
				if sb.phase != "unknown" {
					sb.phase = "unknown"
					r := RECT{0, 0, sb.barW, sb.barH}
					procInvalidateRect.Call(uintptr(hwnd), uintptr(unsafe.Pointer(&r)), 0)
				}
			}
			if sb.shouldAnimate() {
				ts := time.Since(sb.startTime)
				m := int(ts.Minutes())
				s := int(ts.Seconds()) % 60
				sb.elapsed = fmt.Sprintf("%02d:%02d", m, s)
				r := RECT{0, 0, sb.barW, sb.barH}
				procInvalidateRect.Call(uintptr(hwnd), uintptr(unsafe.Pointer(&r)), 0)
			}
		}
		return 0

	case WM_GETOBJECT:
		// Return empty — remove from UIA observation tree
		return 0

	case WM_APP_SHOW:
		// Runs on the window's own thread, inside the message pump
		procShowWindow.Call(uintptr(hwnd), SW_SHOWNOACTIVATE)
		// HWND_TOPMOST = (HWND)-1
		procSetWindowPos.Call(uintptr(hwnd), uintptr(unsafe.Pointer(uintptr(0xffffffffffffffff))), 0, 0, 0, 0, 0x0001|0x0002|0x0010)
		r := RECT{0, 0, sb.barW, sb.barH}
		procInvalidateRect.Call(uintptr(hwnd), uintptr(unsafe.Pointer(&r)), 0)
		return 0

	case WM_APP_HIDE:
		procShowWindow.Call(uintptr(hwnd), SW_HIDE)
		return 0

	case WM_DESTROY:
		procKillTimer.Call(uintptr(hwnd), timerAnimate)
		procKillTimer.Call(uintptr(hwnd), timerHeartbeat)
		procPostQuitMessage.Call(0)
		return 0
	}

	ret, _, _ := procDefWindowProc.Call(uintptr(hwnd), uintptr(msg), wParam, lParam)
	return ret
}

func (s *StatusBar) shouldAnimate() bool {
	return s.phase == "executing" || s.phase == "preview"
}

func rgb(r, g, b uint8) uintptr {
	return uintptr(uint32(b)<<16 | uint32(g)<<8 | uint32(r))
}

func (s *StatusBar) paint() {
	c, ok := colors[s.phase]
	if !ok {
		c = colors["unknown"]
	}

	hdc := uintptr(s.hdc)

	// Set background mode to transparent for text
	procSetBkMode.Call(hdc, TRANSPARENT)

	// Background: white rounded rect
	whiteBrush, _, _ := procCreateSolidBrush.Call(rgb(255, 255, 255))
	borderPen, _, _ := procCreatePen.Call(PS_SOLID, 1, rgb(200, 200, 200))
	oldPen, _, _ := procSelectObject.Call(hdc, uintptr(borderPen))
	oldBrush, _, _ := procSelectObject.Call(hdc, uintptr(whiteBrush))
	procRoundRect.Call(hdc, 1, 1, uintptr(s.barW)-1, uintptr(s.barH)-1, uintptr(s.radius*2), uintptr(s.radius*2))
	procSelectObject.Call(hdc, oldBrush)
	procSelectObject.Call(hdc, oldPen)
	procDeleteObject.Call(whiteBrush)
	procDeleteObject.Call(borderPen)

	// Marching ant stroke or terminal state stroke
	dashLen := 70.0
	gapLen := s.perimeter - dashLen

	if s.shouldAnimate() {
		// Create a custom dash pen with offset
		strokePen, _, _ := procCreatePen.Call(PS_SOLID|PS_ENDCAP_ROUND|PS_JOIN_ROUND, 2, rgb(c.Stroke[0], c.Stroke[1], c.Stroke[2]))
		oldPen, _, _ = procSelectObject.Call(hdc, uintptr(strokePen))
		// Draw partial arc to simulate marching ant
		s.drawMarchingStroke(hdc, dashLen, gapLen)
		procSelectObject.Call(hdc, oldPen)
		procDeleteObject.Call(strokePen)
	} else if s.phase == "verified" || s.phase == "blocked" {
		// Full solid border
		strokePen, _, _ := procCreatePen.Call(PS_SOLID|PS_ENDCAP_ROUND|PS_JOIN_ROUND, 2, rgb(c.Stroke[0], c.Stroke[1], c.Stroke[2]))
		oldPen, _, _ = procSelectObject.Call(hdc, uintptr(strokePen))
		procRoundRect.Call(hdc, 1, 1, uintptr(s.barW)-1, uintptr(s.barH)-1, uintptr(s.radius*2), uintptr(s.radius*2))
		procSelectObject.Call(hdc, oldPen)
		procDeleteObject.Call(strokePen)
	} else {
		// Unknown: dashed static
		dashPen, _, _ := procCreatePen.Call(PS_DASH, 1, rgb(c.Stroke[0], c.Stroke[1], c.Stroke[2]))
		oldPen, _, _ = procSelectObject.Call(hdc, uintptr(dashPen))
		procRoundRect.Call(hdc, 1, 1, uintptr(s.barW)-1, uintptr(s.barH)-1, uintptr(s.radius*2), uintptr(s.radius*2))
		procSelectObject.Call(hdc, oldPen)
		procDeleteObject.Call(dashPen)
	}

	// Status dot (9px circle)
	dotBrush, _, _ := procCreateSolidBrush.Call(rgb(c.Point[0], c.Point[1], c.Point[2]))
	dotX := int32(18)
	dotY := s.barH/2 - 4
	oldBrush, _, _ = procSelectObject.Call(hdc, uintptr(dotBrush))
	procEllipse.Call(hdc, uintptr(dotX), uintptr(dotY), uintptr(dotX+9), uintptr(dotY+9))
	procSelectObject.Call(hdc, oldBrush)
	procDeleteObject.Call(dotBrush)

	// Status chip
	chipStr := chipText[s.phase]
	if chipStr == "" {
		chipStr = "未知"
	}
	chipFont := createFont("Microsoft YaHei UI", 9, 0)
	oldFont, _, _ := procSelectObject.Call(hdc, uintptr(chipFont))

	// Measure chip text
	var chipSize [2]int32
	utf16Chip := syscall.StringToUTF16Ptr(chipStr)
	procGetTextExtentPoint32.Call(hdc, uintptr(unsafe.Pointer(utf16Chip)), uintptr(len([]rune(chipStr))), uintptr(unsafe.Pointer(&chipSize[0])))

	chipX := dotX + 14
	chipY := (s.barH - chipSize[1]) / 2
	chipW := chipSize[0] + 10
	chipH := chipSize[1]

	chipBgBrush, _, _ := procCreateSolidBrush.Call(rgb(c.ChipBg[0], c.ChipBg[1], c.ChipBg[2]))
	chipPen, _, _ := procCreatePen.Call(PS_SOLID, 1, rgb(c.ChipBg[0], c.ChipBg[1], c.ChipBg[2]))
	oldPen, _, _ = procSelectObject.Call(hdc, uintptr(chipPen))
	oldBrush, _, _ = procSelectObject.Call(hdc, uintptr(chipBgBrush))
	procRoundRect.Call(hdc, uintptr(chipX), uintptr(chipY), uintptr(chipX+chipW), uintptr(chipY+chipH), 8, 8)
	procSelectObject.Call(hdc, oldBrush)
	procSelectObject.Call(hdc, oldPen)
	procDeleteObject.Call(chipBgBrush)
	procDeleteObject.Call(chipPen)

	// Chip text
	procSetTextColor.Call(hdc, rgb(c.ChipFg[0], c.ChipFg[1], c.ChipFg[2]))
	procSetTextAlign.Call(hdc, TA_CENTER)
	chipRect := RECT{Left: chipX, Top: chipY, Right: chipX + chipW, Bottom: chipY + chipH}
	procDrawText.Call(hdc, uintptr(unsafe.Pointer(utf16Chip)), uintptr(len([]rune(chipStr))), uintptr(unsafe.Pointer(&chipRect)), DT_SINGLELINE|DT_VCENTER|DT_NOCLIP)
	procSelectObject.Call(hdc, oldFont)
	procDeleteObject.Call(uintptr(chipFont))

	// Separator line
	sepX := chipX + chipW + 8
	sepPen, _, _ := procCreatePen.Call(PS_SOLID, 1, rgb(220, 220, 220))
	oldPen, _, _ = procSelectObject.Call(hdc, uintptr(sepPen))
	procMoveToEx.Call(hdc, uintptr(sepX), 10, 0)
	procLineTo.Call(hdc, uintptr(sepX), uintptr(s.barH-10))
	procSelectObject.Call(hdc, oldPen)
	procDeleteObject.Call(sepPen)

	// Action name (monospace)
	actionText := s.verb
	if s.target != "" {
		actionText += " · " + truncate(s.target, 30)
	}
	monoFont := createFont("Consolas", 9, 0)
	oldFont, _, _ = procSelectObject.Call(hdc, uintptr(monoFont))
	procSetTextAlign.Call(hdc, TA_LEFT)
	procSetTextColor.Call(hdc, rgb(51, 51, 51))
	actionRect := RECT{Left: sepX + 8, Top: 0, Right: s.barW - 60, Bottom: s.barH}
	utf16Action := syscall.StringToUTF16Ptr(actionText)
	procDrawText.Call(hdc, uintptr(unsafe.Pointer(utf16Action)), uintptr(len([]rune(actionText))), uintptr(unsafe.Pointer(&actionRect)), DT_SINGLELINE|DT_VCENTER|DT_NOCLIP)
	procSelectObject.Call(hdc, oldFont)
	procDeleteObject.Call(uintptr(monoFont))

	// Timer (monospace, right-aligned)
	timerFont := createFont("Consolas", 9, 0)
	oldFont, _, _ = procSelectObject.Call(hdc, uintptr(timerFont))
	procSetTextAlign.Call(hdc, TA_RIGHT)
	procSetTextColor.Call(hdc, rgb(128, 128, 128))
	timerRect := RECT{Left: s.barW - 70, Top: 0, Right: s.barW - 14, Bottom: s.barH}
	utf16Timer := syscall.StringToUTF16Ptr(s.elapsed)
	procDrawText.Call(hdc, uintptr(unsafe.Pointer(utf16Timer)), uintptr(len([]rune(s.elapsed))), uintptr(unsafe.Pointer(&timerRect)), DT_SINGLELINE|DT_VCENTER|DT_NOCLIP)
	procSelectObject.Call(hdc, oldFont)
	procDeleteObject.Call(uintptr(timerFont))
}

// drawMarchingStroke draws a partial rounded-rect outline to simulate the marching ant effect.
// Since GDI doesn't support custom dash patterns with offset on RoundRect,
// we draw multiple short line segments along the rounded rectangle path.
func (s *StatusBar) drawMarchingStroke(hdc uintptr, dashLen, gapLen float64) {
	// We use a simpler approach: draw the full roundrect with a dash pattern
	// GDI PS_DASH gives us fixed dashes; for the "marching" look we
	// approximate by drawing the full outline and then overdrawing
	// the "gap" section with the background color.
	//
	// For a more faithful rendering, we'd need GDI+ paths.
	// This approximation draws a solid 2px outline (visible segment)
	// which is close enough at 340x38.

	c := colors[s.phase]
	pen, _, _ := procCreatePen.Call(PS_SOLID|PS_ENDCAP_ROUND|PS_JOIN_ROUND, 2, rgb(c.Stroke[0], c.Stroke[1], c.Stroke[2]))
	oldPen, _, _ := procSelectObject.Call(hdc, pen)
	procRoundRect.Call(hdc, 1, 1, uintptr(s.barW)-1, uintptr(s.barH)-1, uintptr(s.radius*2), uintptr(s.radius*2))
	procSelectObject.Call(hdc, oldPen)
	procDeleteObject.Call(pen)
}

func createFont(faceName string, size int32, weight int32) syscall.Handle {
	lf := LOGFONT{}
	lf.Height = -size * int32(getDPI()) / 72
	if lf.Height == 0 {
		lf.Height = -12
	}
	lf.Weight = weight
	if weight == 0 {
		lf.Weight = 400 // FW_NORMAL
	}
	lf.CharSet = 1 // DEFAULT_CHARSET
	lf.OutPrecision = 0
	lf.ClipPrecision = 0
	lf.Quality = 0
	lf.PitchAndFamily = 0
	utf16 := syscall.StringToUTF16(faceName)
	copy(lf.FaceName[:], utf16)

	h, _, _ := procCreateFontIndirect.Call(uintptr(unsafe.Pointer(&lf)))
	return syscall.Handle(h)
}

func getDPI() int {
	return 96 // Default DPI; SetProcessDPIAware makes this accurate
}

func truncate(s string, n int) string {
	runes := []rune(s)
	if len(runes) > n {
		return string(runes[:n]) + "…"
	}
	return s
}

// --- Main ---

func main() {
	// Enable DPI awareness
	procSetProcessDPIAware.Call()

	// Get screen dimensions
	screenW, _, _ := procGetSystemMetrics.Call(SM_CXSCREEN)
	screenH, _, _ := procGetSystemMetrics.Call(SM_CYSCREEN)

	barW := int32(340)
	barH := int32(38)
	radius := int32(19)

	// Position: top center, 12px from top
	x := (int32(screenW) - barW) / 2
	y := int32(12)

	// Calculate approximate perimeter of rounded rect
	// P = 2(w-2r) + 2(h-2r) + 2π*r
	w := float64(barW)
	h := float64(barH)
	r := float64(radius)
	perimeter := 2*(w-2*r) + 2*(h-2*r) + 2*math.Pi*r

	sb = &StatusBar{
		phase:      "executing",
		verb:       "observe",
		elapsed:    "00:00",
		animOffset: 0,
		perimeter:  perimeter,
		startTime:  time.Now(),
		lastUpdate: time.Now(),
		barW:       barW,
		barH:       barH,
		radius:     radius,
		screenW:    int32(screenW),
		screenH:    int32(screenH),
	}

	// Register window class
	className := syscall.StringToUTF16Ptr("AppUseStatusBar")
	hInst, _, _ := procGetCurrentProcess.Call()

	wc := WNDCLASSEX{}
	wc.Size = uint32(unsafe.Sizeof(wc))
	wc.Style = 0
	wc.WndProc = syscall.NewCallback(wndProc)
	wc.Instance = syscall.Handle(hInst)
	wc.Background = COLOR_WINDOW + 1
	wc.ClassName = className

	procRegisterClassEx.Call(uintptr(unsafe.Pointer(&wc)))

	// Create window with all required extended styles
	exStyle := WS_EX_NOACTIVATE | WS_EX_TRANSPARENT | WS_EX_TOOLWINDOW | WS_EX_TOPMOST | WS_EX_LAYERED
	style := WS_POPUP | WS_CLIPSIBLINGS | WS_CLIPCHILDREN

	hwnd, _, err := procCreateWindowEx.Call(
		uintptr(exStyle),
		uintptr(unsafe.Pointer(className)),
		0, // no title
		uintptr(style),
		uintptr(x), uintptr(y),
		uintptr(barW), uintptr(barH),
		0, 0, uintptr(hInst), 0,
	)

	if hwnd == 0 {
		fmt.Fprintf(os.Stderr, "CreateWindowEx failed: %v\n", err)
		os.Exit(1)
	}

	sb.hwnd = syscall.Handle(hwnd)

	// Set layered window attributes (opaque, no per-pixel alpha needed)
	procSetLayeredWindowAttributes.Call(
		uintptr(hwnd),
		rgb(255, 255, 255), // color key: white background
		255,                // alpha: fully opaque
		2,                  // LWA_ALPHA
	)

	// Show window — marshalled onto the window's own thread
	procPostMessage.Call(uintptr(hwnd), WM_APP_SHOW, 0, 0)

	// Start timers
	procSetTimer.Call(hwnd, timerAnimate, 33, 0)   // ~30fps
	procSetTimer.Call(hwnd, timerHeartbeat, 500, 0) // heartbeat check

	// Read events from stdin in a goroutine
	go func() {
		scanner := bufio.NewScanner(os.Stdin)
		scanner.Buffer(make([]byte, 65536), 65536)
		for scanner.Scan() {
			line := strings.TrimSpace(scanner.Text())
			if line == "" {
				continue
			}
			var evt StatusEvent
			if err := json.Unmarshal([]byte(line), &evt); err != nil {
				continue
			}
			if evt.Phase == "stop" || evt.Verb == "stop" {
				procDestroyWindow.Call(hwnd)
				return
			}
			sb.phase = evt.Phase
			if evt.Verb != "" {
				sb.verb = evt.Verb
			}
			if evt.Target != "" {
				sb.target = evt.Target
			}
			if evt.Seq > 0 {
				sb.startTime = time.Now()
			}
			sb.lastUpdate = time.Now()
			sb.hidden = false
			procPostMessage.Call(hwnd, WM_APP_SHOW, 0, 0)
			r := RECT{0, 0, barW, barH}
			procInvalidateRect.Call(hwnd, uintptr(unsafe.Pointer(&r)), 0)
		}
		// stdin closed — destroy window
		procDestroyWindow.Call(hwnd)
	}()

	// Message loop
	var msg [28]byte // MSG struct
	for {
		ret, _, _ := procGetMessage.Call(uintptr(unsafe.Pointer(&msg[0])), 0, 0, 0)
		if ret == 0 { // WM_QUIT
			break
		}
		procDispatchMessage.Call(uintptr(unsafe.Pointer(&msg[0])))
	}
}
