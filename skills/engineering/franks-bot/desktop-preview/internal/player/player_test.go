package player

import (
	"bytes"
	"context"
	"encoding/json"
	"image"
	"image/jpeg"
	"mime"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os/exec"
	"testing"
	"time"

	"desktop-preview/internal/feed"
)

func TestLiveFeedAndSeekableReplay(t *testing.T) {
	ffmpeg, err := exec.LookPath("ffmpeg")
	if err != nil {
		t.Skip("ffmpeg unavailable")
	}
	var jpegFrame bytes.Buffer
	if err := jpeg.Encode(&jpegFrame, image.NewRGBA(image.Rect(0, 0, 1600, 24)), nil); err != nil {
		t.Fatal(err)
	}
	release := make(chan struct{})
	defer func() {
		select {
		case <-release:
		default:
			close(release)
		}
	}()
	const token = "desktop-test-token-1234567890"
	source := httptest.NewServer(feed.Authorize(token, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		enc := json.NewEncoder(w)
		first := feed.Frame{Index: 0, FPS: 2, Width: 1600, Height: 24, JPEG: jpegFrame.Bytes(), Step: feed.Step{Name: "选择附件"}}
		_ = enc.Encode(first)
		_ = http.NewResponseController(w).Flush()
		select {
		case <-release:
		case <-r.Context().Done():
			return
		}
		first.Index++
		first.Step = feed.Step{Name: "结束", Finished: true}
		_ = enc.Encode(first)
	})))
	defer source.Close()
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()
	directory := t.TempDir()
	p := New(directory)
	mux := http.NewServeMux()
	p.Register(mux)
	server := httptest.NewServer(mux)
	defer server.Close()
	done := make(chan error, 1)
	go func() { done <- p.Receive(ctx, source.URL, token, ffmpeg) }()
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, server.URL+"/live", nil)
	if err != nil {
		t.Fatal(err)
	}
	live, err := http.DefaultClient.Do(request)
	if err != nil {
		t.Fatal(err)
	}
	defer live.Body.Close()
	_, attributes, err := mime.ParseMediaType(live.Header.Get("Content-Type"))
	if err != nil {
		t.Fatal(err)
	}
	part, err := multipart.NewReader(live.Body, attributes["boundary"]).NextPart()
	if err != nil {
		t.Fatalf("read high-resolution live frame: %v", err)
	}
	geometry, err := jpeg.DecodeConfig(part)
	if err != nil || geometry.Width != 1600 || geometry.Height != 24 {
		t.Fatalf("live frame resolution: %+v (%v)", geometry, err)
	}
	live.Body.Close()
	state, _, _ := p.snapshot()
	if state.Phase != "live" || state.Step != "选择附件" {
		t.Fatalf("unexpected live state: %+v", state)
	}
	close(release)
	if err := <-done; err != nil {
		t.Fatal(err)
	}
	state, _, _ = p.snapshot()
	if state.Phase != "ready" || len(state.Events) != 2 || state.Events[1].Time != 0.5 {
		t.Fatalf("unexpected replay state: %+v", state)
	}
	reopened, err := OpenRecording(directory)
	if err != nil {
		t.Fatal(err)
	}
	state, _, _ = reopened.snapshot()
	if state.Phase != "ready" || len(state.Events) != 2 || state.Events[1].Time != 0.5 {
		t.Fatalf("reopened recording: %+v", state)
	}
	mux = http.NewServeMux()
	reopened.Register(mux)
	seek := httptest.NewRequest(http.MethodGet, "/replay.mp4", nil)
	seek.Header.Set("Range", "bytes=4-7")
	result := httptest.NewRecorder()
	mux.ServeHTTP(result, seek)
	if result.Code != http.StatusPartialContent || result.Body.String() != "ftyp" {
		t.Fatalf("replay range: %d, %q", result.Code, result.Body.String())
	}
}
