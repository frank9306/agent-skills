package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"runtime"
	"syscall"
	"time"
	"unsafe"
)

var (
	user   = syscall.NewLazyDLL("user32.dll")
	gdi    = syscall.NewLazyDLL("gdi32.dll")
	kernel = syscall.NewLazyDLL("kernel32.dll")
)

type rect struct{ left, top, right, bottom int32 }
type point struct{ x, y int32 }
type message struct {
	window  uintptr
	id      uint32
	w, l    uintptr
	at      uint32
	where   point
	private uint32
}
type monitorInfo struct {
	size         uint32
	bounds, work rect
	flags        uint32
}
type paintStruct struct {
	dc              uintptr
	erase           int32
	bounds          rect
	restore, update int32
	reserved        [32]byte
}
type windowClass struct {
	style                         uint32
	procedure                     uintptr
	classExtra, windowExtra       int32
	instance, icon, cursor, brush uintptr
	menu, name                    *uint16
}
type status struct {
	Task, Action string
	Hwnd         uintptr
	Pid          uint32
}

const (
	wmPaint         = 0x000f
	wmDestroy       = 0x0002
	wmTimer         = 0x0113
	wmDPIChanged    = 0x02e0
	wmSettingChange = 0x001a
	wmHitTest       = 0x0084
	wmMouseActivate = 0x0021
	wmUpdate        = 0x8001
	wmClose         = 0x0010
	windowStyles    = 0x080800a8 // no activate, layered, tool window, transparent, topmost
)

var labels = map[string]string{
	"start": "正在准备", "click": "点击控件", "invoke": "调用控件", "fill": "填写内容",
	"key": "发送按键", "scroll": "滚动", "select": "选择选项", "drag": "拖动", "read": "读取状态",
	"focus": "定位目标", "move": "移动指针", "navigate": "打开页面", "newTab": "新建标签页",
	"switchTab": "切换标签页", "scrollIntoView": "滚动到目标", "files": "选择文件", "dialog": "处理对话框",
	"assert": "验证结果", "wait": "等待条件", "branch": "检查条件", "judge": "判断状态",
	"capture": "保存证据", "pass": "已验证", "fail": "验证失败", "error": "运行出错",
	"unverified": "未通过验证", "stopped": "已停止",
}

var updates = make(chan status, 1)
var current status
var lastUpdate, started time.Time
var fallback uintptr
var placement rect
var dpi uint32
var visible bool
var lastPlacementCheck time.Time

var (
	monitorFromWindow = user.NewProc("MonitorFromWindow")
	getWindowPID      = user.NewProc("GetWindowThreadProcessId")
	getMonitorInfo    = user.NewProc("GetMonitorInfoW")
	getDPI            = user.NewProc("GetDpiForWindow")
	setPosition       = user.NewProc("SetWindowPos")
	showWindow        = user.NewProc("ShowWindow")
	invalidate        = user.NewProc("InvalidateRect")
	drawText          = user.NewProc("DrawTextW")
	createBrush       = gdi.NewProc("CreateSolidBrush")
	createPen         = gdi.NewProc("CreatePen")
	createFont        = gdi.NewProc("CreateFontW")
	deleteObject      = gdi.NewProc("DeleteObject")
	selectObject      = gdi.NewProc("SelectObject")
	compatibleDC      = gdi.NewProc("CreateCompatibleDC")
	deleteDC          = gdi.NewProc("DeleteDC")
)

func wide(s string) *uint16              { return syscall.StringToUTF16Ptr(s) }
func px(value int32, scale uint32) int32 { return (value*int32(scale) + 48) / 96 }

func layout(work rect, scale uint32) rect {
	margin := px(12, scale)
	width := min(px(440, scale), max(1, work.right-work.left-2*margin))
	height := px(44, scale)
	x := work.left + (work.right-work.left-width)/2
	y := work.top + margin
	return rect{x, y, x + width, y + height}
}

