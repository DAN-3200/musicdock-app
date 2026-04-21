package song

import (
	"context"
	"io"

	"github.com/kkdai/youtube/v2"
)

func YoutubeClient(url string) (io.ReadCloser, error) {
	client := youtube.Client{}

	video, err := client.GetVideo(url)
	if err != nil {
		return nil, err
	}

	formats := video.Formats.WithAudioChannels().Type("audio")

	stream, _, err := client.GetStream(video, &formats[0])
	if err != nil {
		panic(err)
	}

	return stream, nil
}

func YoutubeClientContext(ctx context.Context, url string) (io.ReadCloser, error) {
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
