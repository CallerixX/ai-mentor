import React from 'react'

const themes = [
  { id: 'dark', label: 'Тёмная', icon: '🌙' },
  { id: 'light', label: 'Светлая', icon: '☀️' },
  { id: 'amoled', label: 'AMOLED', icon: '🖤' },
]

const ThemeSwitcher = ({ currentTheme, onChange }) => (
  <div className="theme-switcher">
    {themes.map((t) => (
      <button
        key={t.id}
        className={`theme-btn ${currentTheme === t.id ? 'active' : ''}`}
        onClick={() => onChange(t.id)}
        title={t.label}
      >
        {t.icon}
      </button>
    ))}
  </div>
)

export default ThemeSwitcher