func reposition(window uintptr) {
	monitor := fallback
	if current.Hwnd != 0 {
		var pid uint32
		thread, _, _ := getWindowPID.Call(current.Hwnd, uintptr(unsafe.Pointer(&pid)))
		if thread != 0 && pid == current.Pid {
			monitor, _, _ = monitorFromWindow.Call(current.Hwnd, 2)
		}
	}
	info := monitorInfo{size: uint32(unsafe.Sizeof(monitorInfo{}))}
	ok, _, _ := getMonitorInfo.Call(monitor, uintptr(unsafe.Pointer(&info)))
	if ok == 0 {
		monitor, _, _ = monitorFromWindow.Call(window, 2)
		ok, _, _ = getMonitorInfo.Call(monitor, uintptr(unsafe.Pointer(&info)))
		if ok == 0 {
			return
		}
	}
	// Move to the destination before reading effective DPI for this PMv2 HWND.
	if placement.left < info.work.left || placement.right > info.work.right ||
		placement.top < info.work.top || placement.bottom > info.work.bottom || dpi == 0 {
		width := max(1, placement.right-placement.left)
		height := max(1, placement.bottom-placement.top)
		x := info.work.left + (info.work.right-info.work.left-width)/2
		setPosition.Call(window, 0, uintptr(x), uintptr(info.work.top), uintptr(width), uintptr(height), 0x0014)
	}
	raw, _, _ := getDPI.Call(window)
	scale := uint32(raw)
	if scale == 0 {
		scale = 96
	}
	next := layout(info.work, scale)
	if next == placement && scale == dpi {
		return
	}
	placement, dpi = next, scale
	w, h := next.right-next.left, next.bottom-next.top
	surfaceMask = capsuleMask(w, h, max(1, px(1, dpi)))
	setPosition.Call(window, ^uintptr(0), uintptr(next.left), uintptr(next.top), uintptr(w), uintptr(h), 0x0010)
	invalidate.Call(window, 0, 0)
}

func rgb(r, g, b uint32) uintptr { return uintptr(r | g<<8 | b<<16) }

func shape(dc uintptr, api *syscall.LazyProc, bounds rect, fill, edge uintptr) {
	brush, _, _ := createBrush.Call(fill)
	pen, _, _ := createPen.Call(0, 1, edge)
	oldBrush, _, _ := selectObject.Call(dc, brush)
	oldPen, _, _ := selectObject.Call(dc, pen)
	api.Call(dc, uintptr(bounds.left), uintptr(bounds.top), uintptr(bounds.right), uintptr(bounds.bottom))
	selectObject.Call(dc, oldPen)
	selectObject.Call(dc, oldBrush)
	deleteObject.Call(pen)
	deleteObject.Call(brush)
}

func text(dc uintptr, bounds rect, value string, size, weight int32, color, align uintptr) {
	if bounds.right <= bounds.left {
		return
	}
	font, _, _ := createFont.Call(uintptr(-px(size, dpi)), 0, 0, 0, uintptr(weight), 0, 0, 0, 1, 0, 0, 5, 0, uintptr(unsafe.Pointer(wide("Microsoft YaHei UI"))))
	old, _, _ := selectObject.Call(dc, font)
	gdi.NewProc("SetBkMode").Call(dc, 1)
	gdi.NewProc("SetTextColor").Call(dc, color)
	drawText.Call(dc, uintptr(unsafe.Pointer(wide(value))), ^uintptr(0), uintptr(unsafe.Pointer(&bounds)), 0x8824|align)
	selectObject.Call(dc, old)
	deleteObject.Call(font)
}

func paint(dc uintptr, pixels []uint32) {
	w, h := placement.right-placement.left, placement.bottom-placement.top
	if w <= 0 || h <= 0 {
		return
	}
	sc := func(value int32) int32 { return px(value, dpi) }
	bg, border := rgb(21, 28, 42), rgb(66, 81, 108)
	fg, muted := rgb(248, 250, 252), rgb(184, 201, 224)
	accent, label := rgb(102, 174, 255), labels[current.Action]
	switch current.Action {
	case "pass":
		accent = rgb(102, 222, 162)
		border = rgb(67, 112, 93)
	case "wait", "fail", "error", "stopped", "unverified":
		accent = rgb(250, 200, 112)
	}
	connected := time.Since(lastUpdate) < 2*time.Second
	if !connected {
		accent, label = muted, "连接中断"
	}
	fillSurface(pixels, surfaceMask, bg, border)
	if connected && running(current.Action) {
		paintLightband(dc, w, h, time.Since(started))
	}
	dotY := (h - sc(8)) / 2
	shape(dc, gdi.NewProc("Ellipse"), rect{sc(16), dotY, sc(24), dotY + sc(8)}, accent, accent)
	divider := w * 53 / 100
	task := current.Task
	if task == "" {
		task = "自动化任务"
	}
	text(dc, rect{sc(34), 0, divider - sc(12), h}, task, 14, 600, fg, 0)
	shape(dc, gdi.NewProc("Rectangle"), rect{divider, sc(12), divider + max(1, sc(1)), h - sc(12)}, border, border)
	actionRight := w - sc(14)
	if w >= sc(350) {
		actionRight = w - sc(64)
		elapsed := int(time.Since(started).Seconds())
		text(dc, rect{w - sc(57), 0, w - sc(14), h}, fmt.Sprintf("%02d:%02d", elapsed/60, elapsed%60), 12, 400, muted, 2)
	}
	text(dc, rect{divider + sc(12), 0, actionRight, h}, label, 13, 400, muted, 0)
}

