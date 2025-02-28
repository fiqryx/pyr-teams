package repository

import "gorm.io/gorm"

type RepoContext struct {
	DB            *gorm.DB
	Room          *RoomRepository
	People        *PeopleRepository
	PeopleWaiting *PeopleWaitingRepository
	RoomControl   *RoomControlRepository
	UserAccess    *UserAccessRepository
}

func NewContext(db *gorm.DB) *RepoContext {
	return &RepoContext{
		DB:            db,
		Room:          NewRoomRepository(db),
		People:        NewPeopleRepository(db),
		PeopleWaiting: NewPeopleWaitingRepository(db),
		RoomControl:   NewRoomControlRepository(db),
		UserAccess:    NewUserAccessRepository(db),
	}
}
