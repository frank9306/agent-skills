//go:build windows

package main

import (
	"encoding/json"
	"strings"
	"syscall"
	"unicode/utf8"
	"unsafe"
)

var (
	gdiFlush     = gdi32.NewProc("GdiFlush")
	solidBrush   = gdi32.NewProc("CreateSolidBrush")
	createPen    = gdi32.NewProc("CreatePen")
	stockObject  = gdi32.NewProc("GetStockObject")
	ellipse      = gdi32.NewProc("Ellipse")
	makeFont     = gdi32.NewProc("CreateFontW")
	setBG        = gdi32.NewProc("SetBkMode")
	setTextColor = gdi32.NewProc("SetTextColor")
	drawText     = user32.NewProc("DrawTextW")
	fillRect     = user32.NewProc("FillRect")
	frameRect    = user32.NewProc("FrameRect")
)

type actionMark struct {
	ID     int        `json:"id"`
	Kind   string     `json:"kind"`
	Label  string     `json:"label"`
	Sample string     `json:"sample,omitempty"`
	Bounds *rectangle `json:"bounds,omitempty"`
}

func readAction(path string) (actionMark, bool) {
	var value actionMark
	if path == "" {
		return value, false
	}
	data, err := readSignal(path)
	if err != nil || len(data) > 4096 || json.Unmarshal(data, &value) != nil {
		return value, false
	}
	if value.ID <= 0 || value.Label == "" || !utf8.ValidString(value.Label) || len(value.Label) > 160 ||
		(value.Kind != "click" && value.Kind != "type" && value.Kind != "toggle") ||
		(value.Sample != "" && (value.Kind != "type" || len(value.Sample) > 160)) {
		return value, false
	}
	return value, true
}

func (s *screenCapture) highlight(value actionMark, elapsed int) {
	scale := max(1, s.height/720)
	accent := uintptr(0xF4DB58)
	verb := "鼠标点击"
	typing := value.Kind == "type"
	keys := keyboardMotion(elapsed)
	if typing {
		accent = 0x58C8FF
		verb = "键盘输入"
	}
	text := verb + " · " + value.Label
	if typing {
		if value.Sample != "" {
			text += "  「" + value.Sample + "」"
		} else {
			text += "  内容已隐藏"
		}
	}
	posX, posY := 28*scale, 25*scale
	brush, _, _ := solidBrush.Call(accent)
	if brush == 0 {
		return
	}
	defer deleteObject.Call(brush)
	if box := value.Bounds; box != nil {
		x1 := (int(box.Left) - s.left) * s.width / s.nativeWidth
		y1 := (int(box.Top) - s.top) * s.height / s.nativeHeight
		x2 := (int(box.Right) - s.left) * s.width / s.nativeWidth
		y2 := (int(box.Bottom) - s.top) * s.height / s.nativeHeight
		if x2 > x1 && y2 > y1 && x2 > 0 && y2 > 0 && x1 < s.width && y1 < s.height {
			pad := 3 * scale
			for offset := 0; offset < 3*scale; offset++ {
				rect := rectangle{int32(x1 - pad - offset), int32(y1 - pad - offset), int32(x2 + pad + offset), int32(y2 + pad + offset)}
				frameRect.Call(s.memory, uintptr(unsafe.Pointer(&rect)), brush)
			}
			if typing {
				if keys.caret {
					s.drawCaret(rectangle{int32(x1), int32(y1), int32(x2), int32(y2)}, scale, accent)
				}
			} else {
				s.drawPointer((x1+x2)/2, (y1+y2)/2, scale, mouseMotion(elapsed), accent)
			}
			posX = max(20*scale, min(x1, s.width-830*scale))
			posY = y1 - 61*scale
			if posY < 6*scale {
				posY = min(y2+14*scale, s.height-55*scale)
			}
		}
	}
	s.actionLabel(posX, posY, scale, text, accent, typing, keys.key)
}

func (s *screenCapture) ring(x, y, radius, stroke int, accent uintptr) {
	pen, _, _ := createPen.Call(0, uintptr(stroke), accent)
	if pen == 0 {
		return
	}
	defer deleteObject.Call(pen)
	oldPen, _, _ := selectObject.Call(s.memory, pen)
	defer selectObject.Call(s.memory, oldPen)
	empty, _, _ := stockObject.Call(5)
	oldBrush, _, _ := selectObject.Call(s.memory, empty)
	defer selectObject.Call(s.memory, oldBrush)
	ellipse.Call(s.memory, uintptr(x-radius), uintptr(y-radius), uintptr(x+radius), uintptr(y+radius))
}

func (s *screenCapture) actionLabel(x, y, scale int, text string, accent uintptr, typing bool, activeKey int) {
	height := 47 * scale
	inset := 15 * scale
	if typing {
		inset += 53 * scale
	}
	width := min(s.width-x-10*scale, max(250*scale, (utf8.RuneCountInString(text)*24+28)*scale+inset))
	if width < 120*scale {
		return
	}
	back, _, _ := solidBrush.Call(0x31241B)
	if back == 0 {
		return
	}
	defer deleteObject.Call(back)
	bounds := rectangle{int32(x), int32(y), int32(x + width), int32(y + height)}
	fillRect.Call(s.memory, uintptr(unsafe.Pointer(&bounds)), back)
	border, _, _ := solidBrush.Call(accent)
	if border != 0 {
		frameRect.Call(s.memory, uintptr(unsafe.Pointer(&bounds)), border)
		deleteObject.Call(border)
	}
	if typing {
		s.drawKeycaps(x+13*scale, y+15*scale, scale, activeKey, accent)
	}
	bounds.Left += int32(inset)
	bounds.Right -= int32(12 * scale)
	family, _ := syscall.UTF16PtrFromString("Microsoft YaHei UI")
	fontSize := -23 * scale
	font, _, _ := makeFont.Call(uintptr(fontSize), 0, 0, 0, 600, 0, 0, 0, 1, 0, 0, 4, 0, uintptr(unsafe.Pointer(family)))
	if font != 0 {
		defer deleteObject.Call(font)
		old, _, _ := selectObject.Call(s.memory, font)
		defer selectObject.Call(s.memory, old)
	}
	setBG.Call(s.memory, 1)
	setTextColor.Call(s.memory, 0xFFFFFF)
	value, err := syscall.UTF16PtrFromString(strings.ReplaceAll(text, "\x00", ""))
	if err == nil {
		drawText.Call(s.memory, uintptr(unsafe.Pointer(value)), ^uintptr(0), uintptr(unsafe.Pointer(&bounds)), 0x8824)
	}
}
