import React, { useState, useEffect, useCallback, useRef } from 'react'

const VoiceInput = ({ onTranscript, disabled }) => {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [interimText, setInterimText] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setIsSupported(true)
      const recognition = new SpeechRecognition()
      recognition.lang = 'ru-RU'
      recognition.interimResults = true
      recognition.continuous = false
      recognition.maxAlternatives = 1

      recognition.onresult = (event) => {
        let finalTranscript = ''
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interim += transcript
          }
        }
        if (finalTranscript) {
          onTranscript(finalTranscript)
        }
        setInterimText(interim)
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        setInterimText('')
      }

      recognition.onend = () => {
        setIsListening(false)
        setInterimText('')
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [onTranscript])

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      setInterimText('')
    } else {
      setInterimText('')
      recognitionRef.current.start()
      setIsListening(true)
    }
  }, [isListening])

  if (!isSupported) return null

  return (
    <div className="voice-input-container">
      <button
        className={`voice-btn ${isListening ? 'voice-btn-active' : ''}`}
        onClick={toggleListening}
        disabled={disabled}
        title={isListening ? 'Остановить запись' : 'Голосовой ввод'}
        type="button"
      >
        {isListening ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        )}
      </button>
      {isListening && (
        <div className="voice-status">
          <span className="voice-waves">
            <span></span><span></span><span></span><span></span><span></span>
          </span>
          {interimText && <span className="voice-interim">{interimText}</span>}
        </div>
      )}
    </div>
  )
}

export default VoiceInput
