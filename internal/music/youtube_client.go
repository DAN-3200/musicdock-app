package music

import (
	"context"
	"io"

	"time"

	"github.com/kkdai/youtube/v2"
)

// Baixar video localmente
func YoutubeByStream(ctx context.Context, url string) (io.ReadCloser, error) {
	client := youtube.Client{}

	video, err := client.GetVideoContext(ctx, url)
	if err != nil {
		return nil, err
	}

	formats := video.Formats.WithAudioChannels().Type("audio")

	stream, _, err := client.GetStreamContext(ctx, video, &formats[0])
	if err != nil {
		return nil, err
	}

	return stream, nil
}

// Execução do video no frontend
func YoutubeByUrl(url string) (string, error) {
	client := youtube.Client{}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	video, err := client.GetVideoContext(ctx, url)
	if err != nil {
		return "", err
	}
	formats := video.Formats.WithAudioChannels().Type("audio")

	url_youtube, err := client.GetStreamURL(video, &formats[0])
	if err != nil {
		return "", err
	}

	return url_youtube, err
}
