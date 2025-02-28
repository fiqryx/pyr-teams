package model

import (
	"pry-teams/src/types"
	"time"

	"github.com/lucsky/cuid"
	"gorm.io/gorm"
)

type RoomControl struct {
	ID               string        `gorm:"primaryKey;size:25" json:"id"`
	RoomID           string        `gorm:"unique;column:room_id" json:"roomId"`
	HostManagement   *bool         `gorm:"default:false" json:"hostManagement"`
	AllowShareScreen *bool         `gorm:"default:true" json:"allowShareScreen"`
	AllowSendChat    *bool         `gorm:"default:true" json:"allowSendChat"`
	AllowReaction    *bool         `gorm:"default:true" json:"allowReaction"`
	AllowMicrophone  *bool         `gorm:"default:true" json:"allowMicrophone"`
	AllowVideo       *bool         `gorm:"default:true" json:"allowVideo"`
	RequireHost      *bool         `gorm:"default:false" json:"requireHost"`
	AccessType       *types.Access `gorm:"default:trusted" json:"access"`
	Room             Room          `gorm:"foreignKey:RoomID;references:RoomId;constraint:OnDelete:CASCADE" json:"room"`
	CreatedAt        time.Time     `gorm:"column:created_at;<-:create" json:"createdAt"`
	UpdatedAt        time.Time     `gorm:"column:updated_at;" json:"updatedAt"`
}

func (RoomControl) TableName() string {
	return "room_control"
}

func (r *RoomControl) BeforeCreate(tx *gorm.DB) (err error) {
	if r.ID == "" {
		r.ID = cuid.New()
	}
	return nil
}
