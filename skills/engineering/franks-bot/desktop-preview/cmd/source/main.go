//go:build windows

package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"image/jpeg"
	"log"
	"net"
	"net/http"
	"os"
	"sync/atomic"
	"time"

	"desktop-preview/internal/feed"
)

func main() {
	listen := flag.String("listen", "127.0.0.1:19455", "local capture address")
	stepFile := flag.String("steps", "step.json", "step status from test runner")
	actions := flag.String("actions", "", "optional observed test action file")
	fps := flag.Int("fps", 8, "frames per second")
	duration := flag.Duration("limit", 5*time.Minute, "maximum recording duration")
	hiddenWindow := flag.Uint64("hidden-window", 0, "franks-bot main HWND (required)")
	hiddenPID := flag.Uint("hidden-pid", 0, "franks-bot main PID (required)")
	hiddenName := flag.String("hidden-desktop", "", "dedicated franks-bot desktop name")
	flag.Parse()
	if *hiddenWindow == 0 || *hiddenPID == 0 || *hiddenPID > 0xffffffff {
		log.Fatal("provide the dedicated franks-bot window and PID")
	}
	host, _, err := net.SplitHostPort(*listen)
	if err != nil || host != "127.0.0.1" || *fps < 1 || *fps > 15 || *duration <= 0 {
		log.Fatal("invalid capture configuration")
	}
	key := os.Getenv("FRANKS_PREVIEW_TOKEN")
	if len(key) < 24 {
		log.Fatal("set FRANKS_PREVIEW_TOKEN to a random session token")
	}
	var connected atomic.Bool
	handler := http.NewServeMux()
	handler.Handle("GET /health", feed.Authorize(key, http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) { fmt.Fprintln(w, "ready") })))
	handler.Handle("GET /feed", feed.Authorize(key, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !connected.CompareAndSwap(false, true) {
			http.Error(w, "capture already used", http.StatusConflict)
			return
		}
		capture, err := openHidden(uintptr(*hiddenWindow), uint32(*hiddenPID), *hiddenName)
		if err != nil {
			log.Print(err)
			http.Error(w, err.Error(), http.StatusServiceUnavailable)
			return
		}
		defer capture.close()
		screen := capture.screen
		w.Header().Set("Content-Type", "application/x-ndjson")
		w.Header().Set("Cache-Control", "no-store")
		encoder := json.NewEncoder(w)
		flusher := http.NewResponseController(w)
		tick := time.NewTicker(time.Second / time.Duration(*fps))
		defer tick.Stop()
		stop := time.NewTimer(*duration)
		defer stop.Stop()
		step := feed.Step{Name: "测试桌面已连接"}
		var action actionMark
		actionIndex := 0
		for index := 0; ; index++ {
			if update, ok := readAction(*actions); ok && update.ID != action.ID {
				action, actionIndex = update, index
			}
			if data, err := readSignal(*stepFile); err == nil && len(data) <= 4096 {
				var update feed.Step
				if json.Unmarshal(data, &update) == nil && update.Name != "" {
					step = update
				}
			}
			var frame bytes.Buffer
			valid := capture.read()
			if valid {
				age := index - actionIndex
				if action.ID != 0 && age < *fps*2 {
					screen.highlight(action, age*1000 / *fps)
					gdiFlush.Call()
				}
				screen.convert()
				err = jpeg.Encode(&frame, screen.image, &jpeg.Options{Quality: 91})
			}
			if !valid || err != nil || frame.Len() > feed.MaxJPEG {
				log.Print("screen capture failed")
				return
			}
			select {
			case <-stop.C:
				step.Finished = true
			default:
			}
			if encoder.Encode(feed.Frame{Index: index, FPS: *fps, JPEG: frame.Bytes(), Step: step, Width: screen.width, Height: screen.height}) != nil || flusher.Flush() != nil {
				return
			}
			if step.Finished {
				return
			}
			select {
			case <-r.Context().Done():
				return
			case <-tick.C:
			}
		}
	})))
	server := &http.Server{Addr: *listen, Handler: handler, ReadHeaderTimeout: 5 * time.Second}
	log.Printf("capture source on %s", *listen)
	log.Fatal(server.ListenAndServe())
}
