package handlers

import (
	"context"

	"music-app/internal/service"
	"net/http"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Handler struct {
	ctx    context.Context
	server *http.Server
}

func InitHandlers() *Handler {
	return &Handler{}
}

func (it *Handler) Startup(ctx context.Context) {
	it.ctx = ctx
}

func (it *Handler) CloseWindow() {
	runtime.Quit(it.ctx)
}

func (it *Handler) SaveSongDialog(songName string) (string, error) {
	return service.SaveSongDialog(it.ctx, songName)
}

func (it *Handler) DownloadSong(url string, pathName string) error {
	return service.DownloadSong(url, pathName)
}

func (it *Handler) GetAudioUrl(url string) (string, error) {
	return service.GetAudioUrl(url)
}

func (it *Handler) GetSearchSuggestions(query string) ([]string, error) {
	return service.GetSearchSuggestions(query)
}

func (it *Handler) SearchVideos(query string) ([]service.VideoResult, error) {
	return service.SearchVideos(query)
}
