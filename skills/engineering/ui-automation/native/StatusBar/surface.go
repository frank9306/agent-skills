package main

import "unsafe"

const samplesPerAxis = 4
const sampleCount = samplesPerAxis * samplesPerAxis

type coverage struct{ outer, inner uint8 }

func capsuleMask(width, height, border int32) []coverage {
	mask := make([]coverage, int(width*height))
	// Use integer subpixel coordinates so opposite edges get identical coverage.
	const units = 2 * samplesPerAxis
	radius := min(width, height) * units / 2
	right := width*units - radius
	inner := max(0, radius-border*units)
	for y := int32(0); y < height; y++ {
		for x := int32(0); x < width; x++ {
			pixel := &mask[y*width+x]
			for sy := int32(1); sy < units; sy += 2 {
				dy := y*units + sy - height*units/2
				for sx := int32(1); sx < units; sx += 2 {
					sampleX := x*units + sx
					dx := sampleX - min(right, max(radius, sampleX))
					distance := dx*dx + dy*dy
					if distance <= radius*radius {
						pixel.outer++
					}
					if inner > 0 && distance <= inner*inner {
						pixel.inner++
					}
				}
			}
		}
	}
	return mask
}

type bitmapInfo struct {
	size          uint32
	width, height int32
	planes, bits  uint16
	compression   uint32
	imageSize     uint32
	xPels, yPels  int32
	used, needed  uint32
}

var (
	createDIB   = gdi.NewProc("CreateDIBSection")
	updateLayer = user.NewProc("UpdateLayeredWindow")
	surfaceMask []coverage
	surface     layerBuffer
)

type layerBuffer struct {
	dc, bitmap, original uintptr
	size                 point
	pixels               []uint32
}

func (buffer *layerBuffer) close() {
	if buffer.dc != 0 {
		selectObject.Call(buffer.dc, buffer.original)
		deleteObject.Call(buffer.bitmap)
		deleteDC.Call(buffer.dc)
	}
	*buffer = layerBuffer{}
}

func (buffer *layerBuffer) resize(size point) bool {
	if buffer.size == size && buffer.dc != 0 {
		return true
	}
	buffer.close()
	dc, _, _ := compatibleDC.Call(0)
	if dc == 0 {
		return false
	}
	info := bitmapInfo{size: uint32(unsafe.Sizeof(bitmapInfo{})), width: size.x, height: -size.y, planes: 1, bits: 32}
	var bits unsafe.Pointer
	bitmap, _, _ := createDIB.Call(dc, uintptr(unsafe.Pointer(&info)), 0, uintptr(unsafe.Pointer(&bits)), 0, 0)
	if bitmap == 0 || bits == nil {
		deleteDC.Call(dc)
		return false
	}
	original, _, _ := selectObject.Call(dc, bitmap)
	*buffer = layerBuffer{dc, bitmap, original, size, unsafe.Slice((*uint32)(bits), int(size.x*size.y))}
	return true
}

func colorChannels(color uintptr) [3]uint32 {
	return [3]uint32{uint32(color>>16) & 255, uint32(color>>8) & 255, uint32(color) & 255}
}

func fillSurface(pixels []uint32, mask []coverage, background, border uintptr) {
	bg, edge := colorChannels(background), colorChannels(border)
	for index, pixel := range mask {
		outer, inner := uint32(pixel.outer), uint32(pixel.inner)
		if outer == 0 {
			pixels[index] = 0
			continue
		}
		pixels[index] = 0
		for channel := range bg {
			color := (bg[channel]*inner + edge[channel]*(outer-inner) + outer/2) / outer
			pixels[index] |= color << (8 * channel)
		}
	}
}

func premultiplySurface(pixels []uint32, mask []coverage) {
	for index, pixel := range mask {
		alpha := (uint32(pixel.outer)*255 + sampleCount/2) / sampleCount
		color := pixels[index]
		if alpha == 255 {
			pixels[index] = color | 0xff000000
			continue
		}
		pixels[index] = alpha << 24
		for shift := 0; shift < 24; shift += 8 {
			pixels[index] |= (((color>>shift)&255)*alpha + 127) / 255 << shift
		}
	}
}

func paintLayer(window uintptr) {
	width, height := placement.right-placement.left, placement.bottom-placement.top
	if width <= 0 || height <= 0 {
		return
	}
	size, origin := point{width, height}, point{}
	if !surface.resize(size) {
		return
	}
	paint(surface.dc, surface.pixels)
	gdi.NewProc("GdiFlush").Call()
	premultiplySurface(surface.pixels, surfaceMask)
	// BLENDFUNCTION: AC_SRC_OVER, flags 0, opacity 255, AC_SRC_ALPHA.
	blend := [4]byte{0, 0, 255, 1}
	updateLayer.Call(window, 0, 0, uintptr(unsafe.Pointer(&size)), surface.dc, uintptr(unsafe.Pointer(&origin)), 0, uintptr(unsafe.Pointer(&blend[0])), 2)
}
