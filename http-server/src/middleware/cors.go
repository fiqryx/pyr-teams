package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func Cors() gin.HandlerFunc {
	config := cors.DefaultConfig()

	config.AllowOrigins = []string{
		"http://localhost:3001",
		"https://localhost:3001",
		"https://teams.expr.site",
	}

	config.AllowHeaders = []string{
		"Accept",
		"Origin",
		"Authorization",
		"Content-Type",
		"Content-Length",
		"X-CSRF-Token",
		"Token",
		"session",
		"Host",
		"Connection",
		"Accept-Encoding",
		"Content-Encoding",
		"Accept-Language",
		"X-Requested-With",
		"Access-Control-Allow-Origin",
		"Access-Control-Allow-Credentials",
	}
	config.AllowCredentials = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	return cors.New(config)
}
