package service_test

import (
	"encoding/json"
	"music-app/internal/service"
	"testing"

	"github.com/stretchr/testify/require"
)

func Test_SearchVideos(t *testing.T) {
	res, err := service.SearchVideos("ncs")
	require.NoError(t, err)

	b, _ := json.MarshalIndent(res, "", "  ")
	t.Log(string(b))
}
