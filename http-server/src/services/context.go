package services

import (
	r "pry-teams/src/repository"
)

type ServiceContext struct {
	Room   *RoomService
	People *PeopleService
}

func NewContext(repo *r.RepoContext) *ServiceContext {
	return &ServiceContext{
		Room:   NewRoomService(repo),
		People: NewPeopleService(repo),
	}
}
