//go:build windows

package main

type pointerMotion struct {
	offset int
	radius int
	stroke int
	echo   int
}

func mouseMotion(elapsed int) pointerMotion {
	motion := pointerMotion{offset: max(0, 24-elapsed*24/240)}
	if elapsed >= 120 && elapsed < 920 {
		progress := elapsed - 120
		motion.radius = 8 + 37*progress/800
		motion.stroke = max(1, 4-3*progress/800)
	}
	if elapsed >= 340 && elapsed < 1000 {
		motion.echo = 6 + 39*(elapsed-340)/660
	}
	return motion
}

type typingMotion struct {
	key   int
	caret bool
}

func keyboardMotion(elapsed int) typingMotion {
	state := typingMotion{key: -1, caret: elapsed%600 < 330}
	if elapsed < 1200 {
		state.key = (elapsed / 180) % 3
	}
	return state
}
