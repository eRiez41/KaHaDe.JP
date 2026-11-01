package models

import "time"

// Lesson is a named group of standalone kanji lesson entries.
type Lesson struct {
	ID        int64     `json:"id"`
	Nama      string    `json:"nama"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// LessonSummary adds the number of kanji entries in the lesson.
type LessonSummary struct {
	Lesson
	CountKanji int `json:"countKanji"`
}
