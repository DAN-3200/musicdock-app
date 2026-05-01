package handlers

import (
	"context"
	"fmt"

	"music-app/internal/service"

	"github.com/hugolgst/rich-go/client"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Handler struct {
	ctx context.Context
}

func InitHandlers() *Handler {
	return &Handler{}
}

func (it *Handler) Startup(ctx context.Context) {
	it.ctx = ctx
	err := client.Login("750103575459397733")
	if err != nil {
		fmt.Println("Discord não encontrado ou fechado:", err)
		return
	}

	err = service.SetDiscordPresence("Ouvindo Musga", "Musiga Boa")
	if err != nil {
		fmt.Println("Erro ao ativar presença inicial:", err)
	}
}

func (a *Handler) Shutdown(ctx context.Context) {
	client.Logout()
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

func (it *Handler) SetDiscordPresence(details string, state string) error {
	return service.SetDiscordPresence(details, state)
}
