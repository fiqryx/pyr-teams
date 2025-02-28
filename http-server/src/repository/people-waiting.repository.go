package repository

import (
	"pry-teams/src/model"

	"gorm.io/gorm"
)

type PeopleWaitingRepository struct {
	db *gorm.DB
}

func NewPeopleWaitingRepository(db *gorm.DB) *PeopleWaitingRepository {
	return &PeopleWaitingRepository{db: db}
}

func (pw *PeopleWaitingRepository) FindMany(conds ...interface{}) ([]model.PeopleWaiting, error) {
	var peopleWaiting []model.PeopleWaiting
	if err := pw.db.Find(&peopleWaiting, conds...).Error; err != nil {
		return nil, err
	}
	return peopleWaiting, nil
}

func (p *PeopleWaitingRepository) FindOne(conds ...interface{}) (*model.PeopleWaiting, error) {
	var people model.PeopleWaiting

	err := p.db.First(&people, conds...).Error
	if err != nil {
		return nil, err
	}

	return &people, nil
}

func (p *PeopleWaitingRepository) Save(data *model.PeopleWaiting) error {
	return p.db.Save(&data).Error
}

func (p *PeopleWaitingRepository) Delete(conds ...interface{}) error {
	var people model.PeopleWaiting
	return p.db.Delete(&people, conds...).Error
}
