package services

import (
	"errors"
	"fmt"
	"pry-teams/src/lib/array"
	c "pry-teams/src/lib/common"
	"pry-teams/src/model"
	r "pry-teams/src/repository"
	"pry-teams/src/types"

	"gorm.io/gorm"
)

type RoomService struct {
	room          *r.RoomRepository
	control       *r.RoomControlRepository
	people        *r.PeopleRepository
	peopleWaiting *r.PeopleWaitingRepository
	userAccess    *r.UserAccessRepository
}

func NewRoomService(repo *r.RepoContext) *RoomService {
	return &RoomService{
		room:          repo.Room,
		control:       repo.RoomControl,
		people:        repo.People,
		peopleWaiting: repo.PeopleWaiting,
		userAccess:    repo.UserAccess,
	}
}

func (s *RoomService) GetAllRooms() ([]model.Room, error) {
	return s.room.FindMany()
}

func (s *RoomService) CreateRoomID() (string, error) {
	var (
		roomId   string
		isUnique = false
	)

	for !isUnique {
		roomId = fmt.Sprintf("%s-%s-%s", c.Random(3), c.Random(4), c.Random(3))

		_, err := s.room.FindOne("room_id = ?", roomId)

		if errors.Is(err, gorm.ErrRecordNotFound) {
			isUnique = true
		} else if err != nil {
			return "", err
		}
	}

	return roomId, nil
}

func (s *RoomService) CreateRoom(userId string) (*model.Room, error) {
	roomId, err := s.CreateRoomID()
	if err != nil {
		return nil, err
	}

	// create a new room
	room := model.Room{RoomId: roomId, Host: []string{userId}}
	if err := s.room.Save(&room); err != nil {
		return nil, err
	}

	// getting user access or create new
	access, err := s.userAccess.FindOne("user_id = ?", userId)
	if err != nil {
		access = &model.UserAccess{UserID: userId}
		if err := s.userAccess.Save(access); err != nil {
			return nil, err
		}
	}

	// create a room control
	control := model.RoomControl{
		RoomID:      room.RoomId,
		RequireHost: access.RequireHost,
		AccessType:  access.AccessType,
	}
	if err := s.control.Save(&control); err != nil {
		return nil, err
	}

	return &room, nil
}

func (s *RoomService) GetRoomByID(roomId string) (*model.Room, error) {
	room, err := s.room.FindOne("room_id = ?", roomId)
	if err != nil {
		return nil, err
	}

	control, err := s.control.FindOne("room_id = ?", room.RoomId)
	if err != nil {
		return nil, err
	}

	room.RoomControl = control

	return room, err
}

func (s *RoomService) CountPeople(roomId string) (int64, error) {
	return s.people.Count("room_id = ?", roomId)
}

func (s *RoomService) AskToJoin(roomId string, user *model.People) (bool, error) {
	room, err := s.GetRoomByID(roomId)
	if err != nil {
		return false, err
	}

	people, _ := s.people.FindOne("peer_id = ?", user.PeerID)
	if people != nil {
		return false, types.ErrAlreadyExists
	}

	var accepted bool

	// add condition require host here...

	if array.Include(room.Host, user.UserID) ||
		*room.RoomControl.AccessType == types.Open {
		if err = s.people.Save(user); err != nil {
			return false, err
		}
		accepted = true
	} else {
		err := s.peopleWaiting.Save((*model.PeopleWaiting)(user))
		if err != nil {
			return false, err
		}
		accepted = false
	}

	return accepted, nil
}

func (s *RoomService) JoinAccepted(peerID string) (*model.People, error) {
	waiting, err := s.peopleWaiting.FindOne("peer_id = ?", peerID)
	if err != nil {
		return nil, err
	}

	people := (*model.People)(waiting)
	if err := s.people.Save(people); err != nil {
		return nil, err
	}

	if err := s.peopleWaiting.Delete("id = ?", waiting.ID); err != nil {
		return nil, err
	}

	return people, nil
}

func (s *RoomService) JoinRejected(peerID string) (*model.PeopleWaiting, error) {
	waiting, err := s.peopleWaiting.FindOne("peer_id = ?", peerID)
	if err != nil {
		return nil, err
	}

	if err := s.peopleWaiting.Delete("id = ?", waiting.ID); err != nil {
		return nil, err
	}

	return waiting, nil
}

func (s *RoomService) JoinRoom(roomId string, peerId string) (*model.Room, *int64, error) {
	room, err := s.GetRoomByID(roomId)
	if err != nil {
		return nil, nil, err
	}

	people, err := s.people.FindOne("peer_id = ?", peerId)
	if err != nil {
		return nil, nil, err
	}

	if array.Include(room.Host, people.UserID) {
		room.PeopleWaiting, err = s.peopleWaiting.FindMany("room_id = ?", roomId)
		if err != nil {
			return nil, nil, err
		}
	}

	count, err := s.CountPeople(room.RoomId)
	if err != nil {
		return nil, nil, err
	}

	return room, &count, nil
}

func (s *RoomService) UpdateControl(roomId, userId string, state *types.Control) error {
	access := model.UserAccess{
		UserID:      userId,
		RequireHost: &state.RequireHost,
		AccessType:  &state.AccessType,
	}

	if err := s.userAccess.UpdateByUserID(&access); err != nil {
		return err
	}

	control := model.RoomControl{
		RoomID:           roomId,
		HostManagement:   &state.HostManagement,
		AllowShareScreen: &state.AllowShareScreen,
		AllowSendChat:    &state.AllowSendChat,
		AllowReaction:    &state.AllowReaction,
		AllowMicrophone:  &state.AllowMicrophone,
		AllowVideo:       &state.AllowVideo,
		RequireHost:      &state.RequireHost,
		AccessType:       &state.AccessType,
	}

	return s.control.UpdateByRoomID(&control)
}

func (s *RoomService) LeaveRoom(roomId string, peerId string) (*int64, error) {
	err := s.people.Delete("peer_id = ?", peerId)
	if err != nil {
		return nil, err
	}

	count, err := s.CountPeople(roomId)

	return &count, err
}
