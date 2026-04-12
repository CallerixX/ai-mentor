import React, { useEffect, useRef, useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import hljs from 'highlight.js'
import Icon from './Icon'

const CodeBlock = ({ node, inline, className, children, onSendToEditor, onRunCode, onSaveSnippet, ...props }) => {
  const match = /language-(\w+)/.exec(className || '')
  const language = match ? match[1] : ''
  const [copied, setCopied] = useState(false)
  const codeRef = useRef(null)

  useEffect(() => {
    if (!inline && language && codeRef.current) {
      if (!codeRef.current.dataset.highlighted) {
        hljs.highlightElement(codeRef.current)
        codeRef.current.dataset.highlighted = 'yes'
      }
    }
  }, [inline, language, children])

  const handleCopy = () => {
    const text = String(children).replace(/\n$/, '')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRun = () => {
    const text = String(children).replace(/\n$/, '')
    if (onRunCode) onRunCode(text)
  }

  const handleSendToEditor = () => {
    const text = String(children).replace(/\n$/, '')
    if (onSendToEditor) onSendToEditor(text)
  }

  const handleSaveSnippet = () => {
    const text = String(children).replace(/\n$/, '')
    if (onSaveSnippet) onSaveSnippet(text)
  }

  return !inline && match ? (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-lang">{language}</span>
        <div className="code-block-actions">
          {language === 'python' && onRunCode && (
            <button className="copy-btn run-code-btn" onClick={handleRun} title="Запустить код">
              <Icon name="run" size={12} />
              Запустить
            </button>
          )}
          {language === 'python' && onSendToEditor && (
            <button className="copy-btn" onClick={handleSendToEditor} title="Отправить в редактор">
              <Icon name="send-to-editor" size={12} />
              В редактор
            </button>
          )}
          {language === 'python' && onSaveSnippet && (
            <button className="copy-btn" onClick={handleSaveSnippet} title="Сохранить в избранное">
              <Icon name="save" size={12} />
            </button>
          )}
          <button className="copy-btn" onClick={handleCopy} title="Копировать код">
            {copied ? <Icon name="check" size={12} /> : <Icon name="copy" size={12} />}
            {copied ? 'Скопировано!' : 'Копировать'}
          </button>
        </div>
      </div>
      <pre>
        <code ref={codeRef} className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  )
}

const HighlightedText = ({ text, query }) => {
  if (!query.trim()) return <>{text}</>

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="search-highlight">{part}</mark>
        ) : (
          part
        )
      )}
    </>
  )
}

const Chat = ({ messages, isTyping, formatTime, searchQuery = '', onSendToEditor, onRunCode, onSaveSnippet, isVoiceSpeaking, onSpeak, onStopSpeak }) => {
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [userScrolled, setUserScrolled] = useState(false)

  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
    }
  }, [])

  useEffect(() => {
    if (!userScrolled) {
      scrollToBottom(true)
    }
  }, [messages, userScrolled, scrollToBottom])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setShowScrollBtn(!isNearBottom)
      setUserScrolled(!isNearBottom)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div ref={messagesContainerRef} className="messages-wrapper">
      {messages.map((msg, index) => (
        <div key={index} className={`message-row ${msg.role}`}>
          <div className="message-avatar">
            <Icon name={msg.role === 'user' ? 'avatar-user' : 'avatar-mentor'} size={20} />
          </div>
          <div className="message-content-wrapper">
            <div className="message-bubble">
              {msg.role === 'assistant' ? (
                <>
                  <ReactMarkdown
                    components={{
                      code: (props) => (
                        <CodeBlock
                          {...props}
                          onSendToEditor={onSendToEditor}
                          onRunCode={onRunCode}
                          onSaveSnippet={onSaveSnippet}
                        />
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                  <div className="message-actions">
                    <button
                      className={`msg-action-btn ${isVoiceSpeaking ? 'msg-action-active' : ''}`}
                      onClick={() => {
                        if (isVoiceSpeaking) onStopSpeak()
                        else onSpeak(msg.content)
                      }}
                      title="Озвучить ответ"
                    >
                      <Icon name="speaker" size={14} />
                    </button>
                    {onSendToEditor && (
                      <button
                        className="msg-action-btn"
                        onClick={() => {
                          const codeBlocks = msg.content.match(/```python\n([\s\S]*?)```/g)
                          if (codeBlocks && codeBlocks.length > 0) {
                            const code = codeBlocks[0].replace(/```python\n/, '').replace(/```/, '')
                            onSendToEditor(code)
                          }
                        }}
                        title="Отправить весь код в редактор"
                      >
                        <Icon name="send-to-editor" size={14} />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="whitespace-pre-wrap">
                  {searchQuery ? <HighlightedText text={msg.content} query={searchQuery} /> : msg.content}
                </div>
              )}
            </div>
            <span className="message-time">{formatTime(msg.timestamp)}</span>
          </div>
        </div>
      ))}
      {isTyping && (
        <div className="message-row assistant">
          <div className="message-avatar">
            <Icon name="avatar-mentor" size={20} />
          </div>
          <div className="message-content-wrapper">
            <div className="typing-indicator-modern">
              <div className="typing-dots">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
              <span style={{ color: 'var(--accent-light)', fontSize: '0.8125rem' }}>
                Ментор думает...
              </span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />

      {showScrollBtn && (
        <button className="scroll-bottom-btn" onClick={() => { scrollToBottom(true); setUserScrolled(false); }}>
          ↓
        </button>
      )}
    </div>
  )
}

export default Chat
