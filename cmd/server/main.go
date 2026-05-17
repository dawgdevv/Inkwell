package main

import (
	"github.com/dawgdevv/fi_money/internal/config"
	"github.com/dawgdevv/fi_money/internal/handlers/api"
	"github.com/dawgdevv/fi_money/internal/middleware"
	"github.com/dawgdevv/fi_money/internal/models"
	"github.com/dawgdevv/fi_money/internal/web"
	"github.com/gin-gonic/gin"
)

func main() {
	config.Init()

	// Auto-migrate database
	config.DB.AutoMigrate(
		&models.User{},
		&models.Note{},
		&models.NoteShare{},
		&models.NoteVersion{},
	)

	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(gin.Logger())

	// CORS for SPA
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Register web UI routes (static files + SPA fallback)
	web.RegisterRoutes(r)

	// API Routes
	apiGroup := r.Group("/")
	{
		// Public routes
		apiGroup.POST("/register", api.Register)
		apiGroup.POST("/login", api.Login)
		apiGroup.GET("/about", api.About)
		apiGroup.GET("/openapi.json", serveOpenAPI)

		// Protected routes
		protected := apiGroup.Group("/")
		protected.Use(middleware.JWTAuth())
		{
		protected.GET("/notes", api.GetNotes)
		protected.GET("/shared-notes", api.GetSharedNotes)
		protected.GET("/notes/:id", api.GetNote)
			protected.POST("/notes", api.CreateNote)
			protected.PUT("/notes/:id", api.UpdateNote)
			protected.DELETE("/notes/:id", api.DeleteNote)
			protected.POST("/notes/:id/share", api.ShareNote)
			protected.GET("/notes/:id/versions", api.GetNoteVersions)
			protected.POST("/notes/:id/restore", api.RestoreNoteVersion)
			protected.GET("/search", api.SearchNotes)
		}
	}

	port := config.GetPort()
	r.Run(":" + port)
}

func serveOpenAPI(c *gin.Context) {
	c.File("./openapi.json")
}
