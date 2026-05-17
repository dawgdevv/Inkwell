.PHONY: build-ui build run dev

# Build the web UI and copy it into the Go embed directory
build-ui:
	cd Web && npm run build
	rm -rf internal/web/dist
	mkdir -p internal/web/dist
	cp -r web/dist/* internal/web/dist/

# Build the Go server (includes UI build)
build: build-ui
	go build -o server ./cmd/server/main.go

# Run the built server
run: build
	./server

# Run the Go server in dev mode (without rebuilding UI)
dev:
	go run ./cmd/server/main.go
