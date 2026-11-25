package player

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"image/jpeg"
	"mime/multipart"
	"net/http"
	"net/textproto"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"sync"
	"time"

	"desktop-preview/internal/feed"
)

type Marker struct {
	Title string  `json:"title"`
	Time  float64 `json:"time"`
}
type State struct {
	Phase  string   `json:"phase"`
	Step   string   `json:"step"`
	Error  string   `json:"error,omitempty"`
	Events []Marker `json:"events"`
}
type Player struct {
	mu      sync.Mutex
	state   State
	changed chan struct{}
	frame   []byte
	dir     string
}

func New(dir string) *Player {
	return &Player{state: State{Phase: "waiting", Events: []Marker{}}, changed: make(chan struct{}), dir: dir}
}

func OpenRecording(dir string) (*Player, error) {
	data, err := os.ReadFile(filepath.Join(dir, "session.json"))
	if err != nil {
		return nil, err
	}
	p := New(dir)
	if err := json.Unmarshal(data, &p.state); err != nil {
		return nil, err
	}
	if p.state.Phase != "ready" {
		return nil, fmt.Errorf("recording is not complete")
	}
	video, err := os.Stat(filepath.Join(dir, "replay.mp4"))
	if err != nil {
		return nil, err
	}
	if !video.Mode().IsRegular() || video.Size() == 0 {
		return nil, fmt.Errorf("recording file is empty")
	}
	return p, nil
}

func (p *Player) update(change func()) {
	p.mu.Lock()
	defer p.mu.Unlock()
	change()
	close(p.changed)
	p.changed = make(chan struct{})
}
func (p *Player) snapshot() (State, []byte, chan struct{}) {
	p.mu.Lock()
	defer p.mu.Unlock()
	state := p.state
	state.Events = append([]Marker{}, state.Events...)
	return state, p.frame, p.changed
}
func (p *Player) end(phase string, err error) {
	p.update(func() {
		p.state.Phase = phase
		if err != nil {
			p.state.Error = err.Error()
		}
	})
}
func (p *Player) Receive(ctx context.Context, source, token, ffmpeg string) (result error) {
	defer func() {
		if result != nil {
			p.end("failed", result)
		}
	}()
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, source+"/feed", nil)
	if err != nil {
		return err
	}
	request.Header.Set("Authorization", "Bearer "+token)
	response, err := (&http.Client{Timeout: 6 * time.Minute}).Do(request)
	if err != nil {
		return fmt.Errorf("capture source unavailable: %w", err)
	}
	defer response.Body.Close()
	if response.StatusCode != 200 {
		return fmt.Errorf("capture source: %s", response.Status)
	}
	rawPath := filepath.Join(p.dir, "recording.mjpeg")
	raw, err := os.OpenFile(rawPath, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0600)
	if err != nil {
		return err
	}
	defer raw.Close()
	reader := bufio.NewScanner(response.Body)
	reader.Buffer(make([]byte, 65536), feed.MaxJPEG*2)
	frames, fps, width, height := 0, 0, 0, 0
	finished := false
	for reader.Scan() {
		var value feed.Frame
		if err = json.Unmarshal(reader.Bytes(), &value); err != nil {
			return err
		}
		if value.FPS < 1 || value.FPS > 15 || value.Index != frames || len(value.JPEG) > feed.MaxJPEG ||
			len(value.JPEG) == 0 || value.Width < 2 || value.Width > feed.MaxWidth || value.Height < 2 || value.Height > feed.MaxHeight ||
			value.Width%2 != 0 || value.Height%2 != 0 || value.Step.Name == "" || len(value.Step.Name) > 300 || frames >= 5400 {
			return fmt.Errorf("invalid or discontinuous video frame %d", frames)
		}
		if frames == 0 {
			fps, width, height = value.FPS, value.Width, value.Height
			config, err := jpeg.DecodeConfig(bytes.NewReader(value.JPEG))
			if err != nil || config.Width != width || config.Height != height {
				return fmt.Errorf("invalid JPEG geometry")
			}
		}
		if value.FPS != fps || value.Width != width || value.Height != height {
			return fmt.Errorf("capture format changed")
		}
		if _, err = raw.Write(value.JPEG); err != nil {
			return err
		}
		elapsed := float64(frames) / float64(fps)
		p.update(func() {
			if p.state.Step != value.Step.Name {
				p.state.Events = append(p.state.Events, Marker{Title: value.Step.Name, Time: elapsed})
			}
			p.state.Phase, p.state.Step, p.frame = "live", value.Step.Name, value.JPEG
		})
		frames++
		if value.Step.Finished {
			finished = true
			break
		}
	}
	if err = reader.Err(); err != nil {
		return err
	}
	if !finished || frames < 2 {
		return fmt.Errorf("capture disconnected before completion")
	}
	if err = raw.Close(); err != nil {
		return err
	}
	p.end("encoding", nil)
	temporary := filepath.Join(p.dir, "replay.partial.mp4")
	command := exec.CommandContext(ctx, ffmpeg, "-hide_banner", "-loglevel", "error", "-n", "-f", "mjpeg",
		"-framerate", strconv.Itoa(fps), "-i", rawPath, "-c:v", "libx264", "-preset", "veryfast", "-crf", "16", "-pix_fmt", "yuv420p",
		"-movflags", "+faststart", temporary)
	command.WaitDelay = 5 * time.Second
	if output, err := command.CombinedOutput(); err != nil {
		return fmt.Errorf("encode replay: %w: %s", err, output)
	}
	if err = os.Rename(temporary, filepath.Join(p.dir, "replay.mp4")); err != nil {
		return err
	}
	state, _, _ := p.snapshot()
	state.Phase = "ready"
	index, err := json.Marshal(state)
	if err != nil {
		return err
	}
	staging := filepath.Join(p.dir, "session.partial.json")
	if err := os.WriteFile(staging, index, 0600); err != nil {
		return err
	}
	if err := os.Rename(staging, filepath.Join(p.dir, "session.json")); err != nil {
		return err
	}
	_ = os.Remove(rawPath)
	p.end("ready", nil)
	return nil
}

