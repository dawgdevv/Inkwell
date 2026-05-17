import { useState, useRef, useCallback, useEffect } from 'react'
import { api } from '../api/client'

export function useAutocomplete(
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  content: string
) {
  const [suggestion, setSuggestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastContextRef = useRef('')

  const getContextBeforeCursor = useCallback(() => {
    const el = textareaRef.current
    if (!el) return ''
    const cursorPos = el.selectionStart
    return content.slice(0, cursorPos)
  }, [textareaRef, content])

  const fetchSuggestion = useCallback(async (context: string) => {
    if (!context.trim() || context.trim().length < 2) {
      setSuggestion('')
      return
    }

    // Don't re-fetch if context hasn't changed meaningfully
    const trimmed = context.trimEnd()
    if (trimmed === lastContextRef.current) return
    lastContextRef.current = trimmed

    setIsLoading(true)
    try {
      const resp = await api.predict(trimmed)
      const word = resp.suggestions[0] || ''
      // Only show suggestion if it would actually append new text
      const lastWord = trimmed.split(/\s+/).pop() || ''
      if (word && !word.toLowerCase().startsWith(lastWord.toLowerCase())) {
        setSuggestion(word)
      } else if (word && lastWord && word.toLowerCase() !== lastWord.toLowerCase()) {
        setSuggestion(word)
      } else {
        setSuggestion('')
      }
    } catch {
      setSuggestion('')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounced prediction on content change
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    const context = getContextBeforeCursor()
    // Only predict if we're in the middle of a word (not after space/punctuation)
    const lastChar = context.slice(-1)
    if (!lastChar || /\s/.test(lastChar) || /[.,;!?()]/.test(lastChar)) {
      setSuggestion('')
      return
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestion(context)
    }, 250)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [content, getContextBeforeCursor, fetchSuggestion])

  const acceptSuggestion = useCallback(() => {
    if (!suggestion || !textareaRef.current) return

    const el = textareaRef.current
    const cursorPos = el.selectionStart
    const before = content.slice(0, cursorPos)
    const after = content.slice(cursorPos)

    // Insert suggestion with a leading space if needed
    const needsSpace = before.length > 0 && !/\s$/.test(before)
    const insertText = needsSpace ? ` ${suggestion} ` : `${suggestion} `

    const newContent = before + insertText + after
    const newCursorPos = cursorPos + insertText.length

    // Update textarea value and cursor
    el.value = newContent
    el.setSelectionRange(newCursorPos, newCursorPos)
    el.focus()

    setSuggestion('')
    lastContextRef.current = ''

    // Trigger onChange manually since we modified value directly
    const event = new Event('input', { bubbles: true })
    el.dispatchEvent(event)

    return newContent
  }, [suggestion, textareaRef, content])

  const dismissSuggestion = useCallback(() => {
    setSuggestion('')
  }, [])

  return {
    suggestion,
    isLoading,
    acceptSuggestion,
    dismissSuggestion,
  }
}
