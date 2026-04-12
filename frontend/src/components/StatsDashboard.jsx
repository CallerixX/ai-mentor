import React from 'react'
import Icon from './Icon'
import { SKILLS } from './SkillSelector'

const StatsDashboard = ({ stats, levelInfo, unlockedAchievements, lockedAchievements, onClose }) => {
  const skillMap = {}
  SKILLS.forEach((s) => { skillMap[s.id] = s })

  const triedSkills = stats.skillsList.map((id) => skillMap[id]).filter(Boolean)

  return (
    <div className="stats-overlay" onClick={onClose}>
      <div className="stats-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="stats-header">
          <span className="stats-title">Статистика обучения</span>
          <button className="stats-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="stats-level-section">
          <div className="stats-level-badge">
            <span className="stats-level-icon"><Icon name={levelInfo.iconName} size={48} /></span>
            <div>
              <div className="stats-level-name">{levelInfo.name}</div>
              <div className="stats-level-number">Уровень {levelInfo.level}</div>
            </div>
          </div>
          <div className="stats-xp-bar-bg">
            <div className="stats-xp-bar-fill" style={{ width: `${levelInfo.progress}%`, background: `linear-gradient(90deg, ${levelInfo.color}, ${levelInfo.color}88)` }} />
          </div>
          <div className="stats-xp-text">{stats.totalXP} XP / {levelInfo.nextLevel ? levelInfo.nextLevel.min + ' XP' : 'МАКС'}</div>
        </div>

        <div className="stats-grid">
          <div className="stats-card">
            <span className="stats-card-icon"><Icon name="ach-chatter" size={20} /></span>
            <span className="stats-card-value">{stats.totalMessages}</span>
            <span className="stats-card-label">Сообщений</span>
          </div>
          <div className="stats-card">
            <span className="stats-card-icon"><Icon name="ach-coder" size={20} /></span>
            <span className="stats-card-value">{stats.codeRuns}</span>
            <span className="stats-card-label">Запусков кода</span>
          </div>
          <div className="stats-card">
            <span className="stats-card-icon"><Icon name="ach-voice" size={20} /></span>
            <span className="stats-card-value">{stats.voiceMessages}</span>
            <span className="stats-card-label">Голосовых</span>
          </div>
          <div className="stats-card">
            <span className="stats-card-icon"><Icon name="ach-snippets" size={20} /></span>
            <span className="stats-card-value">{stats.snippetsSaved}</span>
            <span className="stats-card-label">Сниппетов</span>
          </div>
          <div className="stats-card">
            <span className="stats-card-icon"><Icon name="ach-exporter" size={20} /></span>
            <span className="stats-card-value">{stats.exports}</span>
            <span className="stats-card-label">Экспортов</span>
          </div>
          <div className="stats-card">
            <span className="stats-card-icon"><Icon name="ach-polyglot" size={20} /></span>
            <span className="stats-card-value">{stats.skillsTried}</span>
            <span className="stats-card-label">Навыков</span>
          </div>
        </div>

        {triedSkills.length > 0 && (
          <div className="stats-skills-section">
            <div className="stats-section-title">Исследованные навыки</div>
            <div className="stats-skills-list">
              {triedSkills.map((s) => (
                <span key={s.id} className="stats-skill-tag"><Icon name={s.icon} size={12} /> {s.label}</span>
              ))}
            </div>
          </div>
        )}

        <div className="stats-achievements-section">
          <div className="stats-section-title">Достижения ({unlockedAchievements.length}/{unlockedAchievements.length + lockedAchievements.length})</div>
          <div className="stats-achievements-grid">
            {unlockedAchievements.map((a) => (
              <div key={a.id} className="stats-achievement unlocked" title={a.desc}>
                <span className="stats-achievement-icon"><Icon name={a.icon} size={24} /></span>
                <span className="stats-achievement-name">{a.name}</span>
              </div>
            ))}
            {lockedAchievements.map((a) => (
              <div key={a.id} className="stats-achievement locked" title={a.desc}>
                <span className="stats-achievement-icon">🔒</span>
                <span className="stats-achievement-name">???</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsDashboard
