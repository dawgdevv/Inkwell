package web

import (
	"embed"
	"html/template"
	"io/fs"
	"net/http"

	"github.com/gin-gonic/gin"
)

//go:embed templates static
var FS embed.FS

func RegisterRoutes(r *gin.Engine) {
	// Serve static files
	staticFS, err := fs.Sub(FS, "static")
	if err != nil {
		panic(err)
	}
	r.StaticFS("/static", http.FS(staticFS))

	// Page routes
	r.GET("/", handleDashboard)
	r.GET("/login", handleLogin)
	r.GET("/register", handleRegister)
	r.GET("/note/:id", handleNoteDetail)
	r.GET("/note/new", handleNewNote)
	r.GET("/shared", handleSharedNotes)
	r.GET("/about", handleAbout)
}

func renderTemplate(c *gin.Context, name string, data map[string]interface{}) {
	tmpl, err := template.ParseFS(FS, "templates/base.html", "templates/"+name)
	if err != nil {
		c.String(http.StatusInternalServerError, "Template error")
		return
	}

	if data == nil {
		data = make(map[string]interface{})
	}

	// Add auth info
	if auth, exists := c.Get("authenticated"); exists && auth.(bool) {
		data["Authenticated"] = true
		data["UserEmail"], _ = c.Get("email")
	} else {
		data["Authenticated"] = false
	}

	c.Header("Content-Type", "text/html; charset=utf-8")
	if err := tmpl.Execute(c.Writer, data); err != nil {
		c.String(http.StatusInternalServerError, "Render error")
	}
}

func handleDashboard(c *gin.Context) {
	renderTemplate(c, "dashboard.html", nil)
}

func handleLogin(c *gin.Context) {
	renderTemplate(c, "login.html", nil)
}

func handleRegister(c *gin.Context) {
	renderTemplate(c, "register.html", nil)
}

func handleNoteDetail(c *gin.Context) {
	renderTemplate(c, "note_detail.html", gin.H{
		"NoteID": c.Param("id"),
	})
}

func handleNewNote(c *gin.Context) {
	renderTemplate(c, "note_detail.html", gin.H{
		"NoteID": "",
		"IsNew":  true,
	})
}

func handleSharedNotes(c *gin.Context) {
	renderTemplate(c, "shared.html", nil)
}

func handleAbout(c *gin.Context) {
	renderTemplate(c, "about.html", nil)
}
