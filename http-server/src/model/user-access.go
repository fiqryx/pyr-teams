package model

import (
	"pry-teams/src/types"
	"time"

	"github.com/lucsky/cuid"
	"gorm.io/gorm"
)

type UserAccess struct {
	ID          string        `gorm:"primaryKey;size:25" json:"id"`
	UserID      string        `gorm:"unique;column:user_id" json:"userId"`
	RequireHost *bool         `gorm:"default:false" json:"requireHost"`
	AccessType  *types.Access `gorm:"default:trusted" json:"access"`
	CreatedAt   time.Time     `gorm:"column:created_at;<-:create" json:"createdAt"`
	UpdatedAt   time.Time     `gorm:"column:updated_at;" json:"updatedAt"`
}

func (UserAccess) TableName() string {
	return "user_access"
}

func (u *UserAccess) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ID == "" {
		u.ID = cuid.New()
	}
	return nil
}
