package main

import "testing"

func TestLayoutUsesMonitorWorkAreaAndDPI(t *testing.T) {
	cases := []struct {
		name string
		work rect
		dpi  uint32
		want rect
	}{
		{"primary", rect{0, 0, 1920, 1040}, 96, rect{740, 12, 1180, 56}},
		{"left monitor with top taskbar", rect{-2560, 60, 0, 1440}, 144, rect{-1610, 78, -950, 144}},
		{"above primary at 200 percent", rect{0, -2120, 3840, 0}, 192, rect{1480, -2096, 2360, -2008}},
		{"constrained", rect{100, 0, 400, 500}, 144, rect{118, 18, 382, 84}},
	}
	for _, test := range cases {
		t.Run(test.name, func(t *testing.T) {
			if got := layout(test.work, test.dpi); got != test.want {
				t.Fatalf("got %+v, want %+v", got, test.want)
			}
		})
	}
}
