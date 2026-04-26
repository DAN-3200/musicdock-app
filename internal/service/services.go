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

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type VideoResult struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Thumbnail string `json:"thumbnail"`
	Url       string `json:"url"`
}

func SearchVideos(query string) ([]VideoResult, error) {
	// 1. Prepara a URL de busca
	url := fmt.Sprintf("https://www.youtube.com/results?search_query=%s&sp=EgIQAQ%%253D%%253D", strings.ReplaceAll(query, " ", "+"))

	// 2. Faz a requisição simulando um navegador real
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	html := string(body)

	// 3. Extrai o ID, Título e Canal usando padrões que o YouTube mantém há anos
	// O segredo é que o videoId e o Title sempre andam juntos no JSON da página
	reID := regexp.MustCompile(`"videoId":"([^"]+)"`)
	reTitle := regexp.MustCompile(`"title":\{"runs":\[\{"text":"([^"]+)"\}\]`)

	ids := reID.FindAllStringSubmatch(html, 15)
	titles := reTitle.FindAllStringSubmatch(html, 15)

	var results []VideoResult
	for i := 0; i < len(ids) && i < len(titles); i++ {
		id := ids[i][1]
		results = append(results, VideoResult{
			ID:        id,
			Title:     titles[i][1],
			Thumbnail: fmt.Sprintf("https://i.ytimg.com/vi/%s/hqdefault.jpg", id),
			Url:       "https://www.youtube.com/watch?v=" + id,
		})
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
	// 1. Pegar o stream usando sua função existente
	stream, err := music.YoutubeByStream(url)
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
	_, err = io.Copy(file, stream)
	return err
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
