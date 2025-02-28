package model

import (
	"time"

	"github.com/lib/pq"
	"github.com/lucsky/cuid"
	"gorm.io/gorm"
)

type Room struct {
	ID        string         `gorm:"primaryKey;size:25" json:"id"`
	RoomId    string         `gorm:"unique;column:room_id" json:"roomId"`
	Host      pq.StringArray `gorm:"type:text[];" json:"-"`
	CreatedAt time.Time      `gorm:"column:created_at;<-:create" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"column:updated_at;" json:"updatedAt"`

	RoomControl   *RoomControl    `gorm:"foreignKey:RoomID;references:RoomId" json:"control,omitempty"`
	Peoples       []People        `gorm:"foreignKey:RoomID;references:RoomId" json:"peoples,omitempty"`
	PeopleWaiting []PeopleWaiting `gorm:"foreignKey:RoomID;references:RoomId" json:"peopleWaiting,omitempty"`
}

func (Room) TableName() string {
	return "room"
}

func (u *Room) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ID == "" {
		u.ID = cuid.New()
	}
	return nil
}
