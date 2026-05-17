package config

import (
	"fmt"
	"os"
	"strings"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Init() {
	_ = godotenv.Load()

	dbURL := strings.TrimSpace(os.Getenv("DATABASE_URL"))
	if dbURL == "" {
		fmt.Println("DATABASE_URL is required for Neon connection")
		os.Exit(1)
	}

	var err error
	DB, err = gorm.Open(postgres.Open(dbURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		fmt.Printf("Failed to connect to Neon database: %v\n", err)
		os.Exit(1)
	}

	sqlDB, err := DB.DB()
	if err != nil {
		fmt.Printf("Failed to get underlying DB: %v\n", err)
		os.Exit(1)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
}

func GetJWTSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "default-secret-change-me"
	}
	return secret
}

func GetGeminiAPIKey() string {
	return os.Getenv("GEMINI_API_KEY")
}

func GetPort() string {
	port := os.Getenv("PORT")
	if port == "" {
		return "8080"
	}
	return port
}
