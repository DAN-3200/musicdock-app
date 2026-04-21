package handlers

import "context"

type App struct {
	ctx   context.Context
	Basic *Basic
	Music *Music
}

func NewApp() *App {
	return &App{
		Basic: &Basic{},
		Music: &Music{},
	}
}

func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
	a.Basic.ctx = ctx
	a.Music.ctx = ctx

	a.Music.StartServer() // inicia UMA vez
}