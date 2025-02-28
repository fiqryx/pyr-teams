package event

import (
	"errors"
	"log/slog"
	"pry-teams/src/lib"
	c "pry-teams/src/lib/common"
	"pry-teams/src/model"
	t "pry-teams/src/types"

	s "github.com/zishang520/socket.io/v2/socket"
)

type RoomEvent struct {
	ctx *lib.SocketContext
}

func NewRoomEvent(ctx *lib.SocketContext) *RoomEvent {
	return &RoomEvent{ctx: ctx}
}

func (r *RoomEvent) AskToJoin(a ...any) {
	socket := r.ctx.Socket
	args, err := c.BindMap[t.Join](a[0])
	if err != nil {
		slog.Error("AskToJoin: Invalid argument")
		return
	}

	data := model.People{
		RoomID:   args.RoomID,
		SocketID: string(socket.Id()),
		UserID:   args.User.UserID,
		PeerID:   args.User.PeerID,
		Name:     args.User.Name,
		Photo:    args.User.Photo,
		Muted:    args.User.Muted,
		Visible:  args.User.Visible,
	}

	accepted, err := r.ctx.Room.AskToJoin(args.RoomID, &data)
	if errors.Is(err, t.ErrAlreadyExists) {
		socket.Emit("user:reconnect", args.User)
		return
	} else if err != nil {
		slog.Error("OnJoin:", slog.Any("error", err))
		return
	}

	socket.Join(s.Room(args.RoomID))
	if accepted {
		socket.Emit("request:accepted", data.PeerID)
	} else {
		socket.To(s.Room(args.RoomID)).Emit(
			"request:waiting", []t.User{args.User},
		)
	}
}

func (r *RoomEvent) OnAccept(a ...any) {
	peerId, ok := a[0].(string)
	if !ok {
		slog.Error("OnAccept: Invalid argument")
		return
	}

	data, err := r.ctx.Room.JoinAccepted(peerId)
	if err != nil {
		slog.Error("OnAccept:", slog.Any("error", err))
		return
	}

	r.ctx.Socket.To(s.Room(data.SocketID)).Emit("request:accepted", peerId)
}

func (r *RoomEvent) OnReject(a ...any) {
	peerId, ok := a[0].(string)
	if !ok {
		slog.Error("OnReject: Invalid argument")
		return
	}

	data, err := r.ctx.Room.JoinRejected(peerId)
	if err != nil {
		slog.Error("OnReject:", slog.Any("error", err))
		return
	}

	r.ctx.Socket.To(s.Room(data.SocketID)).Emit("request:rejected", data.PeerID)
}

func (r *RoomEvent) OnCount(a ...any) {
	roomId, ok := a[0].(string)
	if !ok {
		slog.Error("OnCount: Invalid argument")
		return
	}

	count, err := r.ctx.Room.CountPeople(roomId)
	if err != nil {
		slog.Error("OnCount:", slog.Any("error", err))
		return
	}

	r.ctx.Socket.Emit("room:count", count)
}

func (r *RoomEvent) OnJoined(a ...any) {
	args, err := c.BindMap[t.Join](a[0])
	if err != nil {
		slog.Error("OnJoined: Invalid argument")
		return
	}

	room, count, err := r.ctx.Room.JoinRoom(args.RoomID, args.User.PeerID)
	if err != nil {
		slog.Error("OnJoined:", slog.Any("error", err))
		r.ctx.Socket.Emit("error:join", err.Error())
	}

	r.ctx.Socket.To(s.Room(args.RoomID)).Emit("room:joined", args.User)
	r.ctx.Io.To(s.Room(args.RoomID)).Emit("room:count", count)
	r.ctx.Socket.Emit("user:control-changed", room.RoomControl)

	if len(room.PeopleWaiting) > 0 {
		r.ctx.Socket.Emit("request:waiting", room.PeopleWaiting)
	}

	slog.Info("OnJoined", slog.Any("user", args.User))
}
