package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func About(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"name":  "Nishant Raj",
		"email": "nishant@example.com",
		"my features": gin.H{
			"Note Version History": "Every note edit is automatically saved as a version. Users can view the complete history of changes and restore to any previous version. This solves the real problem of accidentally overwriting important content and provides peace of mind when editing. Inspired by Git commits but designed for everyday note-taking.",
		},
	})
}
