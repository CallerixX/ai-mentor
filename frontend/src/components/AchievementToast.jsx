import React from 'react'
import Icon from './Icon'

const AchievementToast = ({ achievement, onClose }) => {
  if (!achievement) return null

  return (
    <div className="achievement-toast" onClick={onClose}>
      <div className="achievement-toast-icon"><Icon name={achievement.icon} size={36} /></div>
      <div className="achievement-toast-content">
        <div className="achievement-toast-title">Достижение разблокировано!</div>
        <div className="achievement-toast-name">{achievement.name}</div>
        <div className="achievement-toast-desc">{achievement.desc}</div>
      </div>
      <button className="achievement-toast-close" onClick={(e) => { e.stopPropagation(); onClose() }}>✕</button>
    </div>
  )
}

export default AchievementToast
