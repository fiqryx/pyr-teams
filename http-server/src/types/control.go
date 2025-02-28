package types

type Access string

const (
	Open    Access = "open"
	Trusted Access = "trusted"
)

type Control struct {
	HostManagement   bool   `json:"hostManagement"`
	AllowShareScreen bool   `json:"allowShareScreen"`
	AllowSendChat    bool   `json:"allowSendChat"`
	AllowReaction    bool   `json:"allowReaction"`
	AllowMicrophone  bool   `json:"allowMicrophone"`
	AllowVideo       bool   `json:"allowVideo"`
	RequireHost      bool   `json:"requireHost"`
	AccessType       Access `json:"access"`
}
