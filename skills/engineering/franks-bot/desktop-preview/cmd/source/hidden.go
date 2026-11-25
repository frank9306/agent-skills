//go:build windows

package main

import (
	"errors"
	"fmt"
	"regexp"
	"runtime"
	"syscall"
	"unsafe"
)

var (
	getWindowThread    = user32.NewProc("GetWindowThreadProcessId")
	getThreadDesktop   = user32.NewProc("GetThreadDesktop")
	openDesktop        = user32.NewProc("OpenDesktopW")
	closeDesktop       = user32.NewProc("CloseDesktop")
	setThreadDesktop   = user32.NewProc("SetThreadDesktop")
	enumDesktopWindows = user32.NewProc("EnumDesktopWindows")
	visibleWindow      = user32.NewProc("IsWindowVisible")
	iconicWindow       = user32.NewProc("IsIconic")
	windowRect         = user32.NewProc("GetWindowRect")
	printWindow        = user32.NewProc("PrintWindow")
	getCurrentThread   = syscall.NewLazyDLL("kernel32.dll").NewProc("GetCurrentThreadId")
	testDesktop        = regexp.MustCompile("^FranksBot_[0-9a-f]{32}$")
)

type rectangle struct{ Left, Top, Right, Bottom int32 }

type hiddenCapture struct {
	screen   *screenCapture
	desktop  uintptr
	original uintptr
	callback uintptr
	windows  []uintptr
}

func openHidden(window uintptr, process uint32, desktopName string) (*hiddenCapture, error) {
	if !testDesktop.MatchString(desktopName) {
		return nil, errors.New("capture requires a dedicated franks-bot hidden desktop")
	}
	name, err := syscall.UTF16PtrFromString(desktopName)
	if err != nil {
		return nil, err
	}
	handle, _, err := openDesktop.Call(uintptr(unsafe.Pointer(name)), 0, 0, 0x83)
	if handle == 0 {
		return nil, fmt.Errorf("open hidden desktop: %w", err)
	}
	runtime.LockOSThread()
	id, _, _ := getCurrentThread.Call()
	original, _, _ := getThreadDesktop.Call(id)
	if ok, _, failure := setThreadDesktop.Call(handle); ok == 0 {
		closeDesktop.Call(handle)
		runtime.UnlockOSThread()
		return nil, fmt.Errorf("bind capture thread: %w", failure)
	}
	capture := &hiddenCapture{desktop: handle, original: original}
	var owner uint32
	thread, _, _ := getWindowThread.Call(window, uintptr(unsafe.Pointer(&owner)))
	if window == 0 || thread == 0 || owner == 0 || owner != process {
		capture.close()
		return nil, errors.New("hidden test window identity changed")
	}
	// One callback per process: the capture source accepts exactly one feed.
	capture.callback = syscall.NewCallback(capture.collectWindow)
	bound := false
	capture.enumerate()
	for _, candidate := range capture.windows {
		if candidate == window {
			bound = true
			break
		}
	}
	if !bound {
		capture.close()
		return nil, errors.New("the referenced test window is absent from the dedicated desktop")
	}
	capture.screen, err = openScreen()
	if err != nil {
		capture.close()
		return nil, err
	}
	return capture, nil
}

func (h *hiddenCapture) collectWindow(hwnd, _ uintptr) uintptr {
	visible, _, _ := visibleWindow.Call(hwnd)
	iconic, _, _ := iconicWindow.Call(hwnd)
	if visible != 0 && iconic == 0 {
		h.windows = append(h.windows, hwnd)
	}
	return 1
}

func (h *hiddenCapture) enumerate() bool {
	h.windows = h.windows[:0]
	ok, _, _ := enumDesktopWindows.Call(h.desktop, h.callback, 0)
	return ok != 0
}

func (h *hiddenCapture) close() {
	if h.screen != nil {
		h.screen.close()
	}
	setThreadDesktop.Call(h.original)
	closeDesktop.Call(h.desktop)
	runtime.UnlockOSThread()
}

func (h *hiddenCapture) read() bool {
	s := h.screen
	// An inactive desktop has no display output. Paint its own windows onto
	// a neutral surface, keeping their desktop coordinates and stacking order.
	for i := 0; i < len(s.bits); i += 4 {
		s.bits[i], s.bits[i+1], s.bits[i+2], s.bits[i+3] = 49, 34, 27, 255
	}
	if !h.enumerate() {
		return false
	}
	for i := len(h.windows) - 1; i >= 0; i-- {
		h.paint(h.windows[i])
	}
	gdiFlush.Call()
	return true
}

func (h *hiddenCapture) paint(hwnd uintptr) {
	s := h.screen
	var box rectangle
	ok, _, _ := windowRect.Call(hwnd, uintptr(unsafe.Pointer(&box)))
	width, height := int(box.Right-box.Left), int(box.Bottom-box.Top)
	if ok == 0 || width <= 0 || height <= 0 || width > 8192 || height > 8192 {
		return
	}
	dc, _, _ := createDC.Call(s.dc)
	if dc == 0 {
		return
	}
	defer deleteDC.Call(dc)
	bitmap, _, _ := createCompatibleBitmap.Call(s.dc, uintptr(width), uintptr(height))
	if bitmap == 0 {
		return
	}
	defer deleteObject.Call(bitmap)
	old, _, _ := selectObject.Call(dc, bitmap)
	defer selectObject.Call(dc, old)
	printed, _, _ := printWindow.Call(hwnd, dc, 2)
	if printed == 0 {
		return
	}
	x := (int(box.Left) - s.left) * s.width / s.nativeWidth
	y := (int(box.Top) - s.top) * s.height / s.nativeHeight
	stretchBlt.Call(s.memory, uintptr(x), uintptr(y), uintptr(width*s.width/s.nativeWidth),
		uintptr(height*s.height/s.nativeHeight), dc, 0, 0, uintptr(width), uintptr(height), 0xcc0020)
}
