package main

import (
	"embed"
	"music-app/internal/handlers"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	app := handlers.InitHandlers()

	err := wails.Run(&options.App{
		Title:         "music-app",
		Width:         440,
		Height:        400,
		Frameless:     true,
		DisableResize: true,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 40, G: 40, B: 43, A: 1},
		OnStartup:        app.Startup,
		Bind: []any{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
