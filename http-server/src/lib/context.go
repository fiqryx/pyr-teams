package lib

import (
	"pry-teams/src/services"

	s "github.com/zishang520/socket.io/v2/socket"
)

type SocketContext struct {
	Io     *s.Server
	Socket *s.Socket
	*services.ServiceContext
}
