package models

import "time"

// Bab is a vocabulary chapter.
type Bab struct {
	ID        int64     `json:"id"`
	Nama      string    `json:"nama"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// BabSummary adds aggregate counts used by the chapter list.
type BabSummary struct {
	Bab
	CountKosakata   int `json:"countKosakata"`
	AudioReadyCount int `json:"audioReadyCount"`
}
