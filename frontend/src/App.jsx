import { useState, useEffect, useRef, useCallback } from 'react'
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
import AchievementToast from './components/AchievementToast'
import StatsDashboard from './components/StatsDashboard'
import { Search, Send, RotateCcw, Trash2, Download, Code, Database, Bookmark, CheckSquare, Book, Bug, CheckCircle, Laptop, Palette } from 'lucide-react'
import { motion } from 'motion/react'
import Icon from './components/Icon'
import useVoiceOutput from './hooks/useVoiceOutput'
import useProgress from './hooks/useProgress'
import { api } from './api'

const MODES = [
  { id: 'Обучение', icon: Book, label: 'Обучение' },
  { id: 'Дебаг', icon: Bug, label: 'Дебаг' },
  { id: 'Код-ревью', icon: CheckCircle, label: 'Код-ревью' },
  { id: 'Практика', icon: Laptop, label: 'Практика' },
]

const AVAILABLE_MODELS = [
  { id: 'qwen2.5-coder:7b', label: 'Локальная (Qwen)' },
  { id: 'Kimi-k2.5:cloud', label: 'Облачная (Kimi)' },
  { id: 'glm-5:cloud', label: 'Облачная (GLM-5)' },
  { id: 'qwen3.5:397b-cloud', label: 'Облачная (Qwen-3.5 Max)' }
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
  const [showStats, setShowStats] = useState(false)

  const [skill, setSkill] = useState(() => localStorage.getItem('ai-mentor-skill') || '')
  const [showSkillPicker, setShowSkillPicker] = useState(!localStorage.getItem('ai-mentor-skill'))

  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [theme, setTheme] = useState(() => localStorage.getItem('ai-mentor-theme') || 'dark')
  const [designStyle, setDesignStyle] = useState(() => localStorage.getItem('ai-mentor-design-style') || 'glass')
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('ai-mentor-model') || 'qwen2.5-coder:7b')
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackStatus, setFeedbackStatus] = useState('')

  const textareaRef = useRef(null)
  const { speak, stop, isSpeaking: isVoiceSpeaking, russianVoices } = useVoiceOutput(selectedVoice)
  const {
    stats, levelInfo, unlockedAchievements, lockedAchievements,
    showAchievementToast, resetProgress,
    recordMessage, recordCodeRun, recordVoiceMessage, recordSkill, recordExport, recordSnippetSave,
  } = useProgress()

  const currentSkill = SKILLS.find((s) => s.id === skill) || SKILLS[0]

  useEffect(() => {
    localStorage.setItem('ai-mentor-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-design-style', designStyle)
    localStorage.setItem('ai-mentor-design-style', designStyle)
  }, [theme, designStyle])

  useEffect(() => {
    localStorage.setItem('ai-mentor-model', selectedModel)
  }, [selectedModel])

  useEffect(() => {
    if (selectedVoice) localStorage.setItem('ai-mentor-voice', selectedVoice)
    else localStorage.removeItem('ai-mentor-voice')
  }, [selectedVoice])

  useEffect(() => {
    localStorage.setItem('ai-mentor-mode', mode)
  }, [mode])

  useEffect(() => {
    if (skill) {
      localStorage.setItem('ai-mentor-skill', skill)
      recordSkill(skill)
    }
  }, [skill, recordSkill])

  useEffect(() => {
    api.get('/api/sessions')
      .then((res) => res.json())
      .then((data) => {
        if (data.sessions?.length > 0) {
          setSessions(data.sessions)
          const lastActive = localStorage.getItem('ai-mentor-active-session')
          const sid = lastActive && data.sessions.find((s) => s.id === parseInt(lastActive)) ? parseInt(lastActive) : data.sessions[0].id
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
    api.get(`/api/history?session_id=${sid}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages ? data.messages.map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content, timestamp: m.timestamp || new Date().toISOString() })) : [])
        setIsLoaded(true)
      })
      .catch((err) => { console.error(err); setIsLoaded(true) })
  }

  const switchSession = (sid) => { setActiveSessionId(sid); loadSessionHistory(sid) }

  const createSession = (name) => {
    api.post('/api/sessions', { name: `${name} (${currentSkill.label})` })
      .then((res) => res.json())
      .then((data) => { setSessions((p) => [data, ...p]); switchSession(data.id) })
      .catch(console.error)
  }

  const deleteSession = (sid) => {
    api.delete(`/api/sessions/${sid}`)
      .then(() => {
        setSessions((p) => p.filter((s) => s.id !== sid))
        if (activeSessionId === sid && sessions.length > 1) { const r = sessions.filter((s) => s.id !== sid); if (r.length) switchSession(r[0].id) }
      })
      .catch(console.error)
  }

  const renameSession = (sid, name) => {
    api.put(`/api/sessions/${sid}`, { name })
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
    recordMessage()

    try {
      let assistantMessage = { role: 'assistant', content: '', timestamp: now }
      setMessages((p) => [...p, assistantMessage])
      
      await api.sse('/api/chat', { 
        message: userMessage.content, 
        mode, 
        session_id: activeSessionId, 
        skill,
        model: selectedModel
      }, (data) => {
        if (data.error) {
          assistantMessage.content += `\n[Ошибка: ${data.error}]`
        } else if (data.content && !data.done) {
          assistantMessage.content += data.content
        }
        setMessages((p) => { const u = [...p]; u[u.length - 1] = { ...assistantMessage }; return u })
      })
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
    const isCode = text.includes('\n') && (text.includes('function') || text.includes('const ') || text.includes('def ') || text.includes('class ') || text.includes('SELECT ') || text.includes('import ') || text.includes('{') || text.includes('=>'))
    if (isCode) {
      e.preventDefault()
      const ta = textareaRef.current; if (!ta) return
      const s = ta.selectionStart; const en = ta.selectionEnd
      const b = '\n```\n'; const a = '\n```\n'
      const nt = input.substring(0, s) + b + text + a + input.substring(en)
      setInput(nt)
      setTimeout(() => { ta.focus(); const np = s + b.length + text.length + a.length; ta.setSelectionRange(np, np) }, 0)
    }
  }

  const insertAtCursor = (before, after = '') => {
    const ta = textareaRef.current; if (!ta) return
    const s = ta.selectionStart; const en = ta.selectionEnd
    const sel = input.substring(s, en)
    const nt = input.substring(0, s) + before + sel + after + input.substring(en)
    setInput(nt)
    setTimeout(() => { ta.focus(); const np = s + before.length + sel.length; ta.setSelectionRange(np, np) }, 0)
  }

  const handleVoiceTranscript = useCallback((text) => {
    setInput((p) => (p ? p + ' ' : '') + text)
    if (textareaRef.current) textareaRef.current.focus()
    recordVoiceMessage()
  }, [recordVoiceMessage])

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
    recordSnippetSave()
  }, [recordSnippetSave])

  const clearHistory = async () => {
    if (!activeSessionId) return
    try { await api.delete(`/api/history?session_id=${activeSessionId}`); setMessages([]) }
    catch (err) { console.error(err) }
  }

  const exportChat = () => {
    if (!messages.length) return
    const as = sessions.find((s) => s.id === activeSessionId)
    const sn = as ? as.name : 'Чат'
    const content = messages.map((m) => { const t = formatTime(m.timestamp); const r = m.role === 'user' ? 'Вы' : 'Ментор'; return `### ${r} (${t})\n\n${m.content}\n` }).join('\n---\n\n')
    const header = `# AI Mentor — ${sn}\n\n**Навык:** ${currentSkill.label}\n**Режим:** ${mode}\n**Дата:** ${new Date().toLocaleString('ru-RU')}\n\n---\n\n`
    const blob = new Blob([header + content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `ai-mentor-${sn}-${new Date().toISOString().slice(0, 10)}.md`
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
    recordExport()
  }

  const submitFeedback = async () => {
    if (!feedbackText.trim()) return
    setFeedbackStatus('sending')
    try {
      await api.post('/api/feedback', {
        message: feedbackText,
        context: messages.slice(-10).map((m) => ({role: m.role, content: m.content})),
        system_info: {
          userAgent: navigator.userAgent,
          skill, mode, model: selectedModel,
          isElectron: window.electronAPI !== undefined
        }
      })
      setFeedbackStatus('success')
      setTimeout(() => { setShowFeedbackModal(false); setFeedbackStatus(''); setFeedbackText('') }, 2000)
    } catch (err) {
      console.error(err)
      setFeedbackStatus('error')
    }
  }

  const handleSkillConfirm = (newSkill) => {
    setSkill(newSkill)
    setShowSkillPicker(false)
    createSession('Новый чат')
  }

  const filteredMessages = searchQuery.trim() ? messages.filter((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase())) : messages

  if (showSkillPicker) {
    return (
      <div className={`app-wrapper theme-${theme}`} data-design-style={designStyle}>
        <SkillSelector currentSkill={skill} onChange={setSkill} onConfirm={handleSkillConfirm} />
      </div>
    )
  }

  if (!isLoaded) {
    return <div className={`app-wrapper theme-${theme}`} data-design-style={designStyle}><div className="welcome-screen"><div className="welcome-icon"><Icon name="welcome-load" size={70} /></div><div className="welcome-title">Загрузка...</div></div></div>
  }

  return (
    <div className={`app-wrapper theme-${theme} ${showCodeRunner || showSQLRunner ? 'with-code-runner' : ''} ${showSnippets ? 'with-snippets' : ''} ${showSolutionChecker ? 'with-solution-checker' : ''}`} data-design-style={designStyle}>
      <AchievementToast achievement={showAchievementToast} onClose={() => showAchievementToast && setShowAchievementToast(null)} />

      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo"><Icon name="logo" size={40} /></div>
          <span className="sidebar-title">AI Mentor</span>
        </div>

        <div className="progress-section" onClick={() => setShowStats(true)}>
          <div className="progress-level-badge">
            <span className="progress-icon"><Icon name={levelInfo.iconName || 'level-newbie'} size={32} /></span>
            <div className="progress-info">
              <span className="progress-level-name">{levelInfo.name}</span>
              <span className="progress-level-num">Ур. {levelInfo.level}</span>
            </div>
          </div>
          <div className="progress-xp-bar-bg">
            <div className="progress-xp-bar-fill" style={{ width: `${levelInfo.progress}%`, background: `linear-gradient(90deg, ${levelInfo.color}, ${levelInfo.color}88)` }} />
          </div>
          <div className="progress-xp-text">{stats.totalXP} XP</div>
        </div>

        <SessionList sessions={sessions} activeSessionId={activeSessionId} onSelect={switchSession} onCreate={createSession} onDelete={deleteSession} onRename={renameSession} />

        <div className="mode-section">
          <div className="mode-label">Навык</div>
          <div className="skill-selector-compact">
            {SKILLS.map((s) => (
              <button key={s.id} className={`skill-btn ${skill === s.id ? 'active' : ''}`} onClick={() => setSkill(s.id)} title={s.label}>
                <Icon name={s.icon} size={22} />
              </button>
            ))}
            <button className="skill-btn skill-reset-btn" onClick={() => { setSkill(''); setShowSkillPicker(true) }} title="Сменить навык">
              <RotateCcw size={18} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </div>

        <div className="mode-section">
          <div className="mode-label">Режим</div>
          <div className="mode-selector-modern">
            {MODES.map((m) => (
              <motion.button key={m.id} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} className={`mode-btn ${mode === m.id ? 'active' : ''}`} onClick={() => setMode(m.id)}>
                <span className="mode-icon"><m.icon size={18} /></span>
                {m.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="sidebar-tools">
          <motion.button whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} className={`tool-btn`} onClick={() => setShowFeedbackModal(true)}>
            <Bug size={18} /> Сообщить об ошибке
          </motion.button>
          <motion.button whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} className={`tool-btn ${showCodeRunner ? 'tool-btn-active' : ''}`} onClick={() => { setPendingCode(''); setPendingTask(''); setShowCodeRunner(!showCodeRunner); setShowSQLRunner(false) }}>
            <Code size={18} /> Python REPL
          </motion.button>
          <motion.button whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} className={`tool-btn ${showSQLRunner ? 'tool-btn-active' : ''}`} onClick={() => { setPendingCode(''); setPendingTask(''); setShowSQLRunner(!showSQLRunner); setShowCodeRunner(false) }}>
            <Database size={18} /> SQL REPL
          </motion.button>
          <motion.button whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} className={`tool-btn ${showSnippets ? 'tool-btn-active' : ''}`} onClick={() => setShowSnippets(!showSnippets)}>
            <Bookmark size={18} /> Сниппеты
          </motion.button>
          {mode === 'Практика' && (
            <motion.button whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} className={`tool-btn ${showSolutionChecker ? 'tool-btn-active' : ''}`} onClick={() => { setPendingCode(''); setPendingTask(''); setShowSolutionChecker(!showSolutionChecker) }}>
              <CheckSquare size={18} /> Проверка
            </motion.button>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="style-switcher">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className={`style-btn ${designStyle === 'glass' ? 'active' : ''}`} onClick={() => setDesignStyle(designStyle === 'glass' ? 'brutalist' : 'glass')} title="Переключить стиль">
              <Palette size={14} />
              <span>{designStyle === 'glass' ? 'Glass' : 'Brutal'}</span>
            </motion.button>
          </div>
          <ThemeSwitcher currentTheme={theme} onChange={setTheme} />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="clear-btn" onClick={clearHistory}>
            <Trash2 size={14} /> Очистить чат
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="export-btn" onClick={exportChat} disabled={messages.length === 0}>
            <Download size={14} /> Экспорт
          </motion.button>
        </div>
      </aside>

      <main className="main-content">
        <header className="chat-header">
          <div className="chat-header-title">
            <Icon name={currentSkill.icon} size={18} /> {currentSkill.label} — {MODES.find((m) => m.id === mode)?.label}
            {sessions.find((s) => s.id === activeSessionId) && <span className="session-badge">{sessions.find((s) => s.id === activeSessionId)?.name}</span>}
          </div>
          <div className="chat-header-actions">
            <div className="model-selector">
              <select className="voice-select" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
                {AVAILABLE_MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
            {russianVoices.length > 0 && (
              <div className="voice-selector">
                <select className="voice-select" value={selectedVoice || ''} onChange={(e) => setSelectedVoice(e.target.value)}>
                  <option value="">Авто</option>
                  {russianVoices.map((v) => <option key={v.name} value={v.name}>{v.name}</option>)}
                </select>
                <button className="voice-test-btn" onClick={() => speak && speak('Привет! Я ваш AI-ментор.')}>🔊 Тест</button>
              </div>
            )}
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="header-action-btn" onClick={() => setShowSearch(!showSearch)} title="Поиск (Ctrl+F)">
              <Search size={16} />
            </motion.button>
            <div className="chat-header-status"><Icon name="status-dot" size={8} /> Ollama</div>
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
            <div className="welcome-icon"><Icon name="welcome-rocket" size={70} /></div>
            <h2 className="welcome-title">{currentSkill.label}</h2>
            <p className="welcome-subtitle">Спроси что-нибудь или попроси ментора начать урок по {currentSkill.label.toLowerCase()}.</p>
            <div className="welcome-hints">
              <div className="hint-item"><kbd>Ctrl</kbd>+<kbd>Enter</kbd> отправить</div>
              <div className="hint-item"><kbd>Ctrl</kbd>+<kbd>F</kbd> поиск</div>
              <div className="hint-item"><kbd>Esc</kbd> закрыть</div>
            </div>
          </div>
        ) : (
          <Chat messages={filteredMessages} isTyping={isTyping} formatTime={formatTime} searchQuery={searchQuery} onSendToEditor={handleSendToEditor} onRunCode={handleRunCodeFromChat} onSaveSnippet={handleSaveSnippet} isVoiceSpeaking={isVoiceSpeaking()} onSpeak={speak} onStopSpeak={stop} />
        )}

        <div className="input-area">
          <MarkdownToolbar onInsert={insertAtCursor} />
          <div className="input-wrapper">
            <VoiceInput onTranscript={handleVoiceTranscript} disabled={isTyping} />
            <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyPress} onPaste={handlePaste} placeholder="Напишите сообщение..." disabled={isTyping} rows={1} />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="send-btn" onClick={sendMessage} disabled={isTyping || !input.trim()}>
              <Send size={18} />
            </motion.button>
          </div>
        </div>
      </main>

      {showCodeRunner && (
        <aside className="code-runner-panel">
          <div className="code-runner-panel-header"><span>🐍 Python REPL</span><button className="close-panel-btn" onClick={() => setShowCodeRunner(false)}>✕</button></div>
          <CodeRunner initialCode={pendingCode} onCodeRun={recordCodeRun} />
        </aside>
      )}

      {showSQLRunner && (
        <aside className="code-runner-panel">
          <div className="code-runner-panel-header"><span>🗄️ SQL REPL (DuckDB)</span><button className="close-panel-btn" onClick={() => setShowSQLRunner(false)}>✕</button></div>
          <SQLRunner initialCode={pendingCode} onCodeRun={recordCodeRun} />
        </aside>
      )}

      {showSnippets && <SnippetsPanel isOpen={showSnippets} onClose={() => setShowSnippets(false)} />}
      {showSolutionChecker && <SolutionChecker isOpen={showSolutionChecker} onClose={() => setShowSolutionChecker(false)} initialCode={pendingCode} initialTask={pendingTask} model={selectedModel} />}
      {showStats && <StatsDashboard stats={stats} levelInfo={levelInfo} unlockedAchievements={unlockedAchievements} lockedAchievements={lockedAchievements} onClose={() => setShowStats(false)} onReset={resetProgress} />}
      
      {showFeedbackModal && (
        <div className="feedback-overlay">
          <div className="feedback-modal">
            <h3>🐞 Сообщить об ошибке</h3>
            <p>Опишите, что пошло не так. Мы автоматически прикрепим логи конфигурации и последние сообщения.</p>
            <textarea
              className="feedback-textarea"
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Что случилось?..."
            />
            <div className="feedback-actions">
              <button className="btn-cancel" onClick={() => setShowFeedbackModal(false)}>Отмена</button>
              <button 
                className="btn-submit" 
                onClick={submitFeedback}
                disabled={!feedbackText.trim() || feedbackStatus === 'sending'}
              >
                {feedbackStatus === 'sending' ? 'Отправка...' : feedbackStatus === 'success' ? '✔ Успех' : feedbackStatus === 'error' ? '❌ Ошибка' : 'Отправить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
