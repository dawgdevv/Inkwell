package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/dawgdevv/fi_money/internal/config"
	"github.com/dawgdevv/fi_money/internal/models"
)

func GetNoteVersions(c *gin.Context) {
	userID := c.GetString("userID")
	noteID := c.Param("id")

	// Verify note access
	var note models.Note
	err := config.DB.
		Joins("LEFT JOIN note_shares ON note_shares.note_id = notes.id").
		Where("notes.id = ? AND (notes.user_id = ? OR note_shares.shared_with_user_id = ?)", noteID, userID, userID).
		First(&note).Error

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Note not found"})
		return
	}

	var versions []models.NoteVersion
	if err := config.DB.Where("note_id = ?", noteID).Order("created_at DESC").Find(&versions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to fetch versions"})
		return
	}

	c.JSON(http.StatusOK, versions)
}

type RestoreVersionRequest struct {
	VersionID string `json:"version_id" binding:"required"`
}

func RestoreNoteVersion(c *gin.Context) {
	userID := c.GetString("userID")
	noteID := c.Param("id")

	// Verify ownership (only owner can restore)
	var note models.Note
	if err := config.DB.Where("id = ? AND user_id = ?", noteID, userID).First(&note).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"message": "Only note owner can restore versions"})
		return
	}

	var req RestoreVersionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	// Find version
	var version models.NoteVersion
	if err := config.DB.Where("id = ? AND note_id = ?", req.VersionID, noteID).First(&version).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Version not found"})
		return
	}

	// Save current state as a new version before restoring
	currentVersion := models.NoteVersion{
		NoteID:  note.ID,
		Title:   note.Title,
		Content: note.Content,
	}
	config.DB.Create(&currentVersion)

	// Restore to selected version
	note.Title = version.Title
	note.Content = version.Content
	if err := config.DB.Save(&note).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to restore version"})
		return
	}

	c.JSON(http.StatusOK, note)
}
