package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Note struct {
	ID        string       `json:"id" gorm:"type:uuid;primaryKey"`
	UserID    string       `json:"user_id" gorm:"type:uuid;not null;index"`
	Title     string       `json:"title" gorm:"not null"`
	Content   string       `json:"content" gorm:"not null"`
	CreatedAt time.Time    `json:"created_at"`
	UpdatedAt time.Time    `json:"updated_at"`
	Shares    []NoteShare  `json:"shares,omitempty" gorm:"foreignKey:NoteID"`
	Versions  []NoteVersion `json:"versions,omitempty" gorm:"foreignKey:NoteID"`
}

func (n *Note) BeforeCreate(tx *gorm.DB) (err error) {
	n.ID = uuid.New().String()
	return
}
