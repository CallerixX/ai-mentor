import { useState } from 'react';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Skill, Theme, DesignStyle } from '../App';

type SkillPickerModalProps = {
  skills: Skill[];
  theme: Theme;
  designStyle: DesignStyle;
  onSelect: (skill: Skill) => void;
};

export function SkillPickerModal({ skills, theme, designStyle, onSelect }: SkillPickerModalProps) {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const handleConfirm = () => {
    if (selectedSkill) {
      onSelect(selectedSkill);
    }
  };

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
        selectedCard: {
          backgroundColor: textColor,
          color: bgColor,
          border: `2px solid ${borderColor}`,
        },
        button: {
          backgroundColor: textColor,
          color: bgColor,
          border: `2px solid ${borderColor}`,
        },
      };
    }

    const isDark = theme === 'dark' || theme === 'amoled';
    return {
      overlay: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
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
      selectedCard: {
        backgroundColor: isDark ? 'var(--card-bg)' : 'rgba(255, 255, 255, 0.8)',
        border: '1px solid var(--border-accent)',
        boxShadow: '0 0 20px var(--accent-glow)',
      },
      button: {
        background: 'linear-gradient(135deg, var(--accent-gradient-start), var(--accent-gradient-end))',
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
    >
      <motion.div
        initial={{ scale: 0.8, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 50, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 ${designStyle === 'glass' ? 'rounded-2xl' : 'rounded-none'}`}
        style={styles.container}
      >
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center mb-8"
        >
          <motion.div
            animate={{
              rotate: designStyle === 'brutalist' ? [0, 0] : [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ repeat: Infinity, duration: 3 }}
            className={`w-14 h-14 ${designStyle === 'glass' ? 'rounded-2xl' : 'rounded-none'} flex items-center justify-center mb-4`}
            style={{
              background: designStyle === 'brutalist'
                ? styles.button.backgroundColor
                : 'linear-gradient(135deg, var(--accent-gradient-start), var(--accent-gradient-end))',
            }}
          >
            {designStyle === 'brutalist' ? (
              <span className="text-4xl" style={{ color: styles.container.backgroundColor }}>■</span>
            ) : (
              <GraduationCap size={32} />
            )}
          </motion.div>
          <h1
            className="text-3xl mb-2"
            style={{
              fontWeight: 700,
              ...(designStyle === 'brutalist'
                ? {}
                : {
                    background: 'linear-gradient(135deg, var(--accent-gradient-start), var(--accent-gradient-end))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }),
            }}
          >
            Чему хочешь научиться?
          </h1>
          <p style={{ opacity: 0.7 }}>
            Выбери навык для начала обучения с AI ментором
          </p>
        </motion.div>

        {/* Skills Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {skills.map((skill, idx) => {
            const Icon = skill.Icon;
            const isSelected = selectedSkill?.id === skill.id;

            return (
              <motion.button
                key={skill.id}
                initial={{ scale: 0, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3 + idx * 0.03,
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                }}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedSkill(skill)}
                className={`p-4 ${designStyle === 'glass' ? 'rounded-xl' : 'rounded-none'} text-left transition-all`}
                style={isSelected ? styles.selectedCard : styles.card}
              >
                <div className="flex flex-col gap-2">
                  <motion.div
                    animate={isSelected ? { rotate: [0, 10, -10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon size={32} />
                  </motion.div>
                  <div className="font-semibold">{skill.name}</div>
                  <div className="text-xs" style={{ opacity: 0.6 }}>
                    {skill.description}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Confirm Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConfirm}
          disabled={!selectedSkill}
          className={`w-full py-3.5 ${designStyle === 'glass' ? 'rounded-xl' : 'rounded-none'} transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
          style={{
            ...styles.button,
            fontWeight: 700,
            opacity: selectedSkill ? 1 : 0.4,
          }}
        >
          <motion.div
            className="flex items-center justify-center gap-2"
            animate={selectedSkill ? { x: [0, 5, 0] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <span>Начать обучение</span>
            <ArrowRight size={20} />
          </motion.div>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
