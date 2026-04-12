import React from 'react'

const SKILLS = [
  { id: 'python', icon: '🐍', label: 'Python', desc: 'Основы, ООП, алгоритмы' },
  { id: 'javascript', icon: '🟨', label: 'JavaScript', desc: 'ES6+, Node.js, DOM' },
  { id: 'typescript', icon: '🔷', label: 'TypeScript', desc: 'Типы, интерфейсы, generics' },
  { id: 'java', icon: '☕', label: 'Java', desc: 'Spring, ООП, паттерны' },
  { id: 'csharp', icon: '🟪', label: 'C#', desc: '.NET, LINQ, ASP.NET' },
  { id: 'cpp', icon: '⚡', label: 'C++', desc: 'STL, указатели, ООП' },
  { id: 'c', icon: '🔵', label: 'C', desc: 'Указатели, память, алгоритмы' },
  { id: 'rust', icon: '🦀', label: 'Rust', desc: 'Владение, borrowing, async' },
  { id: 'go', icon: '🐹', label: 'Go', desc: 'Горутины, каналы, HTTP' },
  { id: 'sql', icon: '🗄️', label: 'SQL', desc: 'Запросы, JOIN, оптимизация' },
  { id: 'html-css', icon: '🎨', label: 'HTML/CSS', desc: 'Вёрстка, Flexbox, Grid' },
  { id: 'php', icon: '🐘', label: 'PHP', desc: 'Laravel, API, OOP' },
  { id: 'swift', icon: '🍎', label: 'Swift', desc: 'iOS, SwiftUI, UIKit' },
  { id: 'kotlin', icon: '🟧', label: 'Kotlin', desc: 'Android, coroutines, DSL' },
  { id: 'ruby', icon: '💎', label: 'Ruby', desc: 'Rails, metaprogramming' },
  { id: 'data-analytics', icon: '📊', label: 'Data Analytics', desc: 'Pandas, статистика, EDA' },
  { id: 'business-analytics', icon: '💼', label: 'Бизнес-аналитика', desc: 'Метрики, KPI, юнит-экономика' },
  { id: 'systems-analysis', icon: '⚙️', label: 'Системный анализ', desc: 'UML, BPMN, API' },
  { id: 'data-engineering', icon: '🔧', label: 'Data Engineering', desc: 'ETL, пайплайны, Airflow' },
  { id: 'devops', icon: '🚀', label: 'DevOps', desc: 'Docker, K8s, CI/CD' },
]

const SkillSelector = ({ currentSkill, onChange, onConfirm }) => {
  const [selected, setSelected] = React.useState(currentSkill || '')

  const handleConfirm = () => {
    if (selected) onConfirm(selected)
  }

  return (
    <div className="skill-overlay">
      <div className="skill-dialog">
        <div className="skill-dialog-icon">🧠</div>
        <h2 className="skill-dialog-title">Чему хочешь научиться?</h2>
        <p className="skill-dialog-subtitle">Выбери навык — ментор адаптируется под тебя</p>

        <div className="skill-grid">
          {SKILLS.map((s) => (
            <button
              key={s.id}
              className={`skill-card ${selected === s.id ? 'selected' : ''}`}
              onClick={() => setSelected(s.id)}
            >
              <span className="skill-card-icon">{s.icon}</span>
              <span className="skill-card-label">{s.label}</span>
              <span className="skill-card-desc">{s.desc}</span>
            </button>
          ))}
        </div>

        <button
          className="skill-confirm-btn"
          onClick={handleConfirm}
          disabled={!selected}
        >
          Начать обучение →
        </button>
      </div>
    </div>
  )
}

export { SKILLS }
export default SkillSelector
