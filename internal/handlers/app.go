package handlers

import (
	"context"
	// "io"
	"music-app/internal/engine/song"
	"net/http"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx    context.Context
	server *http.Server
}

func NewApp() *App {
	return &App{}
}

func (it *App) Startup(ctx context.Context) {
	it.ctx = ctx
	it.StartServer()
}

func (it *App) CloseWindow() {
	it.Shutdown(it.ctx)
	runtime.Quit(it.ctx)
}

func (it *App) StartServer() {
	mux := http.NewServeMux()

	mux.HandleFunc("/stream", it.handleStream)

	it.server = &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}

	go it.server.ListenAndServe()
}

func (it *App) Shutdown(ctx context.Context) {
	if it.server != nil {
		it.server.Shutdown(ctx)
	}
}

func (it *App) handleStream(w http.ResponseWriter, r *http.Request) {
	url := r.URL.Query().Get("url")
	if url == "" {
		http.Error(w, "missing url", http.StatusBadRequest)
		return
	}

	stream, err := song.YoutubeClient(url)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	defer stream.Close()

	w.Header().Set("Content-Type", "audio/webm") // ou detecte dinamicamente

	w.WriteHeader(http.StatusOK)

	buf := make([]byte, 32*1024)

	for {
		select {
		case <-r.Context().Done():
			return
		default:
			n, err := stream.Read(buf)
			if n > 0 {
				w.Write(buf[:n])

				if f, ok := w.(http.Flusher); ok {
					f.Flush()
				}
			}

			if err != nil {
				return
			}
		}
	}
}
