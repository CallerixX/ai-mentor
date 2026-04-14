import { useState, useEffect, useCallback, useRef } from 'react'

const LEVELS = [
  { min: 0, name: 'Новичок', icon: 'level-newbie', color: '#4ade80' },
  { min: 100, name: 'Ученик', icon: 'level-student', color: '#60a5fa' },
  { min: 300, name: 'Практик', icon: 'level-practitioner', color: '#a78bfa' },
  { min: 600, name: 'Продвинутый', icon: 'level-advanced', color: '#f472b6' },
  { min: 1000, name: 'Мастер', icon: 'level-master', color: '#fbbf24' },
  { min: 2000, name: 'Легенда', icon: 'level-legend', color: '#fb923c' },
]

const ACHIEVEMENTS = [
  { id: 'first-message', name: 'Первый шаг', desc: 'Отправь первое сообщение', icon: 'ach-first-step', check: (s) => s.totalMessages >= 1 },
  { id: 'first-code', name: 'Кодер', desc: 'Запусти первый код', icon: 'ach-coder', check: (s) => s.codeRuns >= 1 },
  { id: 'first-voice', name: 'Голос', desc: 'Отправь голосовое сообщение', icon: 'ach-voice', check: (s) => s.voiceMessages >= 1 },
  { id: 'ten-messages', name: 'Болтун', desc: 'Отправь 10 сообщений', icon: 'ach-chatter', check: (s) => s.totalMessages >= 10 },
  { id: 'hundred-messages', name: 'Сотня', desc: 'Отправь 100 сообщений', icon: 'ach-hundred', check: (s) => s.totalMessages >= 100 },
  { id: 'five-hundred-xp', name: 'Марафонец', desc: 'Набери 500 XP', icon: 'ach-marathon', check: (s) => s.totalXP >= 500 },
  { id: 'thousand-xp', name: 'Тысячник', desc: 'Набери 1000 XP', icon: 'ach-thousand', check: (s) => s.totalXP >= 1000 },
  { id: 'polyglot', name: 'Полиглот', desc: 'Попробуй 3+ навыка', icon: 'ach-polyglot', check: (s) => s.skillsTried >= 3 },
  { id: 'researcher', name: 'Исследователь', desc: 'Попробуй все навыки', icon: 'ach-researcher', check: (s) => s.skillsTried >= 20 },
  { id: 'voice-marathon', name: 'Голосовой марафон', desc: '10 голосовых сообщений', icon: 'ach-voice-marathon', check: (s) => s.voiceMessages >= 10 },
  { id: 'code-master', name: 'Код-мастер', desc: '50 запусков кода', icon: 'ach-code-master', check: (s) => s.codeRuns >= 50 },
  { id: 'night-owl', name: 'Ночная сова', desc: 'Учиться после 23:00', icon: 'ach-night-owl', check: (s) => s.nightStudy },
  { id: 'early-bird', name: 'Ранняя пташка', desc: 'Учиться до 07:00', icon: 'ach-early-bird', check: (s) => s.earlyStudy },
  { id: 'exporter', name: 'Архивариус', desc: 'Экспортируй чат', icon: 'ach-exporter', check: (s) => s.exports >= 1 },
  { id: 'snippets', name: 'Коллекционер', desc: 'Сохрани 5 сниппетов', icon: 'ach-snippets', check: (s) => s.snippetsSaved >= 5 },
  { id: 'level-up', name: 'Первый рост', desc: 'Достигни 2 уровня', icon: 'ach-level-up', check: (s) => s.level >= 2 },
]

const XP_ACTIONS = {
  message: 10,
  voiceMessage: 15,
  codeRun: 25,
  snippetSave: 10,
  export: 20,
  newSkill: 50,
}

const getDefaultStats = () => ({
  totalXP: 0,
  totalMessages: 0,
  codeRuns: 0,
  voiceMessages: 0,
  skillsTried: 0,
  skillsList: [],
  exports: 0,
  snippetsSaved: 0,
  nightStudy: false,
  earlyStudy: false,
  level: 1,
  achievements: [],
  lastActive: new Date().toISOString(),
})

