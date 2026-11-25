package feed

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestFeedRejectsMissingCredentials(t *testing.T) {
	handler := Authorize("test-only-key", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))
	for _, sample := range []struct {
		authorization string
		want          int
	}{
		{"", 401}, {"Bearer incorrect", 401}, {"Bearer test-only-key", 204},
	} {
		request := httptest.NewRequest(http.MethodGet, "/feed", nil)
		request.Header.Set("Authorization", sample.authorization)
		response := httptest.NewRecorder()
		handler.ServeHTTP(response, request)
		if response.Code != sample.want {
			t.Fatalf("%q: got %d, want %d", sample.authorization, response.Code, sample.want)
		}
	}
}
