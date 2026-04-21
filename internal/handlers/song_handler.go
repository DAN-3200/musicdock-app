package handlers

import (
	"context"
	"io"
	"music-app/internal/engine/song"
	"net/http"
)

type Music struct {
	ctx    context.Context
	server *http.Server
}

// ----------------------------------------------------

func (it *Music) StartServer() {
	mux := http.NewServeMux()

	mux.HandleFunc("/stream", it.handleStream)

	it.server = &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}

	go it.server.ListenAndServe()
}

func (it *Music) handleStream(w http.ResponseWriter, r *http.Request) {
	// url := r.URL.Query().Get("url")

	stream, err := song.YoutubeClient("https://music.youtube.com/watch?v=xlkhICahOLA&list=LM")
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	defer stream.Close()

	w.Header().Set("Content-Type", "audio/webm") // não force mp3

	io.Copy(w, stream)
}

