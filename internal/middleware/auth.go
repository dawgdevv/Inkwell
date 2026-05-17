package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/dawgdevv/fi_money/internal/utils"
)

func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Authorization header required"})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid authorization format"})
			c.Abort()
			return
		}

		claims, err := utils.ValidateToken(parts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid or expired token"})
			c.Abort()
			return
		}

		c.Set("userID", claims.UserID)
		c.Set("email", claims.Email)
		c.Next()
	}
}

func WebAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check cookie first, then fall back to Authorization header
		var tokenString string
		
		cookie, err := c.Cookie("auth_token")
		if err == nil && cookie != "" {
			tokenString = cookie
		} else {
			authHeader := c.GetHeader("Authorization")
			if authHeader != "" {
				parts := strings.SplitN(authHeader, " ", 2)
				if len(parts) == 2 && strings.ToLower(parts[0]) == "bearer" {
					tokenString = parts[1]
				}
			}
		}

		if tokenString == "" {
			c.Set("authenticated", false)
			c.Next()
			return
		}

		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			c.Set("authenticated", false)
			c.Next()
			return
		}

		c.Set("authenticated", true)
		c.Set("userID", claims.UserID)
		c.Set("email", claims.Email)
		c.Next()
	}
}
