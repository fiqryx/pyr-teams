package event

import (
	"log/slog"
	"pry-teams/src/lib"
	c "pry-teams/src/lib/common"
	t "pry-teams/src/types"

	s "github.com/zishang520/socket.io/v2/socket"
)

type UserEvent struct {
	ctx *lib.SocketContext
}

func NewUserEvent(ctx *lib.SocketContext) *UserEvent {
	return &UserEvent{ctx: ctx}
}

func (u *UserEvent) OnLeave(a ...any) {
	args, err := c.BindMap[t.Emit](a[0])
	if err != nil {
		slog.Error("OnLeave: Invalid argument")
		return
	}

	count, err := u.ctx.People.Leave(args.RoomID, args.PeerID)
	if err != nil {
		// ignore error when leave room
		slog.Error("OnLeave:", slog.Any("error", err))
	}

	u.ctx.Io.To(s.Room(args.RoomID)).Emit("room:count", count)
	u.ctx.Socket.To(s.Room(args.RoomID)).Emit("room:leave", args.PeerID)

	slog.Info("OnLeave", slog.Any("id", u.ctx.Socket.Id()))
}

func (u *UserEvent) OnReaction(a ...any) {
	args, err := c.BindMap[t.ReactionEmit](a[0])
	if err != nil {
		slog.Error("OnReaction: Invalid argument")
		return
	}

	u.ctx.Socket.To(s.Room(args.RoomID)).Emit("user:reacted", args.Reaction)
}

func (u *UserEvent) ToggleAudio(a ...any) {
	args, err := c.BindMap[t.Emit](a[0])
	if err != nil {
		slog.Error("ToggleAudio: Invalid argument")
		return
	}

	err = u.ctx.People.ToggleMuted(args.PeerID, nil)
	if err != nil {
		slog.Error("ToggleAudio:", slog.Any("error", err))
		u.ctx.Socket.Emit("error:toggle-audio", err.Error())
		return
	}

	u.ctx.Socket.To(s.Room(args.RoomID)).Emit("user:toggled-audio", args.PeerID)
}

func (u *UserEvent) ToggleVideo(a ...any) {
	args, err := c.BindMap[t.Emit](a[0])
	if err != nil {
		slog.Error("ToggleVideo: Invalid argument")
		return
	}

	err = u.ctx.People.ToggleVisible(args.PeerID, nil)
	if err != nil {
		slog.Error("ToggleVideo:", slog.Any("error", err))
		u.ctx.Socket.Emit("error:toggle-video", err.Error())
		return
	}

	u.ctx.Socket.To(s.Room(args.RoomID)).Emit("user:toggled-video", args.PeerID)
}

func (u *UserEvent) ShareScreen(a ...any) {
	args, err := c.BindMap[t.Emit](a[0])
	if err != nil {
		slog.Error("ShareScreen: Invalid argument")
		return
	}

	u.ctx.Socket.To(s.Room(args.RoomID)).Emit("user:shared-screen", args.PeerID)
}

func (u *UserEvent) StopShareScreen(a ...any) {
	args, err := c.BindMap[t.Emit](a[0])
	if err != nil {
		slog.Error("StopShareScreen: Invalid argument")
		return
	}

	u.ctx.Socket.To(s.Room(args.RoomID)).Emit("user:stopped-screen-share", args.PeerID)
}

func (u *UserEvent) OnDisableMicrophone(a ...any) {
	args, err := c.BindMap[t.Emit](a[0])
	if err != nil {
		slog.Error("OnDisableMicrophone: Invalid argument")
		return
	}

	err = u.ctx.People.ToggleMuted(args.PeerID, c.Ptr("true"))
	if err != nil {
		slog.Error("OnDisableMicrophone:", slog.Any("error", err))
		u.ctx.Socket.Emit("error:disable-microphone", err.Error())
		return
	}

	u.ctx.Socket.To(s.Room(args.RoomID)).Emit("user:disable-microphone", args.PeerID)
}

func (u *UserEvent) OnDisableCamera(a ...any) {
	args, err := c.BindMap[t.Emit](a[0])
	if err != nil {
		slog.Error("OnDisableCamera: Invalid argument")
		return
	}

	err = u.ctx.People.ToggleVisible(args.PeerID, c.Ptr("false"))
	if err != nil {
		slog.Error("OnDisableCamera:", slog.Any("error", err))
		u.ctx.Socket.Emit("error:disable-camera", err.Error())
		return
	}

	u.ctx.Socket.To(s.Room(args.RoomID)).Emit("user:disable-camera", args.PeerID)
}
