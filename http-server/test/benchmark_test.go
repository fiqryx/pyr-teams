package main_test

import (
	"log"
	"sync"
	"testing"
	"time"

	peer "github.com/muka/peerjs-go"
	socketio "github.com/zishang520/socket.io/v2/socket"
)

var limit = 100

func SkipBenchmarkWebSocket(b *testing.B) {
	var wg sync.WaitGroup
	b.ResetTimer()

	for i := 0; i < limit; i++ {
		wg.Add(1)
		go func(clientID int) {
			defer wg.Done()

			client := socketio.NewClient(nil, nil)
			client.Request()
			// defer client.Close(true)

			// Measure response time
			start := time.Now()

			// client.Emit("message", "ping")

			time.Sleep(100 * time.Millisecond)

			elapsed := time.Since(start)
			b.ReportMetric(float64(elapsed.Milliseconds()), "ms/op")

		}(i)
	}

	wg.Wait()
}

func BenchmarkPeerJS(b *testing.B) {
	var wg sync.WaitGroup

	b.ReportAllocs()
	b.ResetTimer()

	options := peer.NewOptions()
	options.Debug = 0
	options.Host = "localhost"
	options.Port = 9000
	options.Secure = false

	for i := range limit {
		wg.Add(1)
		go func(clientID int) {
			defer wg.Done()

			start := time.Now()
			client, err := peer.NewPeer("", options)
			if err != nil {
				b.Errorf("Client %d: Failed to connect: %v", clientID, err)
				return
			}
			defer client.Close()

			openChan := make(chan bool)
			client.On("open", func(i interface{}) {
				openChan <- true
			})

			// Wait for connection or timeout
			select {
			case <-openChan:
				log.Printf("Client %d connected in %v", clientID, time.Since(start))
			case <-time.After(2 * time.Second): // Timeout if too slow
				b.Errorf("Client %d: Connection timeout", clientID)
				return
			}

			// Report performance
			elapsed := time.Since(start)
			b.ReportMetric(float64(elapsed.Milliseconds()), "ms/op")
		}(i)
	}

	wg.Wait()
}
