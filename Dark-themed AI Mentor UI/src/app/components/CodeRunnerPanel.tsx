import { useState } from 'react';
import { X, Play, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { Theme, DesignStyle } from '../App';

type CodeRunnerPanelProps = {
  type: 'python' | 'sql';
  theme: Theme;
  designStyle: DesignStyle;
  onClose: () => void;
};

const pythonSnippets = [
  { name: 'Hello', code: 'print("Hello, World!")' },
  { name: 'Cycle', code: 'for i in range(5):\n    print(i)' },
  { name: 'Function', code: 'def greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("User"))' },
  { name: 'Lists', code: 'numbers = [1, 2, 3, 4, 5]\nprint(sum(numbers))' },
  { name: 'Class', code: 'class Dog:\n    def __init__(self, name):\n        self.name = name\n\ndog = Dog("Buddy")\nprint(dog.name)' },
];

const sqlSnippets = [
  { name: 'SELECT', code: 'SELECT * FROM users LIMIT 10;' },
  { name: 'WHERE', code: 'SELECT name, email FROM users WHERE age > 18;' },
  { name: 'JOIN', code: 'SELECT users.name, orders.total\nFROM users\nJOIN orders ON users.id = orders.user_id;' },
  { name: 'GROUP', code: 'SELECT country, COUNT(*) as total\nFROM users\nGROUP BY country;' },
  { name: 'INSERT', code: 'INSERT INTO users (name, email) VALUES (\'John\', \'john@example.com\');' },
];

export function CodeRunnerPanel({ type, theme, designStyle, onClose }: CodeRunnerPanelProps) {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const snippets = type === 'python' ? pythonSnippets : sqlSnippets;

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      if (type === 'python') {
        setOutput('> Executing Python code...\nResult: Success\n');
      } else {
        setOutput('> Executing SQL query...\n3 rows affected.\n');
      }
      setIsRunning(false);
    }, 1000);
  };

  const handleClearOutput = () => {
    setOutput('');
  };

  const getStyles = () => {
    if (designStyle === 'brutalist') {
      const bgColor = theme === 'light' ? '#ffffff' : theme === 'amoled' ? '#000000' : '#1a1a1a';
      const textColor = theme === 'light' ? '#000000' : '#ffffff';
      const borderColor = theme === 'light' ? '#000000' : '#ffffff';

      return {
        container: {
          backgroundColor: bgColor,
          borderLeft: `3px solid ${borderColor}`,
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
      };
    }

    const isDark = theme === 'dark' || theme === 'amoled';
    return {
      container: {
        backgroundColor: isDark ? 'var(--sidebar-bg)' : 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        borderLeft: `1px solid ${isDark ? 'var(--border-light)' : 'rgba(0, 0, 0, 0.1)'}`,
        color: isDark ? 'var(--text-primary)' : '#1a1a2e',
      },
      card: {
        backgroundColor: isDark ? 'var(--card-bg)' : 'rgba(255, 255, 255, 0.5)',
        border: `1px solid ${isDark ? 'var(--border-light)' : 'rgba(0, 0, 0, 0.1)'}`,
      },
      input: {
        backgroundColor: isDark ? 'var(--input-bg)' : 'rgba(255, 255, 255, 0.6)',
        border: `1px solid ${isDark ? 'var(--border-medium)' : 'rgba(0, 0, 0, 0.1)'}`,
        color: isDark ? 'var(--text-primary)' : '#1a1a2e',
      },
    };
  };

  const styles = getStyles();

  return (
    <motion.div
      initial={{ x: 460 }}
      animate={{ x: 0 }}
      exit={{ x: 460 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="w-[460px] h-full flex flex-col"
      style={styles.container}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: designStyle === 'brutalist' ? `2px solid ${styles.card.border}` : styles.card.border }}
      >
        <h3 className="font-semibold">
          {type === 'python' ? 'Python REPL' : 'SQL REPL'}
        </h3>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className={`p-1.5 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} transition-all hover:bg-white/5`}
        >
          <X size={18} />
        </motion.button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-3 p-4 overflow-hidden">
        {/* Snippets */}
        <div className="flex flex-wrap gap-2">
          {snippets.map((snippet, idx) => (
            <motion.button
              key={snippet.name}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCode(snippet.code)}
              className={`px-3 py-1.5 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} text-sm transition-all hover:bg-white/5`}
              style={styles.card}
            >
              {snippet.name}
            </motion.button>
          ))}
        </div>

        {/* Code Editor */}
        <div className="flex-1 flex flex-col gap-2 overflow-hidden">
          <motion.textarea
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`Введите ${type === 'python' ? 'Python' : 'SQL'} код...`}
            className={`flex-1 p-3 ${designStyle === 'glass' ? 'rounded-xl' : 'rounded-none'} outline-none resize-none`}
            style={{
              ...styles.input,
              fontFamily: 'var(--font-family-mono)',
              fontSize: '0.875rem',
            }}
          />

          {/* Run Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRun}
            disabled={!code.trim() || isRunning}
            className={`w-full py-2.5 ${designStyle === 'glass' ? 'rounded-xl' : 'rounded-none'} transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
            style={{
              background: designStyle === 'brutalist'
                ? (theme === 'light' ? '#000000' : '#ffffff')
                : 'linear-gradient(135deg, #10b981, #059669)',
              color: designStyle === 'brutalist'
                ? (theme === 'light' ? '#ffffff' : '#000000')
                : '#ffffff',
              fontWeight: 600,
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Play size={18} />
              <span>{isRunning ? 'Выполнение...' : 'Запустить'}</span>
            </div>
          </motion.button>

          {output && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClearOutput}
              className={`w-full py-2 ${designStyle === 'glass' ? 'rounded-xl' : 'rounded-none'} transition-all hover:bg-red-500/10`}
              style={{
                border: `${designStyle === 'brutalist' ? '2px' : '1px'} solid var(--error)`,
                color: 'var(--error)',
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <Trash2 size={16} />
                <span>Очистить вывод</span>
              </div>
            </motion.button>
          )}
        </div>

        {/* Output Area */}
        {output && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`max-h-[200px] overflow-y-auto p-3 ${designStyle === 'glass' ? 'rounded-xl' : 'rounded-none'}`}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              border: designStyle === 'brutalist' ? `2px solid ${styles.card.border}` : styles.card.border,
              fontFamily: 'var(--font-family-mono)',
              fontSize: '0.875rem',
            }}
          >
            <pre style={{ color: 'var(--success)', margin: 0, whiteSpace: 'pre-wrap' }}>
              {output}
            </pre>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
