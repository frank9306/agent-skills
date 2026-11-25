package main

import (
	"context"
	"embed"
	"flag"
	"fmt"
	"io/fs"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"time"

	"desktop-preview/internal/player"
	"github.com/egoist/mygo"
)

//go:embed all:web
var assets embed.FS

//go:embed icon.png
var brandIcon []byte

func main() {
	source := flag.String("connect", "", "capture source HTTP base URL")
	dir := flag.String("record", "", "new output directory")
	encoder := flag.String("ffmpeg", "ffmpeg", "FFmpeg path")
	replay := flag.String("replay", "", "open a saved recording directory")
	headless := flag.Bool("headless", false, "serve preview without a window")
	flag.Parse()
	if (*replay == "") == (*source == "") {
		log.Fatal("provide --connect to record or --replay to view an existing recording")
	}
	var session *player.Player
	var key string
	if *replay != "" {
		var err error
		session, err = player.OpenRecording(*replay)
		if err != nil {
			log.Fatal(err)
		}
	} else {
		target, err := url.Parse(*source)
		if err != nil || target.Scheme != "http" || target.Hostname() == "" || target.User != nil ||
			target.RawQuery != "" || target.Fragment != "" || target.Path != "" {
			log.Fatal("provide a capture source origin")
		}
		key = os.Getenv("FRANKS_PREVIEW_TOKEN")
		if len(key) < 24 {
			log.Fatal("missing session token")
		}
		if *dir == "" {
			log.Fatal("provide a new recording directory")
		}
		absolute, err := filepath.Abs(*dir)
		if err != nil {
			log.Fatal(err)
		}
		if err := os.Mkdir(absolute, 0700); err != nil {
			log.Fatal(err)
		}
		session = player.New(absolute)
	}
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		log.Fatal(err)
	}
	endpoint := "http://" + listener.Addr().String()
	fmt.Println(endpoint)
	ui, err := fs.Sub(assets, "web")
	if err != nil {
		log.Fatal(err)
	}
	mux := http.NewServeMux()
	session.Register(mux)
	mux.Handle("/", http.FileServer(http.FS(ui)))
	server := &http.Server{Handler: mux, ReadHeaderTimeout: 5 * time.Second}
	go server.Serve(listener)
	defer server.Close()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	if *source != "" {
		go func() {
			if err := session.Receive(ctx, *source, key, *encoder); err != nil {
				log.Print(err)
			}
		}()
	}
	if *headless {
		select {}
	}
	mygo.App.SetName("桌面测试播放器")
	mygo.App.WhenReady(func() {
		window := mygo.NewWindow(mygo.WindowOptions{Title: "桌面测试播放器", URL: endpoint,
			Width: 1450, Height: 900, MinWidth: 840, MinHeight: 580})
		if err := window.SetIcon(brandIcon); err != nil {
			log.Print(err)
		}
	})
	mygo.App.Run()
}
