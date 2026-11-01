package handlers

import "github.com/gofiber/fiber/v2"

// RegisterRoutes wires every public API route onto the /api group.
func RegisterRoutes(
	api fiber.Router,
	bab *BabHandler,
	kosakata *KosakataHandler,
	tts *TTSHandler,
	export *ExportHandler,
	dictionary *DictionaryHandler,
	kanjiLesson *KanjiLessonHandler,
	lesson *LessonHandler,
) {
	api.Get("/health", Health)

	api.Get("/lookup", dictionary.Lookup)

	api.Get("/bab", bab.List)
	api.Post("/bab", bab.Create)
	api.Get("/bab/:id", bab.Get)
	api.Patch("/bab/:id", bab.Update)
	api.Delete("/bab/:id", bab.Delete)

	api.Get("/bab/:id/kosakata", kosakata.ListByBab)
	api.Post("/bab/:id/kosakata", kosakata.Create)
	api.Post("/bab/:id/import", kosakata.Import)

	api.Patch("/kosakata/:id", kosakata.Update)
	api.Delete("/kosakata/:id", kosakata.Delete)

	api.Get("/kanji-lessons", kanjiLesson.List)
	api.Post("/kanji-lessons", kanjiLesson.Create)
	api.Post("/kanji-lessons/import", kanjiLesson.Import)
	api.Patch("/kanji-lessons/:id", kanjiLesson.Update)
	api.Delete("/kanji-lessons/:id", kanjiLesson.Delete)

	api.Get("/lessons", lesson.List)
	api.Post("/lessons", lesson.Create)
	api.Patch("/lessons/:id", lesson.Update)
	api.Delete("/lessons/:id", lesson.Delete)

	api.Post("/download/audio/:id", export.DownloadBabAudio)
	api.Get("/export/bab/:id", export.ExportBabJSON)

	api.Post("/tts/generate", tts.Generate)
	api.Get("/audio/:id/:lang", tts.Audio)
}
