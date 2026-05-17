package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/dawgdevv/fi_money/internal/config"
	"github.com/dawgdevv/fi_money/internal/models"
)

type ShareRequest struct {
	ShareWithEmail string `json:"share_with_email" binding:"required,email"`
}

func ShareNote(c *gin.Context) {
	userID := c.GetString("userID")
	noteID := c.Param("id")

	// Verify note exists and belongs to user
	var note models.Note
	if err := config.DB.Where("id = ? AND user_id = ?", noteID, userID).First(&note).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Note not found or unauthorized"})
		return
	}

	var req ShareRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	// Find user to share with
	var targetUser models.User
	if err := config.DB.Where("email = ?", req.ShareWithEmail).First(&targetUser).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "User not found"})
		return
	}

	// Prevent sharing with yourself
	if targetUser.ID == userID {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Cannot share with yourself"})
		return
	}

	// Check if already shared
	var existingShare models.NoteShare
	if err := config.DB.Where("note_id = ? AND shared_with_user_id = ?", noteID, targetUser.ID).First(&existingShare).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"message": "Note already shared with this user"})
		return
	}

	share := models.NoteShare{
		NoteID:           noteID,
		SharedWithUserID: targetUser.ID,
	}

	if err := config.DB.Create(&share).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to share note"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Note shared successfully"})
}
