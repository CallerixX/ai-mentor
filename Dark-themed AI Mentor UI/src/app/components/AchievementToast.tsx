import { useEffect } from 'react';
import { X, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

type Achievement = {
  icon: string;
  name: string;
  description: string;
};

type AchievementToastProps = {
  achievement: Achievement;
  theme?: 'dark' | 'light' | 'amoled';
  designStyle?: 'glass' | 'brutalist';
  onClose: () => void;
};

export function AchievementToast({
  achievement,
  theme = 'dark',
  designStyle = 'glass',
  onClose,
}: AchievementToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyles = () => {
    if (designStyle === 'brutalist') {
      const bgColor = theme === 'light' ? '#ffffff' : theme === 'amoled' ? '#000000' : '#1a1a1a';
      const textColor = theme === 'light' ? '#000000' : '#ffffff';
      const borderColor = theme === 'light' ? '#000000' : '#ffffff';

      return {
        container: {
          backgroundColor: bgColor,
          border: `3px solid ${borderColor}`,
          color: textColor,
        },
      };
    }

    const isDark = theme === 'dark' || theme === 'amoled';
    return {
      container: {
        backgroundColor: isDark ? 'var(--sidebar-bg)' : 'rgba(255, 255, 255, 0.95)',
        border: `1px solid ${isDark ? 'var(--border-accent)' : 'rgba(102, 126, 234, 0.5)'}`,
        backdropFilter: 'blur(40px)',
        boxShadow: '0 0 30px var(--accent-glow)',
        color: isDark ? 'var(--text-primary)' : '#1a1a2e',
      },
    };
  };

  const styles = getStyles();

  return (
    <motion.div
      initial={{ x: 400, y: -20, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      exit={{ x: 400, opacity: 0, scale: 0.8 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
      }}
      className={`fixed top-6 right-6 z-50 w-80 p-4 shadow-2xl ${designStyle === 'glass' ? 'rounded-xl' : 'rounded-none'}`}
      style={styles.container}
    >
      <div className="flex gap-3">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: designStyle === 'brutalist' ? 0 : [0, 10, -10, 0],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`flex-shrink-0 w-9 h-9 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center`}
        >
          <Trophy size={20} className="text-white" />
        </motion.div>
        <div className="flex-1">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs uppercase tracking-wide mb-1"
            style={{
              color: 'var(--accent-light)',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            Достижение разблокировано!
          </motion.div>
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-semibold mb-1"
          >
            {achievement.name}
          </motion.div>
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm"
            style={{ opacity: 0.7 }}
          >
            {achievement.description}
          </motion.div>
        </div>
        <motion.button
          whileHover={{ scale: 1.2, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className={`flex-shrink-0 p-1 ${designStyle === 'glass' ? 'rounded-lg' : 'rounded-none'} transition-all hover:bg-white/5`}
        >
          <X size={16} />
        </motion.button>
      </div>

      {/* Progress Bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 4, ease: 'linear' }}
        className={`absolute bottom-0 left-0 h-1 ${designStyle === 'glass' ? 'rounded-bl-xl' : ''}`}
        style={{
          background: 'linear-gradient(90deg, var(--accent-gradient-start), var(--accent-gradient-end))',
        }}
      />
    </motion.div>
  );
}
