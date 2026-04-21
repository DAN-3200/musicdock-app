package handlers

import (
	"context"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Basic struct {
	ctx context.Context
}

// ----------------------------------------------------

func (it *Basic) Minimize() {
	runtime.WindowMinimise(it.ctx)
}

func (it *Basic) CloseWindow() {
	runtime.Quit(it.ctx)
}
