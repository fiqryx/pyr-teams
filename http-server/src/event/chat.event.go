package event

import (
	"log/slog"
	"pry-teams/src/lib"
	c "pry-teams/src/lib/common"
	t "pry-teams/src/types"

	s "github.com/zishang520/socket.io/v2/socket"
)

type ChatEvent struct {
	ctx *lib.SocketContext
}

func NewChatEvent(ctx *lib.SocketContext) *ChatEvent {
	return &ChatEvent{ctx: ctx}
}

func (e *ChatEvent) OnPost(a ...any) {
	args, err := c.BindMap[t.ChatEmit](a[0])
	if err != nil {
		slog.Error("Chat post: Invalid argument")
		return
	}
	e.ctx.Socket.To(s.Room(args.RoomID)).Emit("chat:get", args.Message)
}
