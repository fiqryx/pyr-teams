package types

type ChatMessage struct {
	UserID    string  `json:"userId"`
	Name      string  `json:"name"`
	Text      string  `json:"text"`
	Timestamp float64 `json:"timestamp"`
	Aggregate *bool   `json:"aggregate,omitempty"`
}
