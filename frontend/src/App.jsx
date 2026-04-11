import React, { useState, useEffect, useRef, useCallback } from 'react'
import Chat from './components/Chat'
import MarkdownToolbar from './components/MarkdownToolbar'
import VoiceInput from './components/VoiceInput'
import CodeRunner from './components/CodeRunner'
import useVoiceOutput from './hooks/useVoiceOutput'

const MODES = [
  { id: 'Обучение', icon: '📚', label: 'Обучение' },
  { id: 'Дебаг', icon: '🐛', label: 'Дебаг' },
  { id: 'Код-ревью', icon: '🔍', label: 'Код-ревью' },
  { id: 'Практика', icon: '💻', label: 'Практика' },
]

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('ai-mentor-mode') || 'Обучение'
  })
  const [selectedVoice, setSelectedVoice] = useState(() => {
    return localStorage.getItem('ai-mentor-voice') || ''
  })
  const [isTyping, setIsTyping] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCodeRunner, setShowCodeRunner] = useState(false)
  const [pendingCode, setPendingCode] = useState('')
  const textareaRef = useRef(null)

  const { speak, stop, isSpeaking: isVoiceSpeaking, russianVoices } = useVoiceOutput(selectedVoice)

  useEffect(() => {
    if (selectedVoice) {
      localStorage.setItem('ai-mentor-voice', selectedVoice)
    } else {
      localStorage.removeItem('ai-mentor-voice')
    }
  }, [selectedVoice])

  useEffect(() => {
    localStorage.setItem('ai-mentor-mode', mode)
  }, [mode])

  useEffect(() => {
    fetch('/api/history')
      .then((res) => res.json())
      .then((data) => {
        if (data.messages && data.messages.length > 0) {
          const formatted = data.messages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
            timestamp: m.timestamp || new Date().toISOString(),
          }))
          setMessages(formatted)
        }
        setIsLoaded(true)
      })
      .catch((err) => {
        console.error('Error loading history:', err)
        setIsLoaded(true)
      })
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault()
        setShowSearch((prev) => !prev)
      }
      if (e.key === 'Escape') {
        if (showSearch) {
          setShowSearch(false)
          setSearchQuery('')
        } else if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showSearch])

  const formatTime = (isoString) => {
    if (!isoString) return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    const date = new Date(isoString)
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return

    const now = new Date().toISOString()
    const userMessage = { role: 'user', content: input.trim(), timestamp: now }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content, mode }),
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      const assistantTimestamp = new Date().toISOString()
      let assistantMessage = { role: 'assistant', content: '', timestamp: assistantTimestamp }

      setMessages((prev) => [...prev, assistantMessage])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.error) {
                assistantMessage.content += `\n[Ошибка: ${data.error}]`
              } else if (data.content && !data.done) {
                assistantMessage.content += data.content
              }
              setMessages((prev) => {
                const updated = [...prev]
                updated[updated.length - 1] = { ...assistantMessage }
                return updated
              })
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '[Ошибка соединения с сервером]', timestamp: new Date().toISOString() },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.ctrlKey && (e.key === 'b' || e.key === 'B')) {
      e.preventDefault()
      insertAtCursor('**', '**')
      return
    }
    if (e.ctrlKey && (e.key === 'i' || e.key === 'I')) {
      e.preventDefault()
      insertAtCursor('_', '_')
      return
    }
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault()
      sendMessage()
      return
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text')
    if (!text) return

    const isCode = text.includes('\n') && (
      text.includes('function') ||
      text.includes('const ') ||
      text.includes('let ') ||
      text.includes('var ') ||
      text.includes('import ') ||
      text.includes('def ') ||
      text.includes('class ') ||
      text.includes('for ') ||
      text.includes('if ') ||
      text.includes('{') ||
      text.includes('=>') ||
      text.includes(';') ||
      text.includes('#include') ||
      text.includes('print(')
    )

    if (isCode) {
      e.preventDefault()
      const before = '\n```\n'
      const after = '\n```\n'
      const textarea = textareaRef.current
      if (!textarea) return
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newText = input.substring(0, start) + before + text + after + input.substring(end)
      setInput(newText)
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + before.length + text.length + after.length, start + before.length + text.length + after.length)
      }, 0)
    }
  }

  const insertAtCursor = (before, after = '') => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = input.substring(start, end)
    const newText = input.substring(0, start) + before + selectedText + after + input.substring(end)
    setInput(newText)
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const handleVoiceTranscript = useCallback((text) => {
    setInput((prev) => {
      const separator = prev ? prev + ' ' : ''
      return separator + text
    })
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  const handleSendToEditor = useCallback((code) => {
    setPendingCode(code)
    setShowCodeRunner(true)
  }, [])

  const clearHistory = async () => {
    try {
      await fetch('/api/history', { method: 'DELETE' })
      setMessages([])
    } catch (err) {
      console.error('Error clearing history:', err)
    }
  }

  const exportChat = () => {
    if (messages.length === 0) return
    const content = messages
      .map((m) => {
        const time = formatTime(m.timestamp)
        const role = m.role === 'user' ? '👤 Вы' : '🤖 Ментор'
        return `### ${role} (${time})\n\n${m.content}\n`
      })
      .join('\n---\n\n')

    const header = `# AI Mentor — Экспорт чата\n\n**Режим:** ${mode}\n**Дата:** ${new Date().toLocaleString('ru-RU')}\n\n---\n\n`
    const blob = new Blob([header + content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-mentor-chat-${new Date().toISOString().slice(0, 10)}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const currentMode = MODES.find((m) => m.id === mode) || MODES[0]

  const filteredMessages = searchQuery.trim()
    ? messages.filter((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages

  if (!isLoaded) {
    return (
      <div className="app-wrapper">
        <div className="welcome-screen">
          <div className="welcome-icon">🧠</div>
          <div className="welcome-title">Загрузка...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`app-wrapper ${showCodeRunner ? 'with-code-runner' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">🧠</div>
          <span className="sidebar-title">AI Mentor</span>
        </div>

        <div className="mode-section">
          <div className="mode-label">Режим обучения</div>
          <div className="mode-selector-modern">
            {MODES.map((m) => (
              <button
                key={m.id}
                className={`mode-btn ${mode === m.id ? 'active' : ''}`}
                onClick={() => setMode(m.id)}
              >
                <span className="mode-icon">{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-tools">
          <button
            className={`tool-btn ${showCodeRunner ? 'tool-btn-active' : ''}`}
            onClick={() => setShowCodeRunner(!showCodeRunner)}
          >
            <span className="tool-icon">🐍</span>
            Python REPL
          </button>
        </div>

        <div className="sidebar-footer">
          <button className="clear-btn" onClick={clearHistory}>
            🗑️ Очистить историю
          </button>
          <button className="export-btn" onClick={exportChat} disabled={messages.length === 0}>
            📥 Экспорт чата
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="chat-header">
          <div className="chat-header-title">
            {currentMode.icon} {currentMode.label}
          </div>
          <div className="chat-header-actions">
            {russianVoices.length > 0 && (
              <div className="voice-selector">
                <select
                  className="voice-select"
                  value={selectedVoice || ''}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  title="Выбор голоса"
                >
                  <option value="">Авто (лучший)</option>
                  {russianVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name}
                    </option>
                  ))}
                </select>
                <button
                  className="voice-test-btn"
                  onClick={() => {
                    const testText = 'Привет! Я ваш AI-ментор. Как дела?'
                    if (speak) speak(testText)
                  }}
                >
                  🔊 Тест
                </button>
              </div>
            )}
            <button className="header-action-btn" onClick={() => setShowSearch(!showSearch)} title="Поиск (Ctrl+F)">
              🔍
            </button>
            <div className="chat-header-status">
              <span className="status-dot"></span>
              Ollama подключена
            </div>
          </div>
        </header>

        {showSearch && (
          <div className="search-bar">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по чату..."
              className="search-input"
            />
            <span className="search-hint">
              {searchQuery.trim()
                ? `Найдено: ${filteredMessages.length} из ${messages.length}`
                : `${messages.length} сообщений`}
            </span>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="welcome-screen">
            <div className="welcome-icon">🚀</div>
            <h2 className="welcome-title">Добро пожаловать в AI Mentor</h2>
            <p className="welcome-subtitle">
              Выберите режим обучения и начните диалог. Я помогу вам разобраться в программировании.
            </p>
            <div className="welcome-hints">
              <div className="hint-item">
                <kbd>Ctrl</kbd> + <kbd>Enter</kbd> — отправить
              </div>
              <div className="hint-item">
                <kbd>Ctrl</kbd> + <kbd>F</kbd> — поиск
              </div>
              <div className="hint-item">
                <kbd>Esc</kbd> — закрыть поиск
              </div>
            </div>
          </div>
        ) : (
          <Chat
            messages={filteredMessages}
            isTyping={isTyping}
            formatTime={formatTime}
            searchQuery={searchQuery}
            onSendToEditor={handleSendToEditor}
            isVoiceSpeaking={isVoiceSpeaking()}
            onSpeak={speak}
            onStopSpeak={stop}
          />
        )}

        <div className="input-area">
          <MarkdownToolbar onInsert={insertAtCursor} />
          <div className="input-wrapper">
            <VoiceInput onTranscript={handleVoiceTranscript} disabled={isTyping} />
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              onPaste={handlePaste}
              placeholder="Напишите сообщение... (Enter для отправки, Shift+Enter — новая строка)"
              disabled={isTyping}
              rows={1}
            />
            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={isTyping || !input.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      </main>

      {showCodeRunner && (
        <aside className="code-runner-panel">
          <div className="code-runner-panel-header">
            <span>🐍 Python REPL</span>
            <button className="close-panel-btn" onClick={() => setShowCodeRunner(false)}>✕</button>
          </div>
          <CodeRunner initialCode={pendingCode} />
        </aside>
      )}
    </div>
  )
}

export default App
