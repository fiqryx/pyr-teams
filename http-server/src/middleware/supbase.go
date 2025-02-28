package middleware

import (
	"net/http"
	"pry-teams/src/lib/database"
	"strings"

	"github.com/gin-gonic/gin"
)

func SupbaseAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Unauthorized",
			})
			return
		}

		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Unauthorized",
			})
			return
		}
		token := tokenParts[1]

		supabase := database.Supabase()
		supabaseAuth := supabase.Auth.WithToken(token)

		user, err := supabaseAuth.GetUser()
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Unauthorized",
			})
			return
		}

		c.Set("user", user)
		c.Next()
	}
}
