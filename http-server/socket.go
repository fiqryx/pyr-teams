package main

import (
	"fmt"
	"log/slog"
	e "pry-teams/src/event"
	"pry-teams/src/lib"
	"pry-teams/src/lib/database"
	"pry-teams/src/services"

	"github.com/zishang520/engine.io/v2/events"
	s "github.com/zishang520/socket.io/v2/socket"
)

func CreateEvent(io *s.Server, services *services.ServiceContext) {
	io.Use(auth)

	io.On("connection", func(a ...any) {
		socket := a[0].(*s.Socket)
		slog.Info(fmt.Sprintf("connected: %s", socket.Id()))

		ctx := lib.SocketContext{
			Io:             io,
			Socket:         socket,
			ServiceContext: services,
		}

		room := e.NewRoomEvent(&ctx)
		host := e.NewHostEvent(&ctx)
		user := e.NewUserEvent(&ctx)
		chat := e.NewChatEvent(&ctx)

		socket.On("request:join", room.AskToJoin)
		socket.On("request:accept", room.OnAccept)
		socket.On("request:reject", room.OnReject)

		socket.On("room:count", room.OnCount)
		socket.On("room:join", room.OnJoined)

		socket.On("host:mute-user", host.OnMuteUser)
		socket.On("host:remove-user", host.OnRemoveUser)
		socket.On("host:change-control", host.OnChangeControl)
		socket.On("host:remove-shared-screen", host.OnRemoveScreen)

		socket.On("user:leave", user.OnLeave)
		socket.On("user:reaction", user.OnReaction)
		socket.On("user:toggle-audio", user.ToggleAudio)
		socket.On("user:toggle-video", user.ToggleVideo)
		socket.On("user:share-screen", user.ShareScreen)
		socket.On("user:stop-share-screen", user.StopShareScreen)
		socket.On("user:disable-microphone", user.OnDisableMicrophone)
		socket.On("user:disable-camera", user.OnDisableCamera)

		socket.On("chat:post", chat.OnPost)

		socket.On("disconnect", disconnect(&ctx))
	})
}

func disconnect(ctx *lib.SocketContext) events.Listener {
	return func(a ...any) {
		id := string(ctx.Socket.Id())
		slog.Info(fmt.Sprintf("disconnect: %s", id))

		user, count, err := ctx.People.Disconnect(id)
		if err != nil {
			slog.Error("Disconnect:", slog.Any("error", err))
			return
		}

		ctx.Socket.To(s.Room(user.RoomID)).Emit("room:leave", user.PeerID)
		ctx.Io.To(s.Room(user.RoomID)).Emit("room:count", count)

		ctx.Socket.Leave(s.Room(user.RoomID))
	}
}

func auth(socket *s.Socket, next func(*s.ExtendedError)) {
	auth := socket.Handshake().Auth
	if auth == nil {
		next(s.NewExtendedError("unauthorized", nil))
		return
	}

	token, ok := (auth.(map[string]any))["token"].(string)
	if !ok {
		next(s.NewExtendedError("unauthorized", nil))
		return
	}

	supabase := database.Supabase()
	supabaseAuth := supabase.Auth.WithToken(token)

	user, err := supabaseAuth.GetUser()
	if err != nil {
		next(s.NewExtendedError("unauthorized", nil))
		return
	}

	slog.Info(
		"User",
		slog.Any("id", user.ID),
		slog.Any("name", user.UserMetadata["name"]),
	)

	socket.SetData(map[string]any{"user": user})
	next(nil)
}
