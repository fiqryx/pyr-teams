package types

type Join struct {
	RoomID string `json:"roomId"`
	User   User   `json:"user"`
}

type Emit struct {
	RoomID string `json:"roomId"`
	PeerID string `json:"peerId,omitempty"`
}

type ChatEmit struct {
	RoomID  string      `json:"roomId"`
	Message ChatMessage `json:"message,omitempty"`
}

type ReactionEmit struct {
	RoomID   string `json:"roomId"`
	Reaction string `json:"reaction,omitempty"`
}

type ControlEmit struct {
	RoomID  string  `json:"roomId"`
	Control Control `json:"control,omitempty"`
}
