import React from 'react'
import { MessageCircle, Code, Mic, Bookmark, Download, Target, RotateCcw } from 'lucide-react'
import { motion } from 'motion/react'
import Icon from './Icon'
import { SKILLS } from './SkillSelector'

const StatsDashboard = ({ stats, levelInfo, unlockedAchievements, lockedAchievements, onClose, onReset }) => {
  const triedSkills = stats.skillsList.map((id) => SKILLS.find((s) => s.id === id)).filter(Boolean)

  const handleReset = () => {
    if (window.confirm('Сбросить весь прогресс? Это действие нельзя отменить.')) {
      onReset()
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="stats-overlay" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} transition={{ type: 'spring', stiffness: 100, damping: 20 }} className="stats-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="stats-header">
          <span className="stats-title">Статистика и достижения</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.95 }} onClick={handleReset} className="stats-close-btn" title="Сбросить прогресс" style={{ color: 'var(--error)' }}>
              <RotateCcw size={16} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.95 }} onClick={onClose} className="stats-close-btn">✕</motion.button>
          </div>
        </div>

        <div className="stats-level-section">
          <div className="stats-level-badge">
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="stats-level-icon">
              <Icon name={levelInfo.iconName} size={40} />
            </motion.div>
            <div>
              <div className="stats-level-name">{levelInfo.name}</div>
              <div className="stats-level-number">Уровень {levelInfo.level}</div>
            </div>
          </div>
          <div className="stats-xp-bar-bg">
            <motion.div initial={{ width: 0 }} animate={{ width: `${levelInfo.progress}%` }} transition={{ delay: 0.3, duration: 0.8 }} className="stats-xp-bar-fill" style={{ background: `linear-gradient(90deg, ${levelInfo.color}, ${levelInfo.color}88)` }} />
          </div>
          <div className="stats-xp-text">{stats.totalXP} XP / {levelInfo.nextLevel ? levelInfo.nextLevel.min + ' XP' : 'МАКС'}</div>
        </div>

        <div className="stats-grid">
          {[
            { label: 'Сообщений', value: stats.totalMessages, icon: MessageCircle },
            { label: 'Запусков кода', value: stats.codeRuns, icon: Code },
            { label: 'Голосовых', value: stats.voiceMessages, icon: Mic },
            { label: 'Сниппетов', value: stats.snippetsSaved, icon: Bookmark },
            { label: 'Экспортов', value: stats.exports, icon: Download },
            { label: 'Навыков', value: stats.skillsTried, icon: Target },
          ].map((stat, idx) => (
            <motion.div key={stat.label} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 + idx * 0.05, type: 'spring', stiffness: 150 }} whileHover={{ scale: 1.05, y: -3 }} className="stats-card">
              <stat.icon size={20} style={{ color: 'var(--accent-light)', marginBottom: 8 }} />
              <div className="stats-card-value">{stat.value}</div>
              <div className="stats-card-label">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {triedSkills.length > 0 && (
          <div className="stats-skills-section">
            <div className="stats-section-title">Исследованные навыки</div>
            <div className="stats-skills-list">
              {triedSkills.map((s) => (
                <span key={s.id} className="stats-skill-tag"><img src={`/icons/${s.icon}.svg`} alt="" width={12} height={12} /> {s.label}</span>
              ))}
            </div>
          </div>
        )}

        <div className="stats-achievements-section">
          <div className="stats-section-title">Достижения ({unlockedAchievements.length}/{unlockedAchievements.length + lockedAchievements.length})</div>
          <div className="stats-achievements-grid">
            {unlockedAchievements.map((a, idx) => (
              <motion.div key={a.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 + idx * 0.05 }} whileHover={{ scale: 1.1 }} className="stats-achievement unlocked" title={a.desc}>
                <span className="stats-achievement-icon"><Icon name={a.icon} size={24} /></span>
                <span className="stats-achievement-name">{a.name}</span>
              </motion.div>
            ))}
            {lockedAchievements.map((a, idx) => (
              <motion.div key={a.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.4 }} transition={{ delay: 0.5 + idx * 0.05 }} className="stats-achievement locked">
                <span className="stats-achievement-icon">🔒</span>
                <span className="stats-achievement-name">???</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default StatsDashboard
