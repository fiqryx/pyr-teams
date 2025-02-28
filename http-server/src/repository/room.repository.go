package repository

import (
	"pry-teams/src/model"

	"gorm.io/gorm"
)

type RoomRepository struct {
	db *gorm.DB
}

func NewRoomRepository(db *gorm.DB) *RoomRepository {
	return &RoomRepository{db: db}
}

func (r *RoomRepository) FindOne(conds ...interface{}) (*model.Room, error) {
	var room model.Room

	err := r.db.First(&room, conds...).Error
	if err != nil {
		return nil, err
	}

	return &room, nil
}

func (r *RoomRepository) FindMany(conds ...interface{}) ([]model.Room, error) {
	var rooms []model.Room
	if err := r.db.Find(&rooms, conds...).Error; err != nil {
		return nil, err
	}
	return rooms, nil
}

func (r *RoomRepository) Save(data *model.Room) error {
	return r.db.Save(&data).Error
}

func (r *RoomRepository) FindOneWithPeople(conds ...interface{}) (*model.Room, error) {
	var room model.Room

	err := r.db.Preload("people").First(&room, conds...).Error
	if err != nil {
		return nil, err
	}

	return &room, nil
}
