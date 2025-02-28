package repository

import (
	"pry-teams/src/model"

	"gorm.io/gorm"
)

type UserAccessRepository struct {
	db *gorm.DB
}

func NewUserAccessRepository(db *gorm.DB) *UserAccessRepository {
	return &UserAccessRepository{db: db}
}

func (r *UserAccessRepository) FindOne(conds ...interface{}) (*model.UserAccess, error) {
	var data model.UserAccess

	err := r.db.First(&data, conds...).Error
	if err != nil {
		return nil, err
	}

	return &data, nil
}

func (r *UserAccessRepository) FindMany(conds ...interface{}) ([]model.UserAccess, error) {
	var data []model.UserAccess
	if err := r.db.Find(&data, conds...).Error; err != nil {
		return nil, err
	}
	return data, nil
}

func (r *UserAccessRepository) Save(data *model.UserAccess) error {
	return r.db.Save(&data).Error
}

func (r *UserAccessRepository) UpdateByUserID(data *model.UserAccess) error {
	return r.db.Model(model.UserAccess{}).
		Where("user_id = ?", data.UserID).Updates(&data).Error
}
