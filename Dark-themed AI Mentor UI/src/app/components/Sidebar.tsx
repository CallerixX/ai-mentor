import { MessageCircle, Book, Bug, CheckCircle, Laptop, Plus, Edit2, Trash2, RotateCcw, Code, Database, BookmarkPlus, CheckSquare, Moon, Sun, Download, Trash, Palette } from 'lucide-react';
import { motion } from 'motion/react';
import type { Skill, Mode, Session, Theme, DesignStyle } from '../App';

type SidebarProps = {
  selectedSkill: Skill | null;
  currentMode: Mode;
  sessions: Session[];
  currentSessionId: string;
  level: { number: number; name: string; xp: number; maxXp: number };
  skills: Skill[];
  theme: Theme;
  designStyle: DesignStyle;
  onSkillSelect: (skill: Skill | null) => void;
  onModeChange: (mode: Mode) => void;
  onSessionChange: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onOpenPanel: (panel: 'python' | 'sql' | 'snippets' | 'solution') => void;
  onShowStats: () => void;
  onThemeChange: (theme: Theme) => void;
  onDesignStyleChange: (style: DesignStyle) => void;
};

export function Sidebar({
  selectedSkill,
  currentMode,
  sessions,
  currentSessionId,
  level,
  skills,
  theme,
  designStyle,
  onSkillSelect,
  onModeChange,
  onSessionChange,
  onNewSession,
  onDeleteSession,
  onOpenPanel,
  onShowStats,
  onThemeChange,
  onDesignStyleChange,
}: SidebarProps) {
  const modes: { id: Mode; name: string; icon: typeof Book }[] = [
    { id: 'learning', name: 'Обучение', icon: Book },
    { id: 'debug', name: 'Дебаг', icon: Bug },
    { id: 'review', name: 'Ревью кода', icon: CheckCircle },
    { id: 'practice', name: 'Практика', icon: Laptop },
  ];

  const getStyles = () => {
    if (designStyle === 'brutalist') {
      const bgColor = theme === 'light' ? '#ffffff' : theme === 'amoled' ? '#000000' : '#1a1a1a';
      const textColor = theme === 'light' ? '#000000' : '#ffffff';
      const borderColor = theme === 'light' ? '#000000' : '#ffffff';

      return {
        container: {
          backgroundColor: bgColor,
          borderRight: `3px solid ${borderColor}`,
        },
        card: {
          backgroundColor: bgColor,
          border: `2px solid ${borderColor}`,
        },
        button: {
          border: `2px solid ${borderColor}`,
          backgroundColor: bgColor,
        },
        activeButton: {
          backgroundColor: textColor,
          color: bgColor,
          border: `2px solid ${borderColor}`,
        },
        text: {
          color: textColor,
        },
      };
    }

    // Glass style
    const isDark = theme === 'dark' || theme === 'amoled';
    return {
      container: {
        backgroundColor: isDark ? 'var(--sidebar-bg)' : 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        borderRight: `1px solid ${isDark ? 'var(--border-light)' : 'rgba(0, 0, 0, 0.1)'}`,
      },
      card: {
        backgroundColor: isDark ? 'var(--card-bg)' : 'rgba(255, 255, 255, 0.5)',
        border: `1px solid ${isDark ? 'var(--border-light)' : 'rgba(0, 0, 0, 0.1)'}`,
        backdropFilter: 'blur(10px)',
      },
      button: {
        border: `1px solid ${isDark ? 'var(--border-light)' : 'rgba(0, 0, 0, 0.1)'}`,
        backgroundColor: 'transparent',
      },
      activeButton: {
        background: 'linear-gradient(135deg, var(--accent-gradient-start), var(--accent-gradient-end))',
        border: '1px solid transparent',
      },
      text: {
        color: isDark ? 'var(--text-primary)' : '#1a1a2e',
      },
    };
  };

  const styles = getStyles();

  return (
    <motion.div
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="w-[280px] h-full flex flex-col gap-3 p-4 overflow-y-auto"
      style={styles.container}
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: designStyle === 'brutalist'
              ? styles.text.color
              : 'linear-gradient(135deg, var(--accent-gradient-start), var(--accent-gradient-end))',
          }}
        >
          <span className="text-2xl">
            {designStyle === 'brutalist' ? '■' : '🎓'}
          </span>
        </div>
        <h1
          className="text-xl"
          style={{
            fontWeight: 700,
            ...(designStyle === 'brutalist'
              ? styles.text
              : {
                  background: 'linear-gradient(135deg, var(--accent-gradient-start), var(--accent-gradient-end))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }),
          }}
        >
          AI Mentor
        </h1>
      </motion.div>

      {/* Progress Section */}
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onShowStats}
        className={`p-3 ${designStyle === 'glass' ? 'rounded-xl' : 'rounded-none'} transition-all cursor-pointer`}
        style={styles.card}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className={`w-10 h-10 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl`}
          >
            ⭐
          </div>
          <div className="flex-1 text-left" style={styles.text}>
            <div className="text-sm opacity-70">
              {level.name}
            </div>
            <div className="font-semibold">Уровень {level.number}</div>
          </div>
        </div>
        <div className={`w-full h-1.5 ${designStyle === 'glass' ? 'rounded-full' : 'rounded-none'} overflow-hidden`} style={{ backgroundColor: 'var(--input-bg)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(level.xp / level.maxXp) * 100}%` }}
            transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
            className={`h-full ${designStyle === 'glass' ? 'rounded-full' : 'rounded-none'}`}
            style={{
              background: 'linear-gradient(90deg, var(--accent-gradient-start), var(--accent-gradient-end))',
            }}
          />
        </div>
        <div className="text-xs mt-1 text-right" style={{ color: 'var(--text-muted)' }}>
          {level.xp} / {level.maxXp} XP
        </div>
      </motion.button>

      {/* Session List */}
      <div className="flex flex-col gap-1">
        <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-dim)' }}>
          Сессии
        </div>
        <div className="max-h-[200px] overflow-y-auto flex flex-col gap-1">
          {sessions.map((session, idx) => (
            <motion.div
              key={session.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ x: 4 }}
              className={`group flex items-center gap-2 p-2 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} cursor-pointer transition-all`}
              style={{
                ...(session.id === currentSessionId ? styles.card : {}),
                border: session.id === currentSessionId
                  ? (designStyle === 'brutalist' ? `2px solid ${styles.text.color}` : '1px solid var(--border-accent)')
                  : '1px solid transparent',
              }}
              onClick={() => onSessionChange(session.id)}
            >
              <MessageCircle size={16} style={{ color: 'var(--text-muted)' }} />
              <span className="flex-1 text-sm truncate" style={styles.text}>{session.name}</span>
              <div className="hidden group-hover:flex items-center gap-1">
                <button className="p-1 hover:bg-white/5 rounded">
                  <Edit2 size={14} style={{ color: 'var(--text-muted)' }} />
                </button>
                <button
                  className="p-1 hover:bg-white/5 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                >
                  <Trash2 size={14} style={{ color: 'var(--error)' }} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewSession}
          className={`flex items-center justify-center gap-2 p-2 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} transition-all hover:bg-white/5`}
          style={styles.button}
        >
          <Plus size={16} />
          <span className="text-sm">Новая сессия</span>
        </motion.button>
      </div>

      {/* Skill Selector */}
      <div className="flex flex-col gap-2">
        <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-dim)' }}>
          Навык
        </div>
        <div className="flex flex-wrap gap-1">
          {skills.slice(0, 20).map((skill, idx) => {
            const Icon = skill.Icon;
            return (
              <motion.button
                key={skill.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 + idx * 0.02 }}
                whileHover={{ scale: 1.1, rotate: designStyle === 'brutalist' ? 0 : 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSkillSelect(skill)}
                className={`w-[34px] h-[34px] ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} flex items-center justify-center transition-all`}
                style={{
                  ...(selectedSkill?.id === skill.id ? styles.activeButton : styles.button),
                  boxShadow: selectedSkill?.id === skill.id && designStyle === 'glass'
                    ? '0 0 12px var(--accent-glow)'
                    : 'none',
                }}
                title={skill.name}
              >
                <Icon size={18} />
              </motion.button>
            );
          })}
          <motion.button
            whileHover={{ scale: 1.1, rotate: designStyle === 'brutalist' ? 0 : -180 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSkillSelect(null)}
            className={`w-[34px] h-[34px] ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} flex items-center justify-center transition-all`}
            style={styles.button}
            title="Сбросить навык"
          >
            <RotateCcw size={16} style={{ color: 'var(--text-muted)' }} />
          </motion.button>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex flex-col gap-1">
        <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-dim)' }}>
          Режим
        </div>
        {modes.map((mode, idx) => {
          const Icon = mode.icon;
          return (
            <motion.button
              key={mode.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + idx * 0.05 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onModeChange(mode.id)}
              className={`flex items-center gap-3 p-2.5 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} transition-all`}
              style={currentMode === mode.id ? styles.activeButton : styles.button}
            >
              <Icon size={18} />
              <span className="text-sm">{mode.name}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Tools */}
      <div className="flex flex-col gap-1">
        <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-dim)' }}>
          Инструменты
        </div>
        {[
          { id: 'python', icon: Code, label: 'Python REPL' },
          { id: 'sql', icon: Database, label: 'SQL REPL' },
          { id: 'snippets', icon: BookmarkPlus, label: 'Сниппеты' },
          { id: 'solution', icon: CheckSquare, label: 'Проверка решения' },
        ].map((tool, idx) => (
          <motion.button
            key={tool.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 + idx * 0.05 }}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpenPanel(tool.id as any)}
            className={`flex items-center gap-3 p-2.5 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} transition-all hover:bg-white/5`}
            style={styles.button}
          >
            <tool.icon size={18} />
            <span className="text-sm">{tool.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-2">
        {/* Design Style Toggle */}
        <div className="flex gap-2 justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDesignStyleChange(designStyle === 'glass' ? 'brutalist' : 'glass')}
            className={`px-3 py-1.5 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} flex items-center gap-2 text-sm transition-all`}
            style={styles.button}
            title={designStyle === 'glass' ? 'Переключить на брутализм' : 'Переключить на стекло'}
          >
            <Palette size={14} />
            <span>{designStyle === 'glass' ? 'Glass' : 'Brutal'}</span>
          </motion.button>
        </div>

        {/* Theme Switcher */}
        <div className="flex gap-2 justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onThemeChange('dark')}
            className={`w-9 h-9 ${designStyle === 'glass' ? 'rounded-full' : 'rounded-none'} flex items-center justify-center transition-all`}
            style={{
              ...(theme === 'dark' ? styles.activeButton : styles.button),
              boxShadow: theme === 'dark' && designStyle === 'glass' ? '0 0 12px var(--accent-glow)' : 'none',
            }}
            title="Тёмная тема"
          >
            <Moon size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onThemeChange('light')}
            className={`w-9 h-9 ${designStyle === 'glass' ? 'rounded-full' : 'rounded-none'} flex items-center justify-center transition-all`}
            style={{
              ...(theme === 'light' ? styles.activeButton : styles.button),
              boxShadow: theme === 'light' && designStyle === 'glass' ? '0 0 12px var(--accent-glow)' : 'none',
            }}
            title="Светлая тема"
          >
            <Sun size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onThemeChange('amoled')}
            className={`w-9 h-9 ${designStyle === 'glass' ? 'rounded-full' : 'rounded-none'} flex items-center justify-center transition-all`}
            style={{
              ...(theme === 'amoled' ? styles.activeButton : styles.button),
              boxShadow: theme === 'amoled' && designStyle === 'glass' ? '0 0 12px var(--accent-glow)' : 'none',
            }}
            title="AMOLED тема"
          >
            <span className="text-base">■</span>
          </motion.button>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center justify-center gap-2 p-2 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} transition-all hover:bg-red-500/10`}
          style={{ border: `${designStyle === 'brutalist' ? '2px' : '1px'} solid var(--error)` }}
        >
          <Trash size={16} style={{ color: 'var(--error)' }} />
          <span className="text-sm" style={{ color: 'var(--error)' }}>Очистить чат</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center justify-center gap-2 p-2 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} transition-all hover:bg-blue-500/10`}
          style={{ border: `${designStyle === 'brutalist' ? '2px' : '1px'} solid #3b82f6` }}
        >
          <Download size={16} style={{ color: '#3b82f6' }} />
          <span className="text-sm" style={{ color: '#3b82f6' }}>Экспорт</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
