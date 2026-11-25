//go:build windows

package main

import "testing"

func TestPointerWaveExpandsAndEnds(t *testing.T) {
	start := mouseMotion(250)
	later := mouseMotion(500)
	end := mouseMotion(1200)
	if start.radius <= 0 || later.radius <= start.radius || end.radius != 0 {
		t.Fatalf("pointer wave must expand and end: %+v %+v %+v", start, later, end)
	}
	if mouseMotion(0).offset <= 0 || start.offset != 0 {
		t.Fatal("pointer should arrive at the selected point")
	}
}

func TestKeyboardCyclesThroughKeysAndBlinksCaret(t *testing.T) {
	start := keyboardMotion(0)
	next := keyboardMotion(210)
	if start.key != 0 || next.key != 1 || !start.caret || keyboardMotion(420).caret || !keyboardMotion(650).caret {
		t.Fatalf("expected sequential key highlights and blinking caret: %+v %+v", start, next)
	}
}
