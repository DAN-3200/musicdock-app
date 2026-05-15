package service

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"music-app/internal/music"
	"net/http"
	"os"
	"regexp"
	"strings"

	"runtime/debug"

	"github.com/hugolgst/rich-go/client"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type VideoResult struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Thumbnail string `json:"thumbnail"`
	Url       string `json:"url"`
}

func SearchVideos(query string) ([]VideoResult, error) {
	url := fmt.Sprintf(
		"https://www.youtube.com/results?search_query=%s&sp=EgIQAQ%%253D%%253D",
		strings.ReplaceAll(query, " ", "+"),
	)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// O YouTube embute os dados como: var ytInitialData = {...};
	// Extraímos esse bloco JSON e navegamos até os resultados.
	re := regexp.MustCompile(`var ytInitialData\s*=\s*(\{.+?\});\s*</script>`)
	match := re.FindSubmatch(body)
	if match == nil {
		return nil, fmt.Errorf("ytInitialData não encontrado na página")
	}

	// Estrutura mínima para chegar nos videoRenderers
	var page struct {
		Contents struct {
			TwoColumnSearchResultsRenderer struct {
				PrimaryContents struct {
					SectionListRenderer struct {
						Contents []struct {
							ItemSectionRenderer struct {
								Contents []struct {
									VideoRenderer *struct {
										VideoID string `json:"videoId"`
										Title   struct {
											Runs []struct {
												Text string `json:"text"`
											} `json:"runs"`
										} `json:"title"`
									} `json:"videoRenderer"`
								} `json:"contents"`
							} `json:"itemSectionRenderer"`
						} `json:"contents"`
					} `json:"sectionListRenderer"`
				} `json:"primaryContents"`
			} `json:"twoColumnSearchResultsRenderer"`
		} `json:"contents"`
	}

	if err := json.Unmarshal(match[1], &page); err != nil {
		return nil, fmt.Errorf("erro ao parsear ytInitialData: %w", err)
	}

	seen := make(map[string]struct{})
	var results []VideoResult

	sections := page.Contents.TwoColumnSearchResultsRenderer.
		PrimaryContents.SectionListRenderer.Contents

	for _, section := range sections {
		for _, item := range section.ItemSectionRenderer.Contents {
			vr := item.VideoRenderer
			if vr == nil || vr.VideoID == "" {
				continue
			}
			if len(vr.Title.Runs) == 0 {
				continue
			}

			// Descarta duplicatas (o mesmo videoId pode aparecer em mais de uma seção)
			if _, dup := seen[vr.VideoID]; dup {
				continue
			}
			seen[vr.VideoID] = struct{}{}

			results = append(results, VideoResult{
				ID:        vr.VideoID,
				Title:     vr.Title.Runs[0].Text,
				Thumbnail: fmt.Sprintf("https://i.ytimg.com/vi/%s/hqdefault.jpg", vr.VideoID),
				Url:       "https://www.youtube.com/watch?v=" + vr.VideoID,
			})

			if len(results) == 20 {
				return results, nil
			}
		}
	}

	return results, nil
}

func GetSearchSuggestions(query string) ([]string, error) {
	if query == "" {
		return []string{}, nil
	}

	// API de sugestões pública do YouTube
	url := fmt.Sprintf("http://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=%s", query)

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// O formato de resposta é: ["query", ["sugestão 1", "sugestão 2", ...]]
	var result []interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	if len(result) < 2 {
		return []string{}, nil
	}

	// Converte a interface para um slice de strings
	suggestionsRaw := result[1].([]interface{})
	suggestions := make([]string, len(suggestionsRaw))
	for i, s := range suggestionsRaw {
		suggestions[i] = s.(string)
	}

	return suggestions, nil
}

func GetAudioUrl(url string) (string, error) {
	// Apenas resolve a URL, sem gerenciar bytes
	directUrl, err := music.YoutubeByUrl(url)
	if err != nil {
		return "", err
	}
	return directUrl, nil
}

func DownloadSong(url string, pathName string) error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	stream, err := music.YoutubeByStream(ctx, url)
	if err != nil {
		return err
	}
	defer stream.Close()

	file, err := os.Create(pathName)
	if err != nil {
		return err
	}
	defer file.Close()

	// 3. O io.Copy é perfeito aqui porque ele transfere os bytes
	// conforme eles chegam, sem carregar tudo na RAM (essencial para arquivos grandes)
	buf := make([]byte, 32*1024)
	_, err = io.CopyBuffer(file, stream, buf)
	if err != nil {
		return err
	}

	debug.FreeOSMemory()
	return nil
}

func SaveSongDialog(ctx context.Context, songName string) (string, error) {
	filepath, err := runtime.SaveFileDialog(ctx, runtime.SaveDialogOptions{
		Title:           "Salvar Música",
		DefaultFilename: songName + ".webm",
		Filters: []runtime.FileFilter{
			{DisplayName: "Audio Files (*.webm)", Pattern: "*.webm"},
		},
	})

	if err != nil {
		return "", err
	}

	return filepath, nil // Retorna o caminho escolhido (ex: C:\Musicas\teste.webm)
}

func SetDiscordPresence(details string, state string, status string, url string, start, end float64) error {
	if url == "" {
		url = ""
	}

	err := client.SetActivity(client.Activity{
		State:      state,
		Details:    details,
		LargeImage: "embedded_background", // Nome da imagem enviada no painel do desenvolvedor
		SmallImage: status,
		LargeText:  "Meu App Wails",
		
		Buttons: []*client.Button{
			{
				Label: "Listen on MusicDock",
				Url:   url,
			},
		},
	})

	if err != nil {
		return err
	}

	return nil
}
