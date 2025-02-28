package controller

import (
	"pry-teams/src/lib/array"
	"pry-teams/src/services"
	"pry-teams/src/types"

	"github.com/gin-gonic/gin"
)

type RoomController struct {
	service *services.RoomService
}

func NewRoomController(service *services.RoomService) *RoomController {
	return &RoomController{service: service}
}

func (c *RoomController) GetRoom(ctx *gin.Context) {
	var user types.UserResponse
	if err := user.Get(ctx); err != nil {
		ctx.AbortWithStatusJSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	id := ctx.Param("id")
	if id == "" {
		ctx.AbortWithStatusJSON(404, gin.H{"error": "Not found"})
		return
	}

	room, err := c.service.GetRoomByID(id)
	if err != nil {
		ctx.AbortWithStatusJSON(404, gin.H{"error": "Invalid code or link"})
		return
	}

	ctx.AbortWithStatusJSON(200, gin.H{
		"room": room,
		"host": array.Include(room.Host, user.ID.String()),
	})
}

func (c *RoomController) CreateRoom(ctx *gin.Context) {
	var user types.UserResponse
	if err := user.Get(ctx); err != nil {
		ctx.AbortWithStatusJSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	room, err := c.service.CreateRoom(user.ID.String())
	if err != nil {
		ctx.AbortWithStatusJSON(500, gin.H{"error": err.Error()})
		return
	}

	ctx.AbortWithStatusJSON(201, gin.H{
		"error": nil,
		"room":  room.RoomId,
	})
}
