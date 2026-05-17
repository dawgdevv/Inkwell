package api

import (
	"context"
	"crypto/sha256"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/dawgdevv/fi_money/internal/config"
	"github.com/gin-gonic/gin"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type PredictRequest struct {
	Context string `json:"context" binding:"required"`
}

type PredictResponse struct {
	Suggestions []string `json:"suggestions"`
}

// cacheEntry holds a cached prediction result
type cacheEntry struct {
	suggestions []string
	expiresAt   time.Time
}

var (
	predictionCache = make(map[string]cacheEntry)
	cacheMu         sync.RWMutex
	cacheTTL        = 30 * time.Second
)

func Predict(c *gin.Context) {
	var req PredictRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Context is required"})
		return
	}

	apiKey := config.GetGeminiAPIKey()
	if apiKey == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{"message": "Autocomplete not configured"})
		return
	}

	// Normalize text context: trim, take last ~100 words max
	textContext := strings.TrimSpace(req.Context)
	words := strings.Fields(textContext)
	if len(words) > 100 {
		words = words[len(words)-100:]
		textContext = strings.Join(words, " ")
	}

	// Don't predict on very short or empty context
	if len(textContext) < 2 {
		c.JSON(http.StatusOK, PredictResponse{Suggestions: []string{}})
		return
	}

	// Check cache
	hash := sha256.Sum256([]byte(textContext))
	cacheKey := fmt.Sprintf("%x", hash)

	cacheMu.RLock()
	entry, found := predictionCache[cacheKey]
	cacheMu.RUnlock()

	if found && time.Now().Before(entry.expiresAt) {
		c.JSON(http.StatusOK, PredictResponse{Suggestions: entry.suggestions})
		return
	}

	// Call Gemini API
	ctx, cancel := context.WithTimeout(c.Request.Context(), 3*time.Second)
	defer cancel()

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to create AI client"})
		return
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-2.5-flash")
	model.SetMaxOutputTokens(10)
	model.SetTemperature(0.1)

	prompt := fmt.Sprintf(`You are a word-level autocomplete engine for a note-taking app.
Given the text context below, predict the SINGLE most likely next word the user is about to type.
Return ONLY the word — no punctuation, no explanation, no quotes.
If the most natural completion is multiple words (like "New York"), return them separated by a single space.

Context: %q

Next word:`, textContext)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		c.JSON(http.StatusOK, PredictResponse{Suggestions: []string{}})
		return
	}

	suggestion := extractText(resp)
	suggestion = strings.TrimSpace(suggestion)
	suggestion = strings.Trim(suggestion, `"'`) // Remove any surrounding quotes

	// Clean suggestion: only keep first "word" (could be multi-word like "New York")
	// Split by newlines and take first line
	lines := strings.Split(suggestion, "\n")
	if len(lines) > 0 {
		suggestion = strings.TrimSpace(lines[0])
	}

	if suggestion == "" {
		c.JSON(http.StatusOK, PredictResponse{Suggestions: []string{}})
		return
	}

	suggestions := []string{suggestion}

	// Cache result
	cacheMu.Lock()
	predictionCache[cacheKey] = cacheEntry{
		suggestions: suggestions,
		expiresAt:   time.Now().Add(cacheTTL),
	}
	cacheMu.Unlock()

	c.JSON(http.StatusOK, PredictResponse{Suggestions: suggestions})
}

func extractText(resp *genai.GenerateContentResponse) string {
	var parts []string
	for _, cand := range resp.Candidates {
		if cand.Content != nil {
			for _, part := range cand.Content.Parts {
				if text, ok := part.(genai.Text); ok {
					parts = append(parts, string(text))
				}
			}
		}
	}
	return strings.Join(parts, "")
}
