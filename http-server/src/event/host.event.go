package event

import (
	"log/slog"
	"pry-teams/src/lib"
	c "pry-teams/src/lib/common"
	t "pry-teams/src/types"

	s "github.com/zishang520/socket.io/v2/socket"
)

type HostEvent struct {
	ctx *lib.SocketContext
}

func NewHostEvent(ctx *lib.SocketContext) *HostEvent {
	return &HostEvent{ctx: ctx}
}

func (h *HostEvent) OnMuteUser(a ...any) {
	args, err := c.BindMap[t.Emit](a[0])
	if err != nil {
		slog.Error("Mute user: Invalid argument")
		return
	}

	err = h.ctx.People.ToggleMuted(args.PeerID, c.Ptr("true"))
	if err != nil {
		slog.Error("Mute user:", slog.Any("error", err))
		h.ctx.Socket.Emit("error:mute-user", err.Error())
		return
	}

	h.ctx.Socket.To(s.Room(args.RoomID)).Emit("host:muted-user", args.PeerID)
}

func (h *HostEvent) OnRemoveUser(a ...any) {
	args, err := c.BindMap[t.Emit](a[0])
	if err != nil {
		slog.Error("Remove user: Invalid argument")
		return
	}
	h.ctx.Socket.To(s.Room(args.RoomID)).Emit("host:removed-user", args.PeerID)
}

func (h *HostEvent) OnRemoveScreen(a ...any) {
	args, err := c.BindMap[t.Emit](a[0])
	if err != nil {
		slog.Error("Remove screen: Invalid argument")
		return
	}
	h.ctx.Socket.To(s.Room(args.RoomID)).Emit("host:removed-user-shared-screen")
}

func (h *HostEvent) OnChangeControl(a ...any) {
	args, err := c.BindMap[t.ControlEmit](a[0])
	if err != nil {
		slog.Error("Change control: Invalid argument")
		return
	}

	var user t.UserResponse
	if err := user.GetFromSocket(h.ctx.Socket); err != nil {
		slog.Error("Change control:", slog.Any("error", err))
		return
	}

	err = h.ctx.Room.UpdateControl(args.RoomID, user.ID.String(), &args.Control)
	if err != nil {
		slog.Error("Change control:", slog.Any("error", err))
		h.ctx.Socket.Emit("error:change-control", err.Error())
		return
	}

	h.ctx.Io.To(s.Room(args.RoomID)).Emit("user:control-changed", args.Control)
}
