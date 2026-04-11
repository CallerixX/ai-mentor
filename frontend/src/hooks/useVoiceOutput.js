import { useCallback, useRef, useEffect, useState } from 'react'

const PREFERRED_VOICE_KEYWORDS = [
  'google',
  'microsoft',
  'samantha',
  'daniel',
  'karen',
  'paulina',
  'milena',
  'aziz',
  'yuri',
  'dmitry',
  'alena',
  'irina',
  'maxim',
]

const getBestRussianVoice = (voices) => {
  const ruVoices = voices.filter((v) => v.lang.startsWith('ru'))
  if (ruVoices.length === 0) return null

  for (const keyword of PREFERRED_VOICE_KEYWORDS) {
    const found = ruVoices.find((v) => v.name.toLowerCase().includes(keyword))
    if (found) return found
  }

  return ruVoices[0]
}

export const useVoiceOutput = (selectedVoiceName) => {
  const synthRef = useRef(window.speechSynthesis)
  const [availableVoices, setAvailableVoices] = useState([])

  useEffect(() => {
    const loadVoices = () => {
      const voices = synthRef.current?.getVoices() || []
      setAvailableVoices(voices)
    }

    loadVoices()
    if (synthRef.current) {
      synthRef.current.onvoiceschanged = loadVoices
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.onvoiceschanged = null
      }
    }
  }, [])

  const speak = useCallback((text) => {
    if (!synthRef.current) return

    synthRef.current.cancel()

    const cleanText = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]*)`/g, ' $1 ')
      .replace(/[#*_~>|]/g, '')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim()

    if (!cleanText) return

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = 'ru-RU'

    let voiceToUse = null

    if (selectedVoiceName) {
      voiceToUse = availableVoices.find((v) => v.name === selectedVoiceName)
    }

    if (!voiceToUse) {
      voiceToUse = getBestRussianVoice(availableVoices)
    }

    if (voiceToUse) {
      utterance.voice = voiceToUse

      const isNaturalVoice = PREFERRED_VOICE_KEYWORDS.some((k) =>
        voiceToUse.name.toLowerCase().includes(k)
      )

      if (isNaturalVoice) {
        utterance.rate = 0.95
        utterance.pitch = 1.0
      } else {
        utterance.rate = 0.85
        utterance.pitch = 0.8
      }
    } else {
      utterance.rate = 0.85
      utterance.pitch = 0.8
    }

    synthRef.current.speak(utterance)
  }, [availableVoices, selectedVoiceName])

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel()
    }
  }, [])

  const isSpeaking = useCallback(() => {
    return synthRef.current?.speaking || false
  }, [])

  const russianVoices = availableVoices.filter((v) => v.lang.startsWith('ru'))

  return { speak, stop, isSpeaking, russianVoices }
}

export default useVoiceOutput
