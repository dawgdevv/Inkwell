package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type NoteShare struct {
	ID               string    `json:"id" gorm:"type:uuid;primaryKey"`
	NoteID           string    `json:"note_id" gorm:"type:uuid;not null;index"`
	SharedWithUserID string    `json:"shared_with_user_id" gorm:"type:uuid;not null;index"`
	CreatedAt        time.Time `json:"created_at"`

	// Ensure a user can't be shared the same note twice
	_ struct{} `gorm:"uniqueIndex:idx_note_user_share"`
}

func (ns *NoteShare) BeforeCreate(tx *gorm.DB) (err error) {
	ns.ID = uuid.New().String()
	return
}
