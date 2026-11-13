package main

import "testing"

func TestCapsuleEdgeCoverage(t *testing.T) {
	for _, dpi := range []uint32{96, 120, 144, 192} {
		width, height := px(440, dpi), px(44, dpi)
		mask := capsuleMask(width, height, px(1, dpi))
		fractional := 0
		for y := int32(0); y < height; y++ {
			for x := int32(0); x < height/2; x++ {
				left := mask[y*width+x]
				right := mask[y*width+width-1-x]
				if left != right {
					t.Fatalf("asymmetric ends at DPI %d, pixel (%d,%d)", dpi, x, y)
				}
				if left.outer > 0 && left.outer < sampleCount {
					fractional++
				}
			}
		}
		if fractional == 0 || mask[0].outer != 0 || mask[(height/2)*width+width/2].inner != sampleCount {
			t.Fatalf("expected transparent corners, blended ends and opaque interior at DPI %d", dpi)
		}
	}
}

func TestSurfacePremultipliesEdgeWithoutDarkeningInterior(t *testing.T) {
	mask := []coverage{{0, 0}, {8, 0}, {16, 16}}
	pixels := make([]uint32, len(mask))
	fillSurface(pixels, mask, rgb(20, 40, 60), rgb(80, 100, 120))
	premultiplySurface(pixels, mask)
	want := []uint32{0, 0x8028323c, 0xff14283c}
	for i := range want {
		if pixels[i] != want[i] {
			t.Fatalf("pixel %d: got %#08x, want %#08x", i, pixels[i], want[i])
		}
	}
}

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
