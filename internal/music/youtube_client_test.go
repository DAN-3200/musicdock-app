package music_test

import (
	"io"
	"music-app/internal/music"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func Test_YoutubeClientStream(t *testing.T) {
	stream, err := music.YoutubeByStream("https://music.youtube.com/watch?v=xlkhICahOLA&list=LM")
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

func Test_YoutubeClientUrl(t *testing.T) {
	url, err := music.YoutubeByUrl("https://music.youtube.com/watch?v=xlkhICahOLA&list=LM")
	require.NoError(t, err)
	assert.NotEmpty(t, url)
}
