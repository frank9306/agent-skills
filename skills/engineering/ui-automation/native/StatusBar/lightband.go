package main

import (
	"math"
	"time"
	"unsafe"
)

const orbitDuration = 3 * time.Second

var (
	systemParameters  = user.NewProc("SystemParametersInfoW")
	moveTo            = gdi.NewProc("MoveToEx")
	lineTo            = gdi.NewProc("LineTo")
	animationsEnabled bool
)

func updateAnimationPreference() {
	var enabled int32
	ok, _, _ := systemParameters.Call(0x1042, 0, uintptr(unsafe.Pointer(&enabled)), 0)
	animationsEnabled = ok != 0 && enabled != 0
}

func running(action string) bool {
	switch action {
	case "pass", "fail", "error", "stopped", "unverified":
		return false
	default:
		return true
	}
}

// Start on the top edge and travel clockwise by distance, including around both ends.
func outlinePoint(distance, straight, radius float64) point {
	arc := math.Pi * radius
	distance = math.Mod(distance+2*(straight+arc), 2*(straight+arc))
	x, y := radius+distance, 0.0
	switch {
	case distance < straight:
	case distance < straight+arc:
		angle := (distance - straight) / radius
		x, y = radius+straight+radius*math.Sin(angle), radius-radius*math.Cos(angle)
	case distance < 2*straight+arc:
		x, y = radius+2*straight+arc-distance, 2*radius
	default:
		angle := (distance - 2*straight - arc) / radius
		x, y = radius-radius*math.Sin(angle), radius+radius*math.Cos(angle)
	}
	return point{int32(math.Round(x)), int32(math.Round(y))}
}

func paintLightband(dc uintptr, width, height int32, elapsed time.Duration) {
	inset := max(1, px(1, dpi))
	radius := float64(min(width, height)-2*inset-1) / 2
	if radius <= 0 {
		return
	}
	straight := float64(width-2*inset-1) - 2*radius
	perimeter := 2 * (straight + math.Pi*radius)
	phase := 0.15
	if animationsEnabled {
		phase = float64(elapsed%orbitDuration) / float64(orbitDuration)
	}
	center := phase * perimeter
	halfBand := min(float64(px(55, dpi)), perimeter/6)
	const segments = 28
	step := 2 * halfBand / segments
	from := outlinePoint(center-halfBand, straight, radius)
	for segment := 0; segment < segments; segment++ {
		distance := center - halfBand + float64(segment+1)*step
		to := outlinePoint(distance, straight, radius)
		brightness := math.Sin(math.Pi * (float64(segment) + 0.5) / segments)
		brightness *= brightness
		ink := rgb(66+uint32(158*brightness), 81+uint32(167*brightness), 108+uint32(147*brightness))
		pen, _, _ := createPen.Call(0, uintptr(max(1, px(2, dpi))), ink)
		previous, _, _ := selectObject.Call(dc, pen)
		moveTo.Call(dc, uintptr(from.x+inset), uintptr(from.y+inset), 0)
		lineTo.Call(dc, uintptr(to.x+inset), uintptr(to.y+inset))
		selectObject.Call(dc, previous)
		deleteObject.Call(pen)
		from = to
	}
}
