package middleware

import (
	"fmt"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type Visitor struct {
	ExpiredAt time.Time
	allowed   int
}

func RateLimiter(limit int, duration time.Duration) gin.HandlerFunc {
	visitors := make(map[string]*Visitor)
	var mu sync.Mutex

	// cleanup expired visitors periodically
	go func() {
		for {
			time.Sleep(duration)
			mu.Lock()
			for ip, v := range visitors {
				if time.Now().After(v.ExpiredAt) {
					delete(visitors, ip)
				}
			}
			mu.Unlock()
		}
	}()

	return func(ctx *gin.Context) {
		ip := ctx.ClientIP()

		mu.Lock()
		v, exists := visitors[ip]
		if !exists {
			v = &Visitor{
				ExpiredAt: time.Now().Add(duration),
				allowed:   limit,
			}
			visitors[ip] = v
		}
		mu.Unlock()

		if v.allowed <= 0 {
			remaining := time.Until(v.ExpiredAt)

			hours := int(remaining.Hours())
			minutes := int(remaining.Minutes()) % 60
			seconds := int(remaining.Seconds()) % 60

			var formattedTime string
			if hours > 0 {
				formattedTime = fmt.Sprintf("%dh %dm %ds", hours, minutes, seconds)
			} else if minutes > 0 {
				formattedTime = fmt.Sprintf("%dm %ds", minutes, seconds)
			} else {
				formattedTime = fmt.Sprintf("%ds", seconds)
			}

			ctx.AbortWithStatusJSON(429, gin.H{"message": fmt.Sprintf(
				"You have exceeded the request limit, Please try again in %s",
				formattedTime,
			)})
			return
		}

		v.allowed--
		ctx.Next()
	}
}
