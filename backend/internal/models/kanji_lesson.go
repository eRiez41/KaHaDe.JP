package models

import "time"

// KanjiLesson is one independently managed kanji lesson entry.
type KanjiLesson struct {
	ID         int64     `json:"id"`
	LessonID   int64     `json:"lessonId"`
	LessonNama string    `json:"lessonNama,omitempty"`
	Kanji      string    `json:"kanji"`
	Hira       string    `json:"hira"`
	Romaji     string    `json:"romaji"`
	Arti       string    `json:"arti"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}
