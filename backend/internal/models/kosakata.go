package models

import "time"

// AudioStatus is the lifecycle of the generated audio for one vocabulary item.
type AudioStatus string

const (
	AudioStatusPending AudioStatus = "pending"
	AudioStatusReady   AudioStatus = "ready"
	AudioStatusFailed  AudioStatus = "failed"
)

// Audio holds the generated file locations for both languages.
type Audio struct {
	JP *string `json:"jp"`
	ID *string `json:"id"`
}

// Kosakata is one Japanese vocabulary item and its Indonesian meaning.
type Kosakata struct {
	ID          int64       `json:"id"`
	BabID       int64       `json:"babId"`
	Kanji       string      `json:"kanji"`
	Hira        string      `json:"hira"`
	Romaji      string      `json:"romaji"`
	Arti        string      `json:"arti"`
	Audio       Audio       `json:"audio"`
	AudioStatus AudioStatus `json:"audioStatus"`
	CreatedAt   time.Time   `json:"createdAt"`
	UpdatedAt   time.Time   `json:"updatedAt"`
}
