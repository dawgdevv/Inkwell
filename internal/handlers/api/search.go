package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/dawgdevv/fi_money/internal/config"
	"github.com/dawgdevv/fi_money/internal/models"
)

func SearchNotes(c *gin.Context) {
	userID := c.GetString("userID")
	query := c.Query("q")

	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Search query required"})
		return
	}

	var notes []models.Note
	searchPattern := "%" + query + "%"
	
	err := config.DB.
		Distinct("notes.*").
		Joins("LEFT JOIN note_shares ON note_shares.note_id = notes.id").
		Where("(notes.user_id = ? OR note_shares.shared_with_user_id = ?)", userID, userID).
		Where("notes.title LIKE ? OR notes.content LIKE ?", searchPattern, searchPattern).
		Order("notes.updated_at DESC").
		Find(&notes).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Search failed"})
		return
	}

	c.JSON(http.StatusOK, notes)
}