func (p *Player) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/session", func(w http.ResponseWriter, _ *http.Request) {
		state, _, _ := p.snapshot()
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Cache-Control", "no-store")
		json.NewEncoder(w).Encode(state)
	})
	mux.HandleFunc("GET /live", p.live)
	mux.HandleFunc("GET /replay.mp4", func(w http.ResponseWriter, r *http.Request) {
		state, _, _ := p.snapshot()
		if state.Phase != "ready" {
			http.NotFound(w, r)
			return
		}
		http.ServeFile(w, r, filepath.Join(p.dir, "replay.mp4"))
	})
}

func (p *Player) live(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Connection", "close")
	writer := multipart.NewWriter(w)
	w.Header().Set("Content-Type", "multipart/x-mixed-replace; boundary="+writer.Boundary())
	w.Header().Set("Cache-Control", "no-store")
	var last []byte
	for {
		state, frame, changed := p.snapshot()
		if len(frame) > 0 && (len(last) == 0 || &frame[0] != &last[0]) {
			header := make(textproto.MIMEHeader)
			header.Set("Content-Type", "image/jpeg")
			header.Set("Content-Length", strconv.Itoa(len(frame)))
			part, err := writer.CreatePart(header)
			if err != nil {
				return
			}
			if _, err = part.Write(frame); err != nil {
				return
			}
			if http.NewResponseController(w).Flush() != nil {
				return
			}
			last = frame
		}
		if state.Phase == "ready" || state.Phase == "failed" {
			writer.Close()
			return
		}
		select {
		case <-changed:
		case <-r.Context().Done():
			return
		}
	}
}
