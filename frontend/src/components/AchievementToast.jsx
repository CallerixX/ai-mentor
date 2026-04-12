import React from 'react'

const AchievementToast = ({ achievement, onClose }) => {
  if (!achievement) return null

  return (
    <div className="achievement-toast" onClick={onClose}>
      <div className="achievement-toast-icon">{achievement.icon}</div>
      <div className="achievement-toast-content">
        <div className="achievement-toast-title">🎉 Достижение разблокировано!</div>
        <div className="achievement-toast-name">{achievement.name}</div>
        <div className="achievement-toast-desc">{achievement.desc}</div>
      </div>
      <button className="achievement-toast-close" onClick={(e) => { e.stopPropagation(); onClose() }}>✕</button>
    </div>
  )
}

export default AchievementToast
