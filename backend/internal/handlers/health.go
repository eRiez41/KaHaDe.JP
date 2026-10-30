package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
)

const serviceVersion = "0.1.0"

type healthData struct {
	Status  string    `json:"status"`
	Service string    `json:"service"`
	Version string    `json:"version"`
	Time    time.Time `json:"time"`
}

type healthResponse struct {
	Success bool       `json:"success"`
	Data    healthData `json:"data"`
}

// Health reports that the API process is up and reachable.
func Health(c *fiber.Ctx) error {
	return c.JSON(healthResponse{
		Success: true,
		Data: healthData{
			Status:  "ok",
			Service: "tts-jpn-api",
			Version: serviceVersion,
			Time:    time.Now().UTC(),
		},
	})
}
