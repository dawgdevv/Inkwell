package web

import (
	"embed"
	"io/fs"
	"net/http"

	"github.com/gin-gonic/gin"
)

//go:embed dist
var distFS embed.FS

// GetDistFS returns the embedded dist filesystem
func GetDistFS() http.FileSystem {
	sub, err := fs.Sub(distFS, "dist")
	if err != nil {
		panic(err)
	}
	return http.FS(sub)
}

// RegisterRoutes sets up the SPA routes
func RegisterRoutes(r *gin.Engine) {
	staticFS := GetDistFS()

	// Serve static assets
	r.StaticFS("/assets", staticFS)
	r.StaticFS("/favicon.svg", staticFS)
	r.StaticFS("/icons.svg", staticFS)

	// For all other routes, serve index.html (SPA behavior)
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		method := c.Request.Method

		// Only handle GET requests for SPA fallback
		// POST/PUT/DELETE etc. that fall through are genuine 404s
		if method != "GET" {
			c.String(404, "Not found")
			return
		}

		// Try to serve the file directly first
		file, err := staticFS.Open(path)
		if err == nil {
			stat, err := file.Stat()
			if err == nil && !stat.IsDir() {
				file.Close()
				c.FileFromFS(path, staticFS)
				return
			}
			file.Close()
		}

		// Fall back to index.html for SPA routing
		c.Header("Content-Type", "text/html; charset=utf-8")
		file, err = staticFS.Open("/index.html")
		if err != nil {
			c.String(500, "Failed to load page")
			return
		}
		defer file.Close()

		stat, err := file.Stat()
		if err != nil {
			c.String(500, "Failed to load page")
			return
		}

		c.DataFromReader(200, stat.Size(), "text/html; charset=utf-8", file, nil)
	})
}
