package common

import (
	"crypto/rand"
	"encoding/json"
	"errors"
	"log"
	"math/big"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

func Env(key string) string {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal(".env file not found")
	}
	return os.Getenv(strings.ToUpper(key))
}

func Ptr[T any](s T) *T {
	return &s
}

func BindMap[T any](data any) (T, error) {
	var output T

	raw, ok := data.(map[string]any)
	if !ok {
		return output, errors.New("invalid data format")
	}

	bytes, err := json.Marshal(raw)
	if err != nil {
		return output, errors.New("failed to marshal data")
	}

	if err := json.Unmarshal(bytes, &output); err != nil {
		return output, errors.New("failed to unmarshal data")
	}

	return output, nil
}

func Random(length int) string {
	const chars = "abcdefghijklmnopqrstuvwxyz"
	result := make([]byte, length)

	for i := range result {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(chars))))
		if err != nil {
			panic(err) // Handle error appropriately in real use cases
		}
		result[i] = chars[n.Int64()]
	}

	return string(result)
}
