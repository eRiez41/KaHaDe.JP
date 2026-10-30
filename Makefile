GO ?= go
SHELL := /bin/sh

.PHONY: dev dev-backend dev-frontend install build build-backend build-frontend
.PHONY: migrate vet test clean

install:
	cd backend && $(GO) mod download
	cd frontend && npm install

dev:
	$(MAKE) -j2 dev-backend dev-frontend

dev-backend:
	cd backend && $(GO) run .

dev-frontend:
	cd frontend && npm run dev

migrate:
	cd backend && $(GO) run . -migrate-only

build: build-backend build-frontend

build-backend:
	cd backend && $(GO) build -o bin/api .

build-frontend:
	cd frontend && npm run build

vet:
	cd backend && $(GO) vet ./...

test:
	cd backend && $(GO) test ./...

clean:
	rm -rf backend/bin frontend/dist
