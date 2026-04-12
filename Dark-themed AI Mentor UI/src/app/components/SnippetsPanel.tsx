import { useState } from 'react';
import { X, Plus, Copy, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Theme, DesignStyle } from '../App';

type Snippet = {
  id: string;
  code: string;
  tags: string[];
  date: Date;
};

type SnippetsPanelProps = {
  theme: Theme;
  designStyle: DesignStyle;
  onClose: () => void;
};

export function SnippetsPanel({ theme, designStyle, onClose }: SnippetsPanelProps) {
  const [snippets, setSnippets] = useState<Snippet[]>([
    {
      id: '1',
      code: 'def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)',
      tags: ['python', 'recursion'],
      date: new Date('2024-03-10'),
    },
    {
      id: '2',
      code: 'SELECT * FROM users WHERE created_at > NOW() - INTERVAL \'7 days\';',
      tags: ['sql', 'query'],
      date: new Date('2024-03-12'),
    },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTags, setNewTags] = useState('');
  const [selectedTag, setSelectedTag] = useState('Все');

  const allTags = ['Все', ...Array.from(new Set(snippets.flatMap(s => s.tags)))];

  const filteredSnippets = selectedTag === 'Все'
    ? snippets
    : snippets.filter(s => s.tags.includes(selectedTag));

  const handleSave = () => {
    if (!newCode.trim()) return;

    const snippet: Snippet = {
      id: Date.now().toString(),
      code: newCode,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      date: new Date(),
    };

    setSnippets(prev => [snippet, ...prev]);
    setNewCode('');
    setNewTags('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    setSnippets(prev => prev.filter(s => s.id !== id));
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
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
      initial={{ x: 380 }}
      animate={{ x: 0 }}
      exit={{ x: 380 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="w-[380px] h-full flex flex-col"
      style={styles.container}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: designStyle === 'brutalist' ? `2px solid ${styles.card.border}` : styles.card.border }}
      >
        <h3 className="font-semibold">Избранные сниппеты</h3>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className={`p-1.5 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} transition-all hover:bg-white/5`}
          >
            <Plus size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className={`p-1.5 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} transition-all hover:bg-white/5`}
          >
            <X size={18} />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto">
        {/* Tags Filter */}
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag, idx) => (
            <motion.button
              key={tag}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 ${designStyle === 'glass' ? 'rounded-full' : 'rounded-none'} text-sm transition-all`}
              style={{
                backgroundColor: selectedTag === tag ? 'var(--accent-light)' : (designStyle === 'brutalist' ? styles.container.backgroundColor : 'var(--card-bg)'),
                border: designStyle === 'brutalist' ? `2px solid ${styles.card.border}` : styles.card.border,
                color: selectedTag === tag ? '#000' : styles.container.color,
              }}
            >
              {tag}
            </motion.button>
          ))}
        </div>

        {/* Add Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`flex flex-col gap-2 p-3 ${designStyle === 'glass' ? 'rounded-xl' : 'rounded-none'} overflow-hidden`}
              style={styles.card}
            >
              <textarea
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="Код сниппета..."
                className={`p-2 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} outline-none resize-none`}
                style={{
                  ...styles.input,
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '0.875rem',
                  minHeight: '80px',
                }}
              />
              <input
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="Теги (через запятую)"
                className={`p-2 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} outline-none`}
                style={{
                  ...styles.input,
                  fontSize: '0.875rem',
                }}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className={`py-2 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} transition-all`}
                style={{
                  background: designStyle === 'brutalist'
                    ? (theme === 'light' ? '#000000' : '#ffffff')
                    : 'linear-gradient(135deg, var(--accent-gradient-start), var(--accent-gradient-end))',
                  color: designStyle === 'brutalist'
                    ? (theme === 'light' ? '#ffffff' : '#000000')
                    : '#ffffff',
                  fontWeight: 600,
                }}
              >
                Сохранить
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Snippets List */}
        <AnimatePresence>
          {filteredSnippets.map((snippet, idx) => (
            <motion.div
              key={snippet.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ x: 4 }}
              className={`flex flex-col gap-2 p-3 ${designStyle === 'glass' ? 'rounded-xl' : 'rounded-none'}`}
              style={styles.card}
            >
              <div className="flex flex-wrap gap-1">
                {snippet.tags.map(tag => (
                  <span
                    key={tag}
                    className={`px-2 py-0.5 text-xs ${designStyle === 'glass' ? 'rounded' : 'rounded-none'}`}
                    style={{
                      backgroundColor: 'var(--accent-light)',
                      color: '#000',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <pre
                className={`max-h-[120px] overflow-y-auto p-2 text-xs ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'}`}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  fontFamily: 'var(--font-family-mono)',
                  opacity: 0.8,
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {snippet.code}
              </pre>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ opacity: 0.5 }}>
                  {snippet.date.toLocaleDateString('ru-RU')}
                </span>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCopy(snippet.code)}
                    className={`p-1.5 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} transition-all hover:bg-white/5`}
                    title="Копировать"
                  >
                    <Copy size={14} style={{ opacity: 0.5 }} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(snippet.id)}
                    className={`p-1.5 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} transition-all hover:bg-red-500/10`}
                    title="Удалить"
                  >
                    <Trash2 size={14} style={{ color: 'var(--error)' }} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredSnippets.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex items-center justify-center"
          >
            <p style={{ opacity: 0.5 }}>Нет сниппетов</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
