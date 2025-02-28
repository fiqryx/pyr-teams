package repository

import (
	"fmt"
	"pry-teams/src/model"

	"gorm.io/gorm"
)

type PeopleRepository struct {
	db *gorm.DB
}

func NewPeopleRepository(db *gorm.DB) *PeopleRepository {
	return &PeopleRepository{db: db}
}

func (p *PeopleRepository) FindMany(conds ...interface{}) ([]model.People, error) {
	var people []model.People
	if err := p.db.Find(&people, conds...).Error; err != nil {
		return nil, err
	}
	return people, nil
}

func (p *PeopleRepository) FindOne(conds ...interface{}) (*model.People, error) {
	var people model.People

	err := p.db.First(&people, conds...).Error
	if err != nil {
		return nil, err
	}

	return &people, nil
}

func (p *PeopleRepository) Save(data *model.People) error {
	return p.db.Save(&data).Error
}

func (p *PeopleRepository) Delete(conds ...interface{}) error {
	var people model.People
	return p.db.Delete(&people, conds...).Error
}

func (p *PeopleRepository) Count(query interface{}, args ...interface{}) (int64, error) {
	var count int64
	err := p.db.Model(&model.People{}).Where(query, args...).Count(&count).Error
	return count, err
}

func (p *PeopleRepository) UpdateRaw(query interface{}, values ...interface{}) error {
	return p.db.Exec(fmt.Sprintf(`UPDATE people SET %s`, query), values...).Error
}
