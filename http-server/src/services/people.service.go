package services

import (
	"pry-teams/src/model"
	r "pry-teams/src/repository"
)

type PeopleService struct {
	people        *r.PeopleRepository
	PeopleWaiting *r.PeopleWaitingRepository
}

func NewPeopleService(repo *r.RepoContext) *PeopleService {
	return &PeopleService{
		people:        repo.People,
		PeopleWaiting: repo.PeopleWaiting,
	}
}

func (s *PeopleService) GetAllPeople() ([]model.People, error) {
	return s.people.FindMany()
}

func (s *PeopleService) ToggleMuted(peerId string, state *string) error {
	if state == nil {
		return s.people.UpdateRaw("muted = NOT muted WHERE peer_id = ?", peerId)
	}
	return s.people.UpdateRaw("muted = ? WHERE peer_id = ?", state, peerId)
}

func (s *PeopleService) ToggleVisible(peerId string, state *string) error {
	if state == nil {
		return s.people.UpdateRaw("visible = NOT visible WHERE peer_id = ?", peerId)
	}
	return s.people.UpdateRaw("visible = ? WHERE peer_id = ?", state, peerId)
}

func (s *PeopleService) Leave(roomId string, peerId string) (*int64, error) {
	err := s.people.Delete("peer_id = ?", peerId)
	if err != nil {
		return nil, err
	}

	count, err := s.people.Count("room_id = ?", roomId)

	return &count, err
}

func (s *PeopleService) Disconnect(socketId string) (*model.People, *int64, error) {
	s.PeopleWaiting.Delete("socket_id = ?", socketId) // ignore error

	user, err := s.people.FindOne("socket_id = ?", socketId)
	if err != nil {
		return nil, nil, err
	}

	if err := s.people.Delete("id = ?", user.ID); err != nil {
		return nil, nil, err
	}

	count, err := s.people.Count("room_id = ?", user.RoomID)

	return user, &count, err
}
