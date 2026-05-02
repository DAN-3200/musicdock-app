package handlers

import (
	"context"
	"embed"

	// "fmt"

	"music-app/internal/service"

	r "runtime"

	"github.com/getlantern/systray"
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
	// err := client.Login("")
	// if err != nil {
	// 	fmt.Println("Discord não encontrado ou fechado:", err)
	// 	return
	// }

	// err = service.SetDiscordPresence("Ouvindo Musga", "Musiga Boa")
	// if err != nil {
	// 	fmt.Println("Erro ao ativar presença inicial:", err)
	// }
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

// func (it *Handler) SetDiscordPresence(details string, state string) error {
// 	return service.SetDiscordPresence(details, state)
// }

func OnReady(app *Handler, recursos embed.FS) func() {
	return func() {
		var iconBytes []byte
		sytemaOperacional := r.GOOS
		switch sytemaOperacional {
		case "windows":
			iconBytes, _ = recursos.ReadFile("img/icon.ico")
		default:
			iconBytes, _ = recursos.ReadFile("img/appicon.png")
		}
		systray.SetIcon(iconBytes)

		systray.SetTitle("Meu App")
		systray.SetTooltip("Clique para abrir")

		mOpen := systray.AddMenuItem("Abrir App", "Mostra a janela")
		mHidden := systray.AddMenuItem("Esconder App", "Esconde o App")
		mQuit := systray.AddMenuItem("Sair", "Fecha o app")

		for {
			select {
			case <-mOpen.ClickedCh:
				runtime.WindowShow(app.ctx)
			case <-mHidden.ClickedCh:
				runtime.Hide(app.ctx)
			case <-mQuit.ClickedCh:
				runtime.Quit(app.ctx)
				return
			}
		}
	}
}

func OnExit() {
	// Limpeza se necessário
}
