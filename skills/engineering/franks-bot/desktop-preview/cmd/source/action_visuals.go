//go:build windows

package main

import "unsafe"

var polygon = gdi32.NewProc("Polygon")

type point struct{ X, Y int32 }

func (s *screenCapture) drawPointer(x, y, scale int, motion pointerMotion, accent uintptr) {
	if motion.echo > 0 {
		s.ring(x, y, motion.echo*scale, scale, 0xD59D55)
	}
	if motion.radius > 0 {
		s.ring(x, y, motion.radius*scale, motion.stroke*scale, accent)
	}
	x += motion.offset * scale
	y += motion.offset * scale
	outline, _, _ := createPen.Call(0, uintptr(2*scale), 0x292219)
	shape, _, _ := solidBrush.Call(0xFFF4E6)
	if outline == 0 || shape == 0 {
		if outline != 0 {
			deleteObject.Call(outline)
		}
		if shape != 0 {
			deleteObject.Call(shape)
		}
		return
	}
	defer deleteObject.Call(outline)
	defer deleteObject.Call(shape)
	oldPen, _, _ := selectObject.Call(s.memory, outline)
	defer selectObject.Call(s.memory, oldPen)
	oldBrush, _, _ := selectObject.Call(s.memory, shape)
	defer selectObject.Call(s.memory, oldBrush)
	points := [...]point{{0, 0}, {0, 24}, {6, 18}, {11, 26}, {15, 24}, {10, 16}, {20, 16}}
	for index, item := range points {
		points[index] = point{int32(x + int(item.X)*scale), int32(y + int(item.Y)*scale)}
	}
	polygon.Call(s.memory, uintptr(unsafe.Pointer(&points[0])), uintptr(len(points)))
}

func (s *screenCapture) drawCaret(bounds rectangle, scale int, tint uintptr) {
	if bounds.Right-bounds.Left < int32(15*scale) || bounds.Bottom-bounds.Top < int32(8*scale) {
		return
	}
	brush, _, _ := solidBrush.Call(tint)
	if brush == 0 {
		return
	}
	defer deleteObject.Call(brush)
	x := bounds.Left + int32(6*scale)
	y := bounds.Top + int32(4*scale)
	bottom := min(bounds.Bottom-int32(3*scale), y+int32(21*scale))
	line := rectangle{x, y, x + int32(2*scale), bottom}
	fillRect.Call(s.memory, uintptr(unsafe.Pointer(&line)), brush)
}

func (s *screenCapture) drawKeycaps(x, y, scale int, active int, accent uintptr) {
	outline, _, _ := solidBrush.Call(0x9C9388)
	highlight, _, _ := solidBrush.Call(accent)
	if outline != 0 {
		defer deleteObject.Call(outline)
	}
	if highlight != 0 {
		defer deleteObject.Call(highlight)
	}
	for index := 0; index < 3; index++ {
		left := x + index*15*scale
		top := y
		if index == active {
			top += 3 * scale
		}
		box := rectangle{int32(left), int32(top), int32(left + 12*scale), int32(top + 14*scale)}
		if index == active && highlight != 0 {
			fillRect.Call(s.memory, uintptr(unsafe.Pointer(&box)), highlight)
		} else if outline != 0 {
			frameRect.Call(s.memory, uintptr(unsafe.Pointer(&box)), outline)
		}
	}
}
