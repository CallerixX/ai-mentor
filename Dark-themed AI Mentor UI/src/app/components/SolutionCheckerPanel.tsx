import { useState } from 'react';
import { X, ChevronDown, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import type { Theme, DesignStyle } from '../App';

type SolutionCheckerPanelProps = {
  theme: Theme;
  designStyle: DesignStyle;
  onClose: () => void;
};

export function SolutionCheckerPanel({ theme, designStyle, onClose }: SolutionCheckerPanelProps) {
  const [task, setTask] = useState('');
  const [code, setCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [result, setResult] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCheck = () => {
    setIsChecking(true);
    setTimeout(() => {
      setResult(`## ✅ Решение верное!\n\n**Анализ:**\n- Код выполняет поставленную задачу\n- Логика реализована корректно\n- Стиль кода соответствует стандартам\n\n**Рекомендации:**\n- Можно добавить обработку граничных случаев\n- Рассмотрите использование docstring для документации`);
      setIsChecking(false);
    }, 1500);
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
      initial={{ x: 420 }}
      animate={{ x: 0 }}
      exit={{ x: 420 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="w-[420px] h-full flex flex-col"
      style={styles.container}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: designStyle === 'brutalist' ? `2px solid ${styles.card.border}` : styles.card.border }}
      >
        <h3 className="font-semibold">Проверка решения</h3>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1.5 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} transition-all hover:bg-white/5`}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={18} />
            </motion.div>
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

      <motion.div
        initial={{ height: 'auto', opacity: 1 }}
        animate={{
          height: isCollapsed ? 0 : 'auto',
          opacity: isCollapsed ? 0 : 1,
        }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto"
        style={{ overflow: isCollapsed ? 'hidden' : 'auto' }}
      >
        {/* Task Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-1.5"
        >
          <label className="text-sm" style={{ opacity: 0.7 }}>
            Задача (опционально)
          </label>
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Опишите задачу, которую решаете..."
            className={`p-3 ${designStyle === 'glass' ? 'rounded-xl' : 'rounded-none'} outline-none resize-none`}
            style={{
              ...styles.input,
              minHeight: '60px',
            }}
          />
        </motion.div>

        {/* Code Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-1.5"
        >
          <label className="text-sm" style={{ opacity: 0.7 }}>
            Ваш код
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Вставьте код для проверки..."
            className={`p-3 ${designStyle === 'glass' ? 'rounded-xl' : 'rounded-none'} outline-none resize-none`}
            style={{
              ...styles.input,
              fontFamily: 'var(--font-family-mono)',
              fontSize: '0.875rem',
              minHeight: '120px',
            }}
          />
        </motion.div>

        {/* Explanation Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-1.5"
        >
          <label className="text-sm" style={{ opacity: 0.7 }}>
            Ваше объяснение (опционально)
          </label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Опишите логику вашего решения..."
            className={`p-3 ${designStyle === 'glass' ? 'rounded-xl' : 'rounded-none'} outline-none resize-none`}
            style={{
              ...styles.input,
              minHeight: '60px',
            }}
          />
        </motion.div>

        {/* Check Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCheck}
          disabled={!code.trim() || isChecking}
          className={`py-2.5 ${designStyle === 'glass' ? 'rounded-xl' : 'rounded-none'} transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
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
            {isChecking ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <CheckCircle size={18} />
              </motion.div>
            ) : (
              <CheckCircle size={18} />
            )}
            <span>{isChecking ? 'Проверка...' : 'Проверить решение'}</span>
          </div>
        </motion.button>

        {/* Result Area */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`p-4 ${designStyle === 'glass' ? 'rounded-xl' : 'rounded-none'}`}
            style={{
              ...styles.card,
              border: designStyle === 'brutalist'
                ? `2px solid ${theme === 'light' ? '#10b981' : '#4ade80'}`
                : '1px solid var(--border-accent)',
            }}
          >
            <div className="prose prose-invert max-w-none">
              {result.split('\n').map((line, idx) => {
                if (line.startsWith('## ')) {
                  return (
                    <motion.h2
                      key={idx}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="text-lg font-semibold mb-2"
                    >
                      {line.replace('## ', '')}
                    </motion.h2>
                  );
                }
                if (line.startsWith('**')) {
                  return (
                    <motion.p
                      key={idx}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="font-semibold mt-2 mb-1"
                      style={{ opacity: 0.8 }}
                    >
                      {line.replace(/\*\*/g, '')}
                    </motion.p>
                  );
                }
                if (line.startsWith('- ')) {
                  return (
                    <motion.li
                      key={idx}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="ml-4"
                      style={{ opacity: 0.7 }}
                    >
                      {line.replace('- ', '')}
                    </motion.li>
                  );
                }
                if (line.trim()) {
                  return (
                    <motion.p
                      key={idx}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      style={{ opacity: 0.7 }}
                    >
                      {line}
                    </motion.p>
                  );
                }
                return null;
              })}
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
