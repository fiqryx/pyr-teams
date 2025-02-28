package repository

import (
	"pry-teams/src/model"

	"gorm.io/gorm"
)

type RoomControlRepository struct {
	db *gorm.DB
}

func NewRoomControlRepository(db *gorm.DB) *RoomControlRepository {
	return &RoomControlRepository{db: db}
}

func (r *RoomControlRepository) FindOne(conds ...interface{}) (*model.RoomControl, error) {
	var room model.RoomControl

	err := r.db.First(&room, conds...).Error
	if err != nil {
		return nil, err
	}

	return &room, nil
}

func (r *RoomControlRepository) Save(data *model.RoomControl) error {
	return r.db.Save(&data).Error
}

func (r *RoomControlRepository) UpdateByRoomID(data *model.RoomControl) error {
	return r.db.Model(model.RoomControl{}).
		Where("room_id = ?", data.RoomID).Updates(&data).Error
}
