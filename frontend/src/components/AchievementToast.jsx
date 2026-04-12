import React from 'react'
import { X, Trophy } from 'lucide-react'
import { motion } from 'motion/react'
import Icon from './Icon'

const AchievementToast = ({ achievement, onClose }) => {
  if (!achievement) return null

  return (
    <motion.div
      initial={{ x: 400, y: -20, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      exit={{ x: 400, opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="achievement-toast"
      onClick={onClose}
    >
      <div className="achievement-toast-icon">
        <Icon name={achievement.icon} size={36} />
      </div>
      <div className="achievement-toast-content">
        <div className="achievement-toast-title">Достижение разблокировано!</div>
        <div className="achievement-toast-name">{achievement.name}</div>
        <div className="achievement-toast-desc">{achievement.desc}</div>
      </div>
      <motion.button whileHover={{ scale: 1.2, rotate: 90 }} whileTap={{ scale: 0.9 }} className="achievement-toast-close" onClick={(e) => { e.stopPropagation(); onClose() }}>
        <X size={16} />
      </motion.button>
    </motion.div>
  )
}

export default AchievementToast
