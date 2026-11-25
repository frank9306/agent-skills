package feed

import (
	"crypto/subtle"
	"net/http"
)

const (
	MaxJPEG   = 4 << 20
	MaxWidth  = 3840
	MaxHeight = 2160
)

type Step struct {
	Name     string `json:"name"`
	Finished bool   `json:"finished,omitempty"`
}

type Frame struct {
	Index  int    `json:"index"`
	FPS    int    `json:"fps"`
	JPEG   []byte `json:"jpeg,omitempty"`
	Step   Step   `json:"step"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
}

func Authorize(token string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		provided := r.Header.Get("Authorization")
		if token == "" || subtle.ConstantTimeCompare([]byte(provided), []byte("Bearer "+token)) != 1 {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}
