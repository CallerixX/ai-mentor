import React, { useState, useEffect, useRef, useCallback } from 'react'
import Chat from './components/Chat'
import MarkdownToolbar from './components/MarkdownToolbar'
import VoiceInput from './components/VoiceInput'
import CodeRunner from './components/CodeRunner'
import SQLRunner from './components/SQLRunner'
import SessionList from './components/SessionList'
import SnippetsPanel from './components/SnippetsPanel'
import SolutionChecker from './components/SolutionChecker'
import ThemeSwitcher from './components/ThemeSwitcher'
import SkillSelector, { SKILLS } from './components/SkillSelector'
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
  const [mode, setMode] = useState(() => localStorage.getItem('ai-mentor-mode') || 'Обучение')
  const [selectedVoice, setSelectedVoice] = useState(() => localStorage.getItem('ai-mentor-voice') || '')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCodeRunner, setShowCodeRunner] = useState(false)
  const [showSQLRunner, setShowSQLRunner] = useState(false)
  const [pendingCode, setPendingCode] = useState('')
  const [pendingTask, setPendingTask] = useState('')
  const [showSolutionChecker, setShowSolutionChecker] = useState(false)
  const [showSnippets, setShowSnippets] = useState(false)

  // Skills
  const [skill, setSkill] = useState(() => localStorage.getItem('ai-mentor-skill') || '')
  const [showSkillPicker, setShowSkillPicker] = useState(!localStorage.getItem('ai-mentor-skill'))

  // Sessions
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)

  // Theme
  const [theme, setTheme] = useState(() => localStorage.getItem('ai-mentor-theme') || 'dark')

  const textareaRef = useRef(null)

  const { speak, stop, isSpeaking: isVoiceSpeaking, russianVoices } = useVoiceOutput(selectedVoice)

  const currentSkill = SKILLS.find((s) => s.id === skill) || SKILLS[0]

  // Theme
  useEffect(() => {
    localStorage.setItem('ai-mentor-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Voice
  useEffect(() => {
    if (selectedVoice) localStorage.setItem('ai-mentor-voice', selectedVoice)
    else localStorage.removeItem('ai-mentor-voice')
  }, [selectedVoice])

  // Mode
  useEffect(() => {
    localStorage.setItem('ai-mentor-mode', mode)
  }, [mode])

  // Skill
  useEffect(() => {
    if (skill) localStorage.setItem('ai-mentor-skill', skill)
  }, [skill])

  // Load sessions
  useEffect(() => {
    fetch('/api/sessions')
      .then((res) => res.json())
      .then((data) => {
        if (data.sessions && data.sessions.length > 0) {
          setSessions(data.sessions)
          const lastActive = localStorage.getItem('ai-mentor-active-session')
          const sid = lastActive && data.sessions.find((s) => s.id === parseInt(lastActive))
            ? parseInt(lastActive) : data.sessions[0].id
          setActiveSessionId(sid)
          loadSessionHistory(sid)
        }
      })
      .catch((err) => { console.error(err); setIsLoaded(true) })
  }, [])

  useEffect(() => {
    if (activeSessionId) localStorage.setItem('ai-mentor-active-session', activeSessionId)
  }, [activeSessionId])

  const loadSessionHistory = (sid) => {
    fetch(`/api/history?session_id=${sid}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages ? data.messages.map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
          timestamp: m.timestamp || new Date().toISOString(),
        })) : [])
        setIsLoaded(true)
      })
      .catch((err) => { console.error(err); setIsLoaded(true) })
  }

  const switchSession = (sid) => { setActiveSessionId(sid); loadSessionHistory(sid) }

  const createSession = (name) => {
    fetch('/api/sessions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `${name} (${currentSkill.icon} ${currentSkill.label})` }),
    })
      .then((res) => res.json())
      .then((data) => { setSessions((p) => [data, ...p]); switchSession(data.id) })
      .catch(console.error)
  }

  const deleteSession = (sid) => {
    fetch(`/api/sessions/${sid}`, { method: 'DELETE' })
      .then(() => {
        setSessions((p) => p.filter((s) => s.id !== sid))
        if (activeSessionId === sid && sessions.length > 1) {
          const remaining = sessions.filter((s) => s.id !== sid)
          if (remaining.length > 0) switchSession(remaining[0].id)
        }
      })
      .catch(console.error)
  }

  const renameSession = (sid, name) => {
    fetch(`/api/sessions/${sid}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
      .then(() => setSessions((p) => p.map((s) => (s.id === sid ? { ...s, name } : s))))
      .catch(console.error)
  }

  const formatTime = (iso) => {
    if (!iso) return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return
    const now = new Date().toISOString()
    const userMessage = { role: 'user', content: input.trim(), timestamp: now }
    setMessages((p) => [...p, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content, mode, session_id: activeSessionId, skill }),
      })
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      const ts = new Date().toISOString()
      let assistantMessage = { role: 'assistant', content: '', timestamp: ts }
      setMessages((p) => [...p, assistantMessage])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.error) assistantMessage.content += `\n[Ошибка: ${data.error}]`
              else if (data.content && !data.done) assistantMessage.content += data.content
              setMessages((p) => { const u = [...p]; u[u.length - 1] = { ...assistantMessage }; return u })
            } catch { /* skip */ }
          }
        }
      }
    } catch (err) {
      console.error(err)
      setMessages((p) => [...p, { role: 'assistant', content: '[Ошибка соединения]', timestamp: new Date().toISOString() }])
    } finally { setIsTyping(false) }
  }

  const handleKeyPress = (e) => {
    if (e.ctrlKey && (e.key === 'b' || e.key === 'B')) { e.preventDefault(); insertAtCursor('**', '**'); return }
    if (e.ctrlKey && (e.key === 'i' || e.key === 'I')) { e.preventDefault(); insertAtCursor('_', '_'); return }
    if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); sendMessage(); return }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text')
    if (!text) return
    const isCode = text.includes('\n') && (
      text.includes('function') || text.includes('const ') || text.includes('let ') ||
      text.includes('import ') || text.includes('def ') || text.includes('class ') ||
      text.includes('SELECT ') || text.includes('INSERT ') || text.includes('CREATE ') ||
      text.includes('FROM ') || text.includes('JOIN ') || text.includes('{') || text.includes('=>')
    )
    if (isCode) {
      e.preventDefault()
      const textarea = textareaRef.current
      if (!textarea) return
      const start = textarea.selectionStart; const end = textarea.selectionEnd
      const before = '\n```\n'; const after = '\n```\n'
      const newText = input.substring(0, start) + before + text + after + input.substring(end)
      setInput(newText)
      setTimeout(() => { textarea.focus(); const np = start + before.length + text.length + after.length; textarea.setSelectionRange(np, np) }, 0)
    }
  }

  const insertAtCursor = (before, after = '') => {
    const ta = textareaRef.current; if (!ta) return
    const start = ta.selectionStart; const end = ta.selectionEnd
    const sel = input.substring(start, end)
    const newText = input.substring(0, start) + before + sel + after + input.substring(end)
    setInput(newText)
    setTimeout(() => { ta.focus(); const np = start + before.length + sel.length; ta.setSelectionRange(np, np) }, 0)
  }

  const handleVoiceTranscript = useCallback((text) => {
    setInput((p) => (p ? p + ' ' : '') + text)
    if (textareaRef.current) textareaRef.current.focus()
  }, [])

  const handleSendToEditor = useCallback((code) => {
    const isSQL = /SELECT|FROM|JOIN|WHERE|GROUP BY|ORDER BY/i.test(code)
    if (isSQL) { setPendingCode(code); setPendingTask(''); setShowSQLRunner(true); setShowCodeRunner(false) }
    else { setPendingCode(code); setPendingTask(''); setShowCodeRunner(true); setShowSQLRunner(false) }
  }, [])

  const handleRunCodeFromChat = useCallback((code) => {
    const isSQL = /SELECT|FROM|JOIN|WHERE/i.test(code)
    if (isSQL) { setPendingCode(code); setShowSQLRunner(true); setShowCodeRunner(false) }
    else { setPendingCode(code); setShowCodeRunner(true); setShowSQLRunner(false) }
  }, [])

  const handleSaveSnippet = useCallback((code) => {
    const snippets = JSON.parse(localStorage.getItem('ai-mentor-snippets') || '[]')
    snippets.unshift({ id: Date.now(), code, tags: ['из чата'], created: new Date().toLocaleDateString('ru-RU') })
    localStorage.setItem('ai-mentor-snippets', JSON.stringify(snippets))
    setShowSnippets(true)
  }, [])

  const clearHistory = async () => {
    if (!activeSessionId) return
    try { await fetch(`/api/history?session_id=${activeSessionId}`, { method: 'DELETE' }); setMessages([]) }
    catch (err) { console.error(err) }
  }

  const exportChat = () => {
    if (messages.length === 0) return
    const activeSession = sessions.find((s) => s.id === activeSessionId)
    const sName = activeSession ? activeSession.name : 'Чат'
    const content = messages.map((m) => {
      const time = formatTime(m.timestamp)
      const role = m.role === 'user' ? '👤 Вы' : '🤖 Ментор'
      return `### ${role} (${time})\n\n${m.content}\n`
    }).join('\n---\n\n')
    const header = `# AI Mentor — ${sName}\n\n**Навык:** ${currentSkill.icon} ${currentSkill.label}\n**Режим:** ${mode}\n**Дата:** ${new Date().toLocaleString('ru-RU')}\n\n---\n\n`
    const blob = new Blob([header + content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `ai-mentor-${sName}-${new Date().toISOString().slice(0, 10)}.md`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSkillConfirm = (newSkill) => {
    setSkill(newSkill)
    setShowSkillPicker(false)
    createSession('Новый чат')
  }

  const filteredMessages = searchQuery.trim()
    ? messages.filter((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages

  // Skill picker overlay
  if (showSkillPicker) {
    return (
      <div className={`app-wrapper theme-${theme}`}>
        <SkillSelector currentSkill={skill} onChange={setSkill} onConfirm={handleSkillConfirm} />
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={`app-wrapper theme-${theme}`}>
        <div className="welcome-screen"><div className="welcome-icon">🧠</div><div className="welcome-title">Загрузка...</div></div>
      </div>
    )
  }

  return (
    <div className={`app-wrapper theme-${theme} ${showCodeRunner || showSQLRunner ? 'with-code-runner' : ''} ${showSnippets ? 'with-snippets' : ''} ${showSolutionChecker ? 'with-solution-checker' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">🧠</div>
          <span className="sidebar-title">AI Mentor</span>
        </div>

        <SessionList sessions={sessions} activeSessionId={activeSessionId} onSelect={switchSession} onCreate={createSession} onDelete={deleteSession} onRename={renameSession} />

        <div className="mode-section">
          <div className="mode-label">Навык</div>
          <div className="skill-selector-compact">
            {SKILLS.map((s) => (
              <button key={s.id} className={`skill-btn ${skill === s.id ? 'active' : ''}`} onClick={() => setSkill(s.id)} title={s.label}>
                {s.icon}
              </button>
            ))}
            <button className="skill-btn skill-reset-btn" onClick={() => { setSkill(''); setShowSkillPicker(true) }} title="Сменить навык">
              🔄
            </button>
          </div>
        </div>

        <div className="mode-section">
          <div className="mode-label">Режим</div>
          <div className="mode-selector-modern">
            {MODES.map((m) => (
              <button key={m.id} className={`mode-btn ${mode === m.id ? 'active' : ''}`} onClick={() => setMode(m.id)}>
                <span className="mode-icon">{m.icon}</span>{m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-tools">
          <button className={`tool-btn ${showCodeRunner ? 'tool-btn-active' : ''}`} onClick={() => { setPendingCode(''); setPendingTask(''); setShowCodeRunner(!showCodeRunner); setShowSQLRunner(false) }}>
            <span className="tool-icon">🐍</span> Python REPL
          </button>
          <button className={`tool-btn ${showSQLRunner ? 'tool-btn-active' : ''}`} onClick={() => { setPendingCode(''); setPendingTask(''); setShowSQLRunner(!showSQLRunner); setShowCodeRunner(false) }}>
            <span className="tool-icon">🗄️</span> SQL REPL
          </button>
          <button className={`tool-btn ${showSnippets ? 'tool-btn-active' : ''}`} onClick={() => setShowSnippets(!showSnippets)}>
            <span className="tool-icon">📌</span> Сниппеты
          </button>
          {mode === 'Практика' && (
            <button className={`tool-btn ${showSolutionChecker ? 'tool-btn-active' : ''}`} onClick={() => { setPendingCode(''); setPendingTask(''); setShowSolutionChecker(!showSolutionChecker) }}>
              <span className="tool-icon">✅</span> Проверка
            </button>
          )}
        </div>

        <div className="sidebar-footer">
          <ThemeSwitcher currentTheme={theme} onChange={setTheme} />
          <button className="clear-btn" onClick={clearHistory}>🗑️ Очистить чат</button>
          <button className="export-btn" onClick={exportChat} disabled={messages.length === 0}>📥 Экспорт</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="chat-header">
          <div className="chat-header-title">
            {currentSkill.icon} {currentSkill.label} — {MODES.find((m) => m.id === mode)?.label}
            {sessions.find((s) => s.id === activeSessionId) && (
              <span className="session-badge">{sessions.find((s) => s.id === activeSessionId)?.name}</span>
            )}
          </div>
          <div className="chat-header-actions">
            {russianVoices.length > 0 && (
              <div className="voice-selector">
                <select className="voice-select" value={selectedVoice || ''} onChange={(e) => setSelectedVoice(e.target.value)}>
                  <option value="">Авто</option>
                  {russianVoices.map((v) => <option key={v.name} value={v.name}>{v.name}</option>)}
                </select>
                <button className="voice-test-btn" onClick={() => speak && speak('Привет! Я ваш AI-ментор.')}>🔊 Тест</button>
              </div>
            )}
            <button className="header-action-btn" onClick={() => setShowSearch(!showSearch)} title="Поиск (Ctrl+F)">🔍</button>
            <div className="chat-header-status"><span className="status-dot"></span> Ollama</div>
          </div>
        </header>

        {showSearch && (
          <div className="search-bar">
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Поиск по чату..." className="search-input" />
            <span className="search-hint">{searchQuery.trim() ? `Найдено: ${filteredMessages.length} из ${messages.length}` : `${messages.length} сообщений`}</span>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="welcome-screen">
            <div className="welcome-icon">{currentSkill.icon}</div>
            <h2 className="welcome-title">{currentSkill.label}</h2>
            <p className="welcome-subtitle">Спроси что-нибудь или попроси ментора начать урок по {currentSkill.label.toLowerCase()}.</p>
            <div className="welcome-hints">
              <div className="hint-item"><kbd>Ctrl</kbd>+<kbd>Enter</kbd> отправить</div>
              <div className="hint-item"><kbd>Ctrl</kbd>+<kbd>F</kbd> поиск</div>
              <div className="hint-item"><kbd>Esc</kbd> закрыть</div>
            </div>
          </div>
        ) : (
          <Chat
            messages={filteredMessages} isTyping={isTyping} formatTime={formatTime} searchQuery={searchQuery}
            onSendToEditor={handleSendToEditor} onRunCode={handleRunCodeFromChat} onSaveSnippet={handleSaveSnippet}
            isVoiceSpeaking={isVoiceSpeaking()} onSpeak={speak} onStopSpeak={stop}
          />
        )}

        <div className="input-area">
          <MarkdownToolbar onInsert={insertAtCursor} />
          <div className="input-wrapper">
            <VoiceInput onTranscript={handleVoiceTranscript} disabled={isTyping} />
            <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyPress} onPaste={handlePaste} placeholder="Напишите сообщение..." disabled={isTyping} rows={1} />
            <button className="send-btn" onClick={sendMessage} disabled={isTyping || !input.trim()}>➤</button>
          </div>
        </div>
      </main>

      {showCodeRunner && (
        <aside className="code-runner-panel">
          <div className="code-runner-panel-header"><span>🐍 Python REPL</span><button className="close-panel-btn" onClick={() => setShowCodeRunner(false)}>✕</button></div>
          <CodeRunner initialCode={pendingCode} />
        </aside>
      )}

      {showSQLRunner && (
        <aside className="code-runner-panel">
          <div className="code-runner-panel-header"><span>🗄️ SQL REPL (DuckDB)</span><button className="close-panel-btn" onClick={() => setShowSQLRunner(false)}>✕</button></div>
          <SQLRunner initialCode={pendingCode} />
        </aside>
      )}

      {showSnippets && <SnippetsPanel isOpen={showSnippets} onClose={() => setShowSnippets(false)} />}
      {showSolutionChecker && <SolutionChecker isOpen={showSolutionChecker} onClose={() => setShowSolutionChecker(false)} initialCode={pendingCode} initialTask={pendingTask} />}
    </div>
  )
}

export default App
