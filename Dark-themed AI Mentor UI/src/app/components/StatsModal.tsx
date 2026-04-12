import { X, MessageCircle, Code, Volume2, BookmarkPlus, Download, Target, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import type { Skill, Theme, DesignStyle } from '../App';

type StatsModalProps = {
  level: { number: number; name: string; xp: number; maxXp: number };
  skills: Skill[];
  theme: Theme;
  designStyle: DesignStyle;
  onClose: () => void;
};

const achievements = [
  { id: 1, name: 'Первый шаг', icon: Trophy, unlocked: true },
  { id: 2, name: 'Болтун', icon: MessageCircle, unlocked: true },
  { id: 3, name: 'Кодер', icon: Code, unlocked: true },
  { id: 4, name: 'Полиглот', icon: Target, unlocked: false },
  { id: 5, name: 'Мастер', icon: Trophy, unlocked: false },
  { id: 6, name: 'Гуру', icon: Trophy, unlocked: false },
  { id: 7, name: 'Легенда', icon: Trophy, unlocked: false },
  { id: 8, name: 'Исследователь', icon: Target, unlocked: true },
];

export function StatsModal({ level, skills, theme, designStyle, onClose }: StatsModalProps) {
  const stats = [
    { label: 'Сообщений', value: '342', icon: MessageCircle },
    { label: 'Запусков кода', value: '87', icon: Code },
    { label: 'Голосовых', value: '23', icon: Volume2 },
    { label: 'Сниппетов', value: '45', icon: BookmarkPlus },
    { label: 'Экспортов', value: '12', icon: Download },
    { label: 'Навыков', value: '8', icon: Target },
  ];

  const getStyles = () => {
    if (designStyle === 'brutalist') {
      const bgColor = theme === 'light' ? '#ffffff' : theme === 'amoled' ? '#000000' : '#1a1a1a';
      const textColor = theme === 'light' ? '#000000' : '#ffffff';
      const borderColor = theme === 'light' ? '#000000' : '#ffffff';

      return {
        overlay: { backgroundColor: 'rgba(0, 0, 0, 0.9)' },
        container: {
          backgroundColor: bgColor,
          border: `4px solid ${borderColor}`,
          color: textColor,
        },
        card: {
          backgroundColor: bgColor,
          border: `2px solid ${borderColor}`,
        },
      };
    }

    const isDark = theme === 'dark' || theme === 'amoled';
    return {
      overlay: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
      container: {
        backgroundColor: isDark ? 'var(--sidebar-bg)' : 'rgba(255, 255, 255, 0.95)',
        border: `1px solid ${isDark ? 'var(--border-light)' : 'rgba(0, 0, 0, 0.1)'}`,
        backdropFilter: 'blur(40px)',
        color: isDark ? 'var(--text-primary)' : '#1a1a2e',
      },
      card: {
        backgroundColor: isDark ? 'var(--card-bg)' : 'rgba(255, 255, 255, 0.6)',
        border: `1px solid ${isDark ? 'var(--border-light)' : 'rgba(0, 0, 0, 0.1)'}`,
        backdropFilter: 'blur(10px)',
      },
    };
  };

  const styles = getStyles();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50"
      style={styles.overlay}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto ${designStyle === 'glass' ? 'rounded-2xl' : 'rounded-none'}`}
        style={styles.container}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 sticky top-0"
          style={{
            ...styles.container,
            borderBottom: designStyle === 'brutalist' ? `2px solid ${styles.card.border}` : styles.card.border,
          }}
        >
          <h2 className="text-xl font-semibold">Статистика и достижения</h2>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className={`p-2 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} transition-all hover:bg-white/5`}
          >
            <X size={20} />
          </motion.button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Level Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`p-6 ${designStyle === 'glass' ? 'rounded-xl' : 'rounded-none'}`}
            style={styles.card}
          >
            <div className="flex items-center gap-4 mb-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`w-12 h-12 ${designStyle === 'glass' ? 'rounded-xl' : 'rounded-none'} bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl`}
              >
                ⭐
              </motion.div>
              <div>
                <div className="text-2xl font-bold">{level.name}</div>
                <div style={{ opacity: 0.7 }}>Уровень {level.number}</div>
              </div>
            </div>
            <div className={`w-full h-2.5 ${designStyle === 'glass' ? 'rounded-full' : 'rounded-none'} overflow-hidden`} style={{ backgroundColor: 'var(--input-bg)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(level.xp / level.maxXp) * 100}%` }}
                transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
                className={`h-full ${designStyle === 'glass' ? 'rounded-full' : 'rounded-none'}`}
                style={{
                  background: 'linear-gradient(90deg, var(--accent-gradient-start), var(--accent-gradient-end))',
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm" style={{ opacity: 0.6 }}>
              <span>{level.xp} XP</span>
              <span>{level.maxXp} XP</span>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div>
            <motion.h3
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg font-semibold mb-3"
            >
              Общая статистика
            </motion.h3>
            <div className="grid grid-cols-3 gap-3">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: 0.3 + idx * 0.05,
                      type: 'spring',
                      stiffness: 150,
                    }}
                    whileHover={{ scale: 1.05, y: -3 }}
                    className={`p-4 ${designStyle === 'glass' ? 'rounded-xl' : 'rounded-none'}`}
                    style={styles.card}
                  >
                    <Icon size={20} className="mb-2" style={{ color: 'var(--accent-light)' }} />
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + idx * 0.05 }}
                      className="text-2xl font-bold mb-1"
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-sm" style={{ opacity: 0.6 }}>{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Explored Skills */}
          <div>
            <motion.h3
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg font-semibold mb-3"
            >
              Изученные навыки
            </motion.h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => {
                const Icon = skill.Icon;
                return (
                  <motion.div
                    key={skill.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: 0.6 + idx * 0.05,
                      type: 'spring',
                    }}
                    whileHover={{ scale: 1.05, rotate: designStyle === 'brutalist' ? 0 : 5 }}
                    className={`px-3 py-2 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} flex items-center gap-2`}
                    style={styles.card}
                  >
                    <Icon size={20} />
                    <span className="text-sm">{skill.name}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <motion.h3
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-lg font-semibold mb-3"
            >
              Достижения
            </motion.h3>
            <div className="grid grid-cols-4 gap-3">
              {achievements.map((achievement, idx) => {
                const Icon = achievement.icon;
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ scale: 0, opacity: 0, rotateY: 180 }}
                    animate={{
                      scale: 1,
                      opacity: achievement.unlocked ? 1 : 0.4,
                      rotateY: 0,
                    }}
                    transition={{
                      delay: 0.8 + idx * 0.05,
                      type: 'spring',
                      stiffness: 100,
                    }}
                    whileHover={{
                      scale: achievement.unlocked ? 1.1 : 1,
                      rotateY: achievement.unlocked ? 0 : 360,
                      transition: { duration: 0.5 },
                    }}
                    className={`p-4 ${designStyle === 'glass' ? 'rounded-xl' : 'rounded-none'} flex flex-col items-center text-center`}
                    style={{
                      ...styles.card,
                      border: achievement.unlocked && designStyle === 'glass'
                        ? '1px solid var(--border-accent)'
                        : styles.card.border,
                    }}
                  >
                    <div className="mb-2">
                      {achievement.unlocked ? (
                        <Icon size={32} />
                      ) : (
                        <span className="text-3xl">🔒</span>
                      )}
                    </div>
                    <div className="text-sm font-medium">
                      {achievement.unlocked ? achievement.name : '???'}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
