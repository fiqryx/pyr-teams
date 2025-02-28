package types

import (
	"github.com/gin-gonic/gin"
	supaTypes "github.com/supabase-community/gotrue-go/types"
	"github.com/zishang520/socket.io/v2/socket"
)

type User struct {
	UserID  string  `json:"userId"`
	PeerID  string  `json:"peerId"`
	Name    string  `json:"name"`
	Photo   *string `json:"photo,omitempty"`
	Muted   bool    `json:"muted"`
	Visible bool    `json:"visible"`
	Host    bool    `json:"host"`
}

type UserResponse struct {
	*supaTypes.UserResponse
}

func (u *UserResponse) Get(ctx *gin.Context) error {
	context, exist := ctx.Get("user")
	if !exist {
		return ErrUnauthorized
	}

	user, ok := context.(*supaTypes.UserResponse)
	if !ok {
		return ErrUnauthorized
	}

	*u = UserResponse{UserResponse: user}

	return nil
}

func (u *UserResponse) GetFromSocket(s *socket.Socket) error {
	userData, ok := s.Data().(map[string]any)
	if !ok {
		return ErrUnauthorized
	}

	user, ok := userData["user"].(*supaTypes.UserResponse)
	if !ok {
		return ErrUnauthorized
	}

	*u = UserResponse{UserResponse: user}

	return nil
}
