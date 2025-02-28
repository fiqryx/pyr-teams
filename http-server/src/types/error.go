package types

import "errors"

var (
	ErrAlreadyExists error = errors.New("people already exists on room")
	ErrConnection    error = errors.New("connection error, please try again")
	ErrUnauthorized  error = errors.New("unauthorized")
)