export const useProgress = () => {
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('ai-mentor-progress')
      return saved ? { ...getDefaultStats(), ...JSON.parse(saved) } : getDefaultStats()
    } catch {
      return getDefaultStats()
    }
  })

  const [newAchievements, setNewAchievements] = useState([])
  const [showAchievementToast, setShowAchievementToast] = useState(null)
  const toastTimeout = useRef(null)

  useEffect(() => {
    localStorage.setItem('ai-mentor-progress', JSON.stringify(stats))
  }, [stats])

  const getLevel = useCallback((xp) => {
    let level = 1
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].min) {
        level = i + 1
        break
      }
    }
    return level
  }, [])

  const getLevelInfo = useCallback((xp) => {
    const level = getLevel(xp)
    const currentLevel = LEVELS[level - 1] || LEVELS[0]
    const nextLevel = LEVELS[level] || null
    const currentMin = currentLevel.min
    const nextMin = nextLevel ? nextLevel.min : currentLevel.min + 1000
    const progress = nextLevel ? ((xp - currentMin) / (nextMin - currentMin)) * 100 : 100
    return { level, ...currentLevel, iconName: currentLevel.icon, progress, nextLevel }
  }, [getLevel])

  const checkAchievements = useCallback((newStats) => {
    const unlocked = []
    ACHIEVEMENTS.forEach((a) => {
      if (!newStats.achievements.includes(a.id) && a.check(newStats)) {
        unlocked.push(a)
      }
    })
    return unlocked
  }, [])

  const addXP = useCallback((action, amount) => {
    setStats((prev) => {
      const xpGain = amount || XP_ACTIONS[action] || 0
      const newXP = prev.totalXP + xpGain
      const newLevel = getLevel(newXP)

      const updated = {
        ...prev,
        totalXP: newXP,
        level: newLevel,
        lastActive: new Date().toISOString(),
      }

      const unlocked = checkAchievements(updated)
      if (unlocked.length > 0) {
        updated.achievements = [...prev.achievements, ...unlocked.map((a) => a.id)]
        setNewAchievements(unlocked)
        setShowAchievementToast(unlocked[0])
        if (toastTimeout.current) clearTimeout(toastTimeout.current)
        toastTimeout.current = setTimeout(() => setShowAchievementToast(null), 4000)
      }

      return updated
    })
  }, [getLevel, checkAchievements])

  const recordMessage = useCallback(() => {
    const hour = new Date().getHours()
    setStats((prev) => {
      const updated = {
        ...prev,
        totalMessages: prev.totalMessages + 1,
        nightStudy: prev.nightStudy || hour >= 23,
        earlyStudy: prev.earlyStudy || hour < 7,
        lastActive: new Date().toISOString(),
      }
      const unlocked = checkAchievements(updated)
      if (unlocked.length > 0) {
        updated.achievements = [...prev.achievements, ...unlocked.map((a) => a.id)]
        setNewAchievements(unlocked)
        setShowAchievementToast(unlocked[0])
        if (toastTimeout.current) clearTimeout(toastTimeout.current)
        toastTimeout.current = setTimeout(() => setShowAchievementToast(null), 4000)
      }
      return updated
    })
    addXP('message')
  }, [addXP, checkAchievements])

  const recordCodeRun = useCallback(() => {
    setStats((prev) => {
      const updated = { ...prev, codeRuns: prev.codeRuns + 1, lastActive: new Date().toISOString() }
      const unlocked = checkAchievements(updated)
      if (unlocked.length > 0) {
        updated.achievements = [...prev.achievements, ...unlocked.map((a) => a.id)]
        setNewAchievements(unlocked)
        setShowAchievementToast(unlocked[0])
        if (toastTimeout.current) clearTimeout(toastTimeout.current)
        toastTimeout.current = setTimeout(() => setShowAchievementToast(null), 4000)
      }
      return updated
    })
    addXP('codeRun')
  }, [addXP, checkAchievements])

  const recordVoiceMessage = useCallback(() => {
    setStats((prev) => {
      const updated = { ...prev, voiceMessages: prev.voiceMessages + 1, lastActive: new Date().toISOString() }
      const unlocked = checkAchievements(updated)
      if (unlocked.length > 0) {
        updated.achievements = [...prev.achievements, ...unlocked.map((a) => a.id)]
        setNewAchievements(unlocked)
        setShowAchievementToast(unlocked[0])
        if (toastTimeout.current) clearTimeout(toastTimeout.current)
        toastTimeout.current = setTimeout(() => setShowAchievementToast(null), 4000)
      }
      return updated
    })
    addXP('voiceMessage')
  }, [addXP, checkAchievements])

  const recordSkill = useCallback((skillId) => {
    setStats((prev) => {
      if (prev.skillsList.includes(skillId)) return prev
      const updated = {
        ...prev,
        skillsList: [...prev.skillsList, skillId],
        skillsTried: prev.skillsList.length + 1,
        lastActive: new Date().toISOString(),
      }
      const unlocked = checkAchievements(updated)
      if (unlocked.length > 0) {
        updated.achievements = [...prev.achievements, ...unlocked.map((a) => a.id)]
        setNewAchievements(unlocked)
        setShowAchievementToast(unlocked[0])
        if (toastTimeout.current) clearTimeout(toastTimeout.current)
        toastTimeout.current = setTimeout(() => setShowAchievementToast(null), 4000)
      }
      return updated
    })
    addXP('newSkill')
  }, [addXP, checkAchievements])

  const recordExport = useCallback(() => {
    setStats((prev) => {
      const updated = { ...prev, exports: prev.exports + 1, lastActive: new Date().toISOString() }
      const unlocked = checkAchievements(updated)
      if (unlocked.length > 0) {
        updated.achievements = [...prev.achievements, ...unlocked.map((a) => a.id)]
        setNewAchievements(unlocked)
        setShowAchievementToast(unlocked[0])
        if (toastTimeout.current) clearTimeout(toastTimeout.current)
        toastTimeout.current = setTimeout(() => setShowAchievementToast(null), 4000)
      }
      return updated
    })
    addXP('export')
  }, [addXP, checkAchievements])

  const recordSnippetSave = useCallback(() => {
    setStats((prev) => {
      const updated = { ...prev, snippetsSaved: prev.snippetsSaved + 1, lastActive: new Date().toISOString() }
      const unlocked = checkAchievements(updated)
      if (unlocked.length > 0) {
        updated.achievements = [...prev.achievements, ...unlocked.map((a) => a.id)]
        setNewAchievements(unlocked)
        setShowAchievementToast(unlocked[0])
        if (toastTimeout.current) clearTimeout(toastTimeout.current)
        toastTimeout.current = setTimeout(() => setShowAchievementToast(null), 4000)
      }
      return updated
    })
    addXP('snippetSave')
  }, [addXP, checkAchievements])

  const resetProgress = useCallback(() => {
    localStorage.removeItem('ai-mentor-progress')
    setStats(getDefaultStats())
    setNewAchievements([])
    setShowAchievementToast(null)
  }, [])

  const levelInfo = getLevelInfo(stats.totalXP)
  const unlockedAchievements = ACHIEVEMENTS.filter((a) => stats.achievements.includes(a.id))
  const lockedAchievements = ACHIEVEMENTS.filter((a) => !stats.achievements.includes(a.id))

  return {
    stats,
    levelInfo,
    unlockedAchievements,
    lockedAchievements,
    newAchievements,
    showAchievementToast,
    addXP,
    recordMessage,
    recordCodeRun,
    recordVoiceMessage,
    recordSkill,
    recordExport,
    recordSnippetSave,
    resetProgress,
  }
}

export { LEVELS, ACHIEVEMENTS, XP_ACTIONS }
export default useProgress
