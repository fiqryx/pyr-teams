package routes

import (
	"pry-teams/src/controller"
	s "pry-teams/src/services"

	"github.com/gin-gonic/gin"
)

func Api(r *gin.RouterGroup, service *s.ServiceContext) {
	room := controller.NewRoomController(service.Room)

	r.GET("/room/:id", room.GetRoom)
	r.POST("/room/create", room.CreateRoom)
}
