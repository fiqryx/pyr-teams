package model

import (
	"time"

	"github.com/lucsky/cuid"
	"gorm.io/gorm"
)

type People struct {
	ID        string    `gorm:"primaryKey;size:25" json:"id"`
	RoomID    string    `gorm:"column:room_id" json:"roomId"`
	PeerID    string    `gorm:"unique;column:peer_id" json:"peerId"`
	SocketID  string    `gorm:"column:socket_id" json:"socketId"`
	UserID    string    `gorm:"column:user_id" json:"userId"`
	Name      string    `json:"name"`
	Photo     *string   `json:"photo,omitempty"`
	Muted     bool      `gorm:"default:false" json:"muted"`
	Visible   bool      `gorm:"default:false" json:"visible"`
	Room      Room      `gorm:"foreignKey:RoomID;references:RoomId;constraint:OnDelete:CASCADE" json:"room"`
	CreatedAt time.Time `gorm:"column:created_at;<-:create" json:"createdAt"`
}

func (People) TableName() string {
	return "people"
}

func (u *People) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ID == "" {
		u.ID = cuid.New()
	}
	return nil
}
