package httpserver_test

import (
	"net/http"
	"strings"
	"testing"
)

// Jede Antwort trÃ¤gt die Sicherheits-Header, auch ohne vorgeschalteten Proxy.
func TestResponsesCarrySecurityHeaders(t *testing.T) {
	srv, _ := newServer(t, false)
	b := newBrowser(t, srv)

	resp, _ := b.do(http.MethodGet, "/api/health", nil)
	for header, want := range map[string]string{
		"X-Content-Type-Options": "nosniff",
		"X-Frame-Options":        "DENY",
		"Referrer-Policy":        "strict-origin-when-cross-origin",
	} {
		if got := resp.Header.Get(header); got != want {
			t.Errorf("%s: %q, erwartet %q", header, got, want)
		}
	}
}

// Ãœberlange Anfragetexte werden abgelehnt, statt vollstÃ¤ndig gelesen zu werden.
func TestOversizedRequestBodyIsRejected(t *testing.T) {
	srv, _ := newServer(t, false)
	b := newBrowser(t, srv)

	huge := map[string]string{"email": strings.Repeat("a", 7<<20), "password": "x"}
	resp, _ := b.do(http.MethodPost, "/api/auth/login", huge)
	if resp.StatusCode < 400 || resp.StatusCode >= 500 {
		t.Errorf("Status %d, erwartet 4xx", resp.StatusCode)
	}
}

