package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type NoteVersion struct {
	ID        string    `json:"id" gorm:"type:uuid;primaryKey"`
	NoteID    string    `json:"note_id" gorm:"type:uuid;not null;index"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

func (nv *NoteVersion) BeforeCreate(tx *gorm.DB) (err error) {
	nv.ID = uuid.New().String()
	return
}
