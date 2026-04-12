import { useState, useRef, useEffect } from 'react';
import { Search, Volume2, ChevronDown, Send, Mic, Bold, Italic, Code as CodeIcon, List, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Skill, Mode, Session, Theme, DesignStyle } from '../App';

type ChatAreaProps = {
  selectedSkill: Skill | null;
  currentMode: Mode;
  currentSession?: Session;
  theme: Theme;
  designStyle: DesignStyle;
  onSendMessage: (content: string) => void;
};

const modeNames: Record<Mode, string> = {
  learning: 'Обучение',
  debug: 'Дебаг',
  review: 'Ревью кода',
  practice: 'Практика',
};

export function ChatArea({ selectedSkill, currentMode, currentSession, theme, designStyle, onSendMessage }: ChatAreaProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  const getStyles = () => {
    if (designStyle === 'brutalist') {
      const bgColor = theme === 'light' ? '#ffffff' : theme === 'amoled' ? '#000000' : '#1a1a1a';
      const textColor = theme === 'light' ? '#000000' : '#ffffff';
      const borderColor = theme === 'light' ? '#000000' : '#ffffff';

      return {
        header: {
          backgroundColor: bgColor,
          borderBottom: `3px solid ${borderColor}`,
          color: textColor,
        },
        card: {
          backgroundColor: bgColor,
          border: `2px solid ${borderColor}`,
        },
        input: {
          backgroundColor: bgColor,
          border: `2px solid ${borderColor}`,
          color: textColor,
        },
        button: {
          border: `2px solid ${borderColor}`,
          backgroundColor: bgColor,
        },
        userBubble: {
          backgroundColor: textColor,
          color: bgColor,
          border: `2px solid ${borderColor}`,
        },
        aiBubble: {
          backgroundColor: bgColor,
          color: textColor,
          border: `2px solid ${borderColor}`,
        },
      };
    }

    // Glass style
    const isDark = theme === 'dark' || theme === 'amoled';
    return {
      header: {
        backgroundColor: isDark ? 'var(--card-bg)' : 'rgba(255, 255, 255, 0.7)',
        borderBottom: `1px solid ${isDark ? 'var(--border-light)' : 'rgba(0, 0, 0, 0.1)'}`,
        backdropFilter: 'blur(20px)',
        color: isDark ? 'var(--text-primary)' : '#1a1a2e',
      },
      card: {
        backgroundColor: isDark ? 'var(--card-bg)' : 'rgba(255, 255, 255, 0.5)',
        border: `1px solid ${isDark ? 'var(--border-light)' : 'rgba(0, 0, 0, 0.1)'}`,
        backdropFilter: 'blur(10px)',
      },
      input: {
        backgroundColor: isDark ? 'var(--input-bg)' : 'rgba(255, 255, 255, 0.6)',
        border: `1px solid ${isDark ? 'var(--border-medium)' : 'rgba(0, 0, 0, 0.1)'}`,
        color: isDark ? 'var(--text-primary)' : '#1a1a2e',
      },
      button: {
        border: `1px solid ${isDark ? 'var(--border-light)' : 'rgba(0, 0, 0, 0.1)'}`,
      },
      userBubble: {
        background: 'linear-gradient(135deg, var(--user-bubble-start), var(--user-bubble-end))',
        border: `1px solid ${isDark ? 'var(--border-light)' : 'rgba(0, 0, 0, 0.1)'}`,
        backdropFilter: 'blur(10px)',
      },
      aiBubble: {
        backgroundColor: isDark ? 'var(--assistant-bubble)' : 'rgba(255, 255, 255, 0.6)',
        border: `1px solid ${isDark ? 'var(--border-light)' : 'rgba(0, 0, 0, 0.1)'}`,
        backdropFilter: 'blur(10px)',
      },
    };
  };

  const styles = getStyles();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between px-6 py-3"
        style={styles.header}
      >
        <div className="flex items-center gap-3">
          {selectedSkill && (
            <>
              <div className="w-8 h-8 flex items-center justify-center">
                <selectedSkill.Icon size={24} />
              </div>
              <span className="font-semibold">{selectedSkill.name}</span>
              <span style={{ opacity: 0.5 }}>—</span>
              <span style={{ opacity: 0.7 }}>{modeNames[currentMode]}</span>
              <div
                className={`px-3 py-1 ${designStyle === 'glass' ? 'rounded-full' : 'rounded-none'} text-xs`}
                style={styles.card}
              >
                {currentSession?.name || 'Новая сессия'}
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1.5 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} text-sm transition-all hover:bg-white/5`}
            style={styles.button}
          >
            <div className="flex items-center gap-2">
              <Volume2 size={16} />
              <span>Голос</span>
              <ChevronDown size={14} />
            </div>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} transition-all hover:bg-white/5`}
            style={styles.button}
          >
            <Search size={18} />
          </motion.button>
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`w-2 h-2 ${designStyle === 'glass' ? 'rounded-full' : 'rounded-none'}`}
              style={{ backgroundColor: 'var(--success)' }}
            />
            <span className="text-sm" style={{ opacity: 0.7 }}>Ollama</span>
          </div>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-4"
      >
        {currentSession?.messages.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="h-full flex items-center justify-center"
          >
            <div className="text-center max-w-xl">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-7xl mb-6"
              >
                {designStyle === 'brutalist' ? '▲' : '🚀'}
              </motion.div>
              <h2
                className="text-2xl mb-3"
                style={{
                  fontWeight: 700,
                  ...(designStyle === 'brutalist'
                    ? { color: styles.header.color }
                    : {
                        background: 'linear-gradient(135deg, var(--accent-gradient-start), var(--accent-gradient-end))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }),
                }}
              >
                Привет! Я твой AI ментор
              </h2>
              <p className="mb-6" style={{ opacity: 0.7 }}>
                {selectedSkill
                  ? `Готов помочь с изучением ${selectedSkill.name}. Задай вопрос или попроси объяснить концепцию.`
                  : 'Выбери навык в боковой панели и начнём обучение!'}
              </p>
              <div className="flex flex-col gap-2 text-sm" style={{ opacity: 0.5 }}>
                <div>Ctrl+Enter — отправить сообщение</div>
                <div>Ctrl+F — поиск по чату</div>
                <div>Esc — очистить ввод</div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4 pb-4">
            <AnimatePresence>
              {currentSession.messages.map((message, idx) => (
                <motion.div
                  key={message.id}
                  initial={{ x: message.role === 'user' ? 50 : -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`w-8 h-8 ${designStyle === 'glass' ? 'rounded-full' : 'rounded-none'} flex items-center justify-center text-lg flex-shrink-0`}
                    style={message.role === 'user' ? styles.userBubble : styles.aiBubble}
                  >
                    {message.role === 'user' ? '👤' : '🤖'}
                  </motion.div>
                  <div className={`flex flex-col gap-1 max-w-[70%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`px-4 py-3 ${designStyle === 'glass' ? 'rounded-2xl' : 'rounded-none'}`}
                      style={message.role === 'user' ? styles.userBubble : styles.aiBubble}
                    >
                      <p>{message.content}</p>
                    </motion.div>
                    <div className="text-xs px-2" style={{ opacity: 0.5 }}>
                      {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {message.role === 'assistant' && (
                      <div className="flex gap-2 px-2">
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className={`p-1.5 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} transition-all hover:bg-white/5`}
                          title="Озвучить"
                        >
                          <Volume2 size={14} style={{ opacity: 0.5 }} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className={`p-1.5 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} transition-all hover:bg-white/5`}
                          title="Отправить в редактор"
                        >
                          <CodeIcon size={14} style={{ opacity: 0.5 }} />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={scrollToBottom}
            className={`absolute bottom-32 right-8 w-10 h-10 ${designStyle === 'glass' ? 'rounded-full' : 'rounded-none'} flex items-center justify-center shadow-lg`}
            style={{
              background: designStyle === 'brutalist'
                ? styles.header.color
                : 'linear-gradient(135deg, var(--accent-gradient-start), var(--accent-gradient-end))',
            }}
          >
            <ChevronDown size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 py-4"
        style={styles.header}
      >
        {/* Markdown Toolbar */}
        <div className="flex gap-1 mb-2">
          {[
            { icon: Bold, title: 'Жирный' },
            { icon: Italic, title: 'Курсив' },
            { icon: CodeIcon, title: 'Код' },
            { icon: List, title: 'Список' },
            { icon: Quote, title: 'Цитата' },
          ].map(({ icon: Icon, title }) => (
            <motion.button
              key={title}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} transition-all hover:bg-white/5`}
              style={styles.button}
              title={title}
            >
              <Icon size={14} />
            </motion.button>
          ))}
        </div>

        {/* Input */}
        <div
          className={`flex items-end gap-2 p-2 ${designStyle === 'glass' ? 'rounded-xl' : 'rounded-none'} transition-all focus-within:shadow-lg`}
          style={styles.input}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsRecording(!isRecording)}
            className={`p-2 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} transition-all ${isRecording ? 'bg-red-500/20' : 'hover:bg-white/5'}`}
          >
            <motion.div
              animate={isRecording ? { scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <Mic size={18} style={{ color: isRecording ? 'var(--error)' : undefined }} />
            </motion.div>
          </motion.button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleSend();
              }
              if (e.key === 'Escape') {
                setInput('');
              }
            }}
            placeholder="Задайте вопрос ментору..."
            className="flex-1 bg-transparent outline-none resize-none min-h-[40px] max-h-[120px]"
            rows={1}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim()}
            className={`w-10 h-10 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
            style={{
              background: input.trim()
                ? designStyle === 'brutalist'
                  ? styles.header.color
                  : 'linear-gradient(135deg, var(--accent-gradient-start), var(--accent-gradient-end))'
                : 'var(--border-medium)',
            }}
          >
            <Send size={18} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
