//go:build windows

package main

import (
	"errors"
	"image"

	"runtime"
	"syscall"
	"unsafe"

	"desktop-preview/internal/feed"
)

var (
	user32     = syscall.NewLazyDLL("user32.dll")
	gdi32      = syscall.NewLazyDLL("gdi32.dll")
	getMetrics = user32.NewProc("GetSystemMetrics")
	getDC      = user32.NewProc("GetDC")
	releaseDC  = user32.NewProc("ReleaseDC")

	setDPI                 = user32.NewProc("SetProcessDpiAwarenessContext")
	createDC               = gdi32.NewProc("CreateCompatibleDC")
	createCompatibleBitmap = gdi32.NewProc("CreateCompatibleBitmap")
	deleteDC               = gdi32.NewProc("DeleteDC")
	createDIB              = gdi32.NewProc("CreateDIBSection")
	deleteObject           = gdi32.NewProc("DeleteObject")
	selectObject           = gdi32.NewProc("SelectObject")
	stretchBlt             = gdi32.NewProc("StretchBlt")
	setStretchMode         = gdi32.NewProc("SetStretchBltMode")
)

type bitmapInfo struct {
	Size                   uint32
	Width, Height          int32
	Planes, Bits           uint16
	Compression, ImageSize uint32
	X, Y                   int32
	Used, Important        uint32
}

type screenCapture struct {
	dc, memory, bitmap, previous                        uintptr
	bits                                                []byte
	image                                               *image.RGBA
	left, top, nativeWidth, nativeHeight, width, height int
}

func metric(index uintptr) int { value, _, _ := getMetrics.Call(index); return int(int32(value)) }

func openScreen() (*screenCapture, error) {
	runtime.LockOSThread()
	if setDPI.Find() == nil {
		setDPI.Call(^uintptr(3))
	}
	s := &screenCapture{left: metric(76), top: metric(77), nativeWidth: metric(78), nativeHeight: metric(79)}
	if s.nativeWidth <= 0 || s.nativeHeight <= 0 {
		runtime.UnlockOSThread()
		return nil, errors.New("no active display")
	}
	s.width = min(feed.MaxWidth, s.nativeWidth)
	s.height = s.nativeHeight * s.width / s.nativeWidth
	if s.height > feed.MaxHeight {
		s.width = s.width * feed.MaxHeight / s.height
		s.height = feed.MaxHeight
	}
	s.width = s.width &^ 1
	s.height = s.height &^ 1
	s.dc, _, _ = getDC.Call(0)
	if s.dc != 0 {
		s.memory, _, _ = createDC.Call(s.dc)
	}
	if s.memory == 0 {
		s.close()
		return nil, errors.New("cannot open desktop graphics context")
	}
	info := bitmapInfo{Size: 40, Width: int32(s.width), Height: -int32(s.height), Planes: 1, Bits: 32}
	var data unsafe.Pointer
	s.bitmap, _, _ = createDIB.Call(s.memory, uintptr(unsafe.Pointer(&info)), 0, uintptr(unsafe.Pointer(&data)), 0, 0)
	if s.bitmap == 0 || data == nil {
		s.close()
		return nil, errors.New("cannot allocate desktop frame")
	}
	s.previous, _, _ = selectObject.Call(s.memory, s.bitmap)
	setStretchMode.Call(s.memory, 4)
	s.bits = unsafe.Slice((*byte)(data), s.width*s.height*4)
	s.image = image.NewRGBA(image.Rect(0, 0, s.width, s.height))
	return s, nil
}

func (s *screenCapture) close() {
	if s.previous != 0 {
		selectObject.Call(s.memory, s.previous)
	}
	if s.bitmap != 0 {
		deleteObject.Call(s.bitmap)
	}
	if s.memory != 0 {
		deleteDC.Call(s.memory)
	}
	if s.dc != 0 {
		releaseDC.Call(0, s.dc)
	}
	runtime.UnlockOSThread()
}

func (s *screenCapture) convert() {
	for i := 0; i < len(s.bits); i += 4 {
		s.image.Pix[i], s.image.Pix[i+1], s.image.Pix[i+2], s.image.Pix[i+3] = s.bits[i+2], s.bits[i+1], s.bits[i], 255
	}
}
