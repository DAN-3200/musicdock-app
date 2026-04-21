package song_test

import (
	"context"
	"io"
	"music-app/internal/engine/song"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func Test_YoutubeClient(t *testing.T) {
	stream, err := song.YoutubeClient("https://music.youtube.com/watch?v=xlkhICahOLA&list=LM")
	require.NoError(t, err)

	file, err := os.Create("video.mp4")
	if err != nil {
		panic(err)
	}
	defer file.Close()

	_, err = io.Copy(file, stream)
	if err != nil {
		panic(err)
	}
}

func Test_YoutubeClientContext(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	stream, err := song.YoutubeClientContext(ctx, "https://music.youtube.com/watch?v=xlkhICahOLA&list=LM")
	require.NoError(t, err)

	file, err := os.Create("..\\video.mp4")
	if err != nil {
		panic(err)
	}
	defer file.Close()

	_, err = io.Copy(file, stream)
	if err != nil {
		panic(err)
	}
}
