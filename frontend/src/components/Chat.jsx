import React, { useEffect, useRef, useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import hljs from 'highlight.js'
import { Volume2, Code2, Play, Copy, Check, BookmarkPlus, Speaker } from 'lucide-react'
import { motion } from 'motion/react'
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

  const handleRun = () => { if (onRunCode) onRunCode(String(children).replace(/\n$/, '')) }
  const handleSendToEditor = () => { if (onSendToEditor) onSendToEditor(String(children).replace(/\n$/, '')) }
  const handleSaveSnippet = () => { if (onSaveSnippet) onSaveSnippet(String(children).replace(/\n$/, '')) }

  return !inline && match ? (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-lang">{language}</span>
        <div className="code-block-actions">
          {language === 'python' && onRunCode && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="copy-btn run-code-btn" onClick={handleRun}>
              <Play size={12} /> Запустить
            </motion.button>
          )}
          {language === 'python' && onSendToEditor && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="copy-btn" onClick={handleSendToEditor}>
              <Code2 size={12} /> В редактор
            </motion.button>
          )}
          {language === 'python' && onSaveSnippet && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="copy-btn" onClick={handleSaveSnippet}>
              <BookmarkPlus size={12} />
            </motion.button>
          )}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="copy-btn" onClick={handleCopy}>
            {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Скопировано!' : 'Копировать'}
          </motion.button>
        </div>
      </div>
      <pre><code ref={codeRef} className={className} {...props}>{children}</code></pre>
    </div>
  ) : (<code className={className} {...props}>{children}</code>)
}

const HighlightedText = ({ text, query }) => {
  if (!query.trim()) return <>{text}</>
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return (<>{parts.map((part, i) => regex.test(part) ? (<mark key={i} className="search-highlight">{part}</mark>) : (part))}</>)
}

const Chat = ({ messages, isTyping, formatTime, searchQuery = '', onSendToEditor, onRunCode, onSaveSnippet, isVoiceSpeaking, onSpeak, onStopSpeak }) => {
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [userScrolled, setUserScrolled] = useState(false)

  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
  }, [])

  useEffect(() => { if (!userScrolled) scrollToBottom(true) }, [messages, userScrolled, scrollToBottom])

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
        <motion.div key={index} initial={{ x: msg.role === 'user' ? 30 : -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 100, damping: 15 }} className={`message-row ${msg.role}`}>
          <div className="message-avatar">
            <Icon name={msg.role === 'user' ? 'avatar-user' : 'avatar-mentor'} size={18} />
          </div>
          <div className="message-content-wrapper">
            <div className="message-bubble">
              {msg.role === 'assistant' ? (
                <>
                  <ReactMarkdown components={{ code: (props) => <CodeBlock {...props} onSendToEditor={onSendToEditor} onRunCode={onRunCode} onSaveSnippet={onSaveSnippet} /> }}>{msg.content}</ReactMarkdown>
                  <div className="message-actions">
                    <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className={`msg-action-btn ${isVoiceSpeaking ? 'msg-action-active' : ''}`} onClick={() => { if (isVoiceSpeaking) onStopSpeak(); else onSpeak(msg.content) }} title="Озвучить">
                      <Volume2 size={14} />
                    </motion.button>
                    {onSendToEditor && (
                      <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="msg-action-btn" onClick={() => {
                        const cb = msg.content.match(/```python\n([\s\S]*?)```/g)
                        if (cb?.length) onSendToEditor(cb[0].replace(/```python\n/, '').replace(/```/, ''))
                      }} title="В редактор">
                        <Code2 size={14} />
                      </motion.button>
                    )}
                  </div>
                </>
              ) : (
                <div className="whitespace-pre-wrap">{searchQuery ? <HighlightedText text={msg.content} query={searchQuery} /> : msg.content}</div>
              )}
            </div>
            <span className="message-time">{formatTime(msg.timestamp)}</span>
          </div>
        </motion.div>
      ))}
      {isTyping && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="message-row assistant">
          <div className="message-avatar"><Icon name="avatar-mentor" size={18} /></div>
          <div className="message-content-wrapper">
            <div className="typing-indicator-modern">
              <div className="typing-dots"><div className="typing-dot"></div><div className="typing-dot"></div><div className="typing-dot"></div></div>
              <span style={{ color: 'var(--accent-light)', fontSize: '0.8125rem' }}>Ментор думает...</span>
            </div>
          </div>
        </motion.div>
      )}
      <div ref={messagesEndRef} />
      {showScrollBtn && (
        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} className="scroll-bottom-btn" onClick={() => { scrollToBottom(true); setUserScrolled(false) }}>↓</motion.button>
      )}
    </div>
  )
}

export default Chat
