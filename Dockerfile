# Build the Vite React app
FROM node:20-alpine AS web-builder
WORKDIR /app/Web
COPY Web/package*.json ./
RUN npm install
COPY Web/ ./
RUN npm run build

# Build the Go backend
FROM golang:1.25-alpine AS go-builder
WORKDIR /app
COPY go.mod go.sum ./
# Enable automatic toolchain download so Go can fetch the required version
ENV GOTOOLCHAIN=auto
RUN go mod download
COPY . .
# Copy the built web assets into the Go embed directory
COPY --from=web-builder /app/web/dist ./internal/web/dist
RUN CGO_ENABLED=0 go build -o server ./cmd/server/main.go

# Final image
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=go-builder /app/server .
COPY --from=go-builder /app/openapi.json .
EXPOSE 8080
CMD ["./server"]