func windowProc(window uintptr, event uint32, w, l uintptr) uintptr {
	switch event {
	case wmUpdate:
		select {
		case current = <-updates:
		default:
			return 0
		}
		lastUpdate = time.Now()
		if started.IsZero() {
			started = lastUpdate
		}
		reposition(window)
		if !visible {
			showWindow.Call(window, 4)
			visible = true
		}
		invalidate.Call(window, 0, 0)
		return 0
	case wmTimer:
		if !visible {
			return 0
		}
		now := time.Now()
		if now.Sub(lastUpdate) >= 3*time.Second {
			showWindow.Call(window, 0)
			visible = false
		} else {
			if now.Sub(lastPlacementCheck) >= 250*time.Millisecond {
				lastPlacementCheck = now
				reposition(window)
				invalidate.Call(window, 0, 0)
			} else if animationsEnabled && running(current.Action) && now.Sub(lastUpdate) < 2*time.Second {
				invalidate.Call(window, 0, 0)
			}
		}
		return 0
	case wmSettingChange:
		updateAnimationPreference()
		invalidate.Call(window, 0, 0)
		return 0
	case wmDPIChanged:
		// Apply the work-area-centered geometry on the next message-loop tick.
		return 0
	case wmPaint:
		var state paintStruct
		user.NewProc("BeginPaint").Call(window, uintptr(unsafe.Pointer(&state)))
		user.NewProc("EndPaint").Call(window, uintptr(unsafe.Pointer(&state)))
		if visible {
			paintLayer(window)
		}
		return 0
	case wmHitTest:
		return ^uintptr(0)
	case wmMouseActivate:
		return 3
	case wmDestroy:
		surface.close()
		user.NewProc("PostQuitMessage").Call(0)
		return 0
	}
	result, _, _ := user.NewProc("DefWindowProcW").Call(window, uintptr(event), w, l)
	return result
}

func readStatus(window uintptr) {
	post := user.NewProc("PostMessageW")
	defer post.Call(window, wmClose, 0, 0)
	scanner := bufio.NewScanner(os.Stdin)
	for scanner.Scan() {
		var next status
		if json.Unmarshal(scanner.Bytes(), &next) != nil || labels[next.Action] == "" {
			continue
		}
		select {
		case <-updates:
		default:
		}
		updates <- next
		post.Call(window, wmUpdate, 0, 0)
	}
}

func main() {
	runtime.LockOSThread()
	if result, _, err := user.NewProc("SetProcessDpiAwarenessContext").Call(^uintptr(3)); result == 0 {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	active, _, _ := user.NewProc("GetForegroundWindow").Call()
	fallback, _, _ = monitorFromWindow.Call(active, 1)
	instance, _, _ := kernel.NewProc("GetModuleHandleW").Call(0)
	name := wide("UiAutomationTaskCapsule")
	class := windowClass{procedure: syscall.NewCallback(windowProc), instance: instance, name: name}
	user.NewProc("RegisterClassW").Call(uintptr(unsafe.Pointer(&class)))
	window, _, err := user.NewProc("CreateWindowExW").Call(windowStyles, uintptr(unsafe.Pointer(name)), uintptr(unsafe.Pointer(wide("UI Automation"))), 0x80000000, 0, 0, 1, 1, 0, 0, instance, 0)
	if window == 0 {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	// Keep the animated overlay visible to the user and out of task screenshots.
	user.NewProc("SetWindowDisplayAffinity").Call(window, 0x11) // WDA_EXCLUDEFROMCAPTURE
	updateAnimationPreference()
	user.NewProc("SetTimer").Call(window, 1, 33, 0)
	go readStatus(window)
	getMessage := user.NewProc("GetMessageW")
	dispatch := user.NewProc("DispatchMessageW")
	var msg message
	for {
		result, _, _ := getMessage.Call(uintptr(unsafe.Pointer(&msg)), 0, 0, 0)
		if int32(result) <= 0 {
			break
		}
		dispatch.Call(uintptr(unsafe.Pointer(&msg)))
	}
}
