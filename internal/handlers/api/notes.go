package api

import (
	"net/http"
	"strconv"

	"github.com/dawgdevv/fi_money/internal/config"
	"github.com/dawgdevv/fi_money/internal/models"
	"github.com/dawgdevv/fi_money/internal/utils"
	"github.com/gin-gonic/gin"
)

type CreateNoteRequest struct {
	Title   string `json:"title" binding:"required"`
	Content string `json:"content" binding:"required"`
}

type UpdateNoteRequest struct {
	Title   string `json:"title" binding:"required"`
	Content string `json:"content" binding:"required"`
}

func GetNotes(c *gin.Context) {
	userID := c.GetString("userID")
	
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	var notes []models.Note
	err := config.DB.
		Where("user_id = ?", userID).
		Order("updated_at DESC").
		Limit(limit).Offset(offset).
		Find(&notes).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to fetch notes"})
		return
	}

	c.JSON(http.StatusOK, notes)
}

func GetSharedNotes(c *gin.Context) {
	userID := c.GetString("userID")

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	var notes []models.Note
	err := config.DB.
		Joins("JOIN note_shares ON note_shares.note_id = notes.id").
		Where("note_shares.shared_with_user_id = ?", userID).
		Order("notes.updated_at DESC").
		Limit(limit).Offset(offset).
		Find(&notes).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to fetch shared notes"})
		return
	}

	c.JSON(http.StatusOK, notes)
}

func GetNote(c *gin.Context) {
	userID := c.GetString("userID")
	noteID := c.Param("id")

	if !utils.IsValidUUID(noteID) {
		c.JSON(http.StatusNotFound, gin.H{"message": "Note not found"})
		return
	}

	var note models.Note
	err := config.DB.
		Joins("LEFT JOIN note_shares ON note_shares.note_id = notes.id").
		Where("notes.id = ? AND (notes.user_id = ? OR note_shares.shared_with_user_id = ?)", noteID, userID, userID).
		First(&note).Error

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Note not found"})
		return
	}

	c.JSON(http.StatusOK, note)
}

func CreateNote(c *gin.Context) {
	userID := c.GetString("userID")
	
	var req CreateNoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	note := models.Note{
		UserID:  userID,
		Title:   req.Title,
		Content: req.Content,
	}

	if err := config.DB.Create(&note).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to create note"})
		return
	}

	c.JSON(http.StatusCreated, note)
}

func UpdateNote(c *gin.Context) {
	userID := c.GetString("userID")
	noteID := c.Param("id")

	if !utils.IsValidUUID(noteID) {
		c.JSON(http.StatusNotFound, gin.H{"message": "Note not found or unauthorized"})
		return
	}

	var note models.Note
	if err := config.DB.Where("id = ? AND user_id = ?", noteID, userID).First(&note).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Note not found or unauthorized"})
		return
	}

	// Save current version before updating
	version := models.NoteVersion{
		NoteID:  note.ID,
		Title:   note.Title,
		Content: note.Content,
	}
	config.DB.Create(&version)

	var req UpdateNoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	note.Title = req.Title
	note.Content = req.Content
	if err := config.DB.Save(&note).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to update note"})
		return
	}

	c.JSON(http.StatusOK, note)
}

func DeleteNote(c *gin.Context) {
	userID := c.GetString("userID")
	noteID := c.Param("id")

	if !utils.IsValidUUID(noteID) {
		c.JSON(http.StatusNotFound, gin.H{"message": "Note not found or unauthorized"})
		return
	}

	var note models.Note
	if err := config.DB.Where("id = ? AND user_id = ?", noteID, userID).First(&note).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Note not found or unauthorized"})
		return
	}

	// Delete associated shares and versions first
	config.DB.Where("note_id = ?", noteID).Delete(&models.NoteShare{})
	config.DB.Where("note_id = ?", noteID).Delete(&models.NoteVersion{})
	
	if err := config.DB.Delete(&note).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to delete note"})
		return
	}

	c.Status(http.StatusNoContent)
}
