import React from 'react'
import { GraduationCap } from 'lucide-react'

const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

const SKILLS = [
  { id: 'python', icon: 'python', label: 'Python', desc: 'Основы, ООП, алгоритмы' },
  { id: 'javascript', icon: 'javascript', label: 'JavaScript', desc: 'ES6+, Node.js, DOM' },
  { id: 'typescript', icon: 'typescript', label: 'TypeScript', desc: 'Типы, интерфейсы, generics' },
  { id: 'java', icon: 'java', label: 'Java', desc: 'Spring, ООП, паттерны' },
  { id: 'csharp', icon: 'csharp', label: 'C#', desc: '.NET, LINQ, ASP.NET' },
  { id: 'cpp', icon: 'cpp', label: 'C++', desc: 'STL, указатели, ООП' },
  { id: 'c', icon: 'c-lang', label: 'C', desc: 'Указатели, память, алгоритмы' },
  { id: 'rust', icon: 'rust', label: 'Rust', desc: 'Владение, borrowing, async' },
  { id: 'go', icon: 'go', label: 'Go', desc: 'Горутины, каналы, HTTP' },
  { id: 'sql', icon: 'sql', label: 'SQL', desc: 'Запросы, JOIN, оптимизация' },
  { id: 'html-css', icon: 'html-css', label: 'HTML/CSS', desc: 'Вёрстка, Flexbox, Grid' },
  { id: 'php', icon: 'php', label: 'PHP', desc: 'Laravel, API, OOP' },
  { id: 'swift', icon: 'swift', label: 'Swift', desc: 'iOS, SwiftUI, UIKit' },
  { id: 'kotlin', icon: 'kotlin', label: 'Kotlin', desc: 'Android, coroutines, DSL' },
  { id: 'ruby', icon: 'ruby', label: 'Ruby', desc: 'Rails, metaprogramming' },
  { id: 'data-analytics', icon: 'data-analytics', label: 'Data Analytics', desc: 'Pandas, статистика, EDA' },
  { id: 'business-analytics', icon: 'business-analytics', label: 'Бизнес-аналитика', desc: 'Метрики, KPI, юнит-экономика' },
  { id: 'systems-analysis', icon: 'systems-analysis', label: 'Системный анализ', desc: 'UML, BPMN, API' },
  { id: 'data-engineering', icon: 'data-engineering', label: 'Data Engineering', desc: 'ETL, пайплайны, Airflow' },
  { id: 'devops', icon: 'devops', label: 'DevOps', desc: 'Docker, K8s, CI/CD' },
]

const SkillSelector = ({ currentSkill, onChange, onConfirm }) => {
  const [selected, setSelected] = React.useState(currentSkill || '')

  const handleConfirm = () => {
    if (selected) onConfirm(selected)
  }

  return (
    <div className="skill-overlay">
      <div className="skill-dialog">
        <div className="skill-dialog-icon">
          <GraduationCap size={40} strokeWidth={1.5} color="white" />
        </div>
        <h2 className="skill-dialog-title">Чему хочешь научиться?</h2>
        <p className="skill-dialog-subtitle">Выбери навык — ментор адаптируется под тебя</p>

        <div className="skill-grid">
          {SKILLS.map((s) => (
            <button
              key={s.id}
              className={`skill-card ${selected === s.id ? 'selected' : ''}`}
              onClick={() => setSelected(s.id)}
            >
              <span className="skill-card-icon">
                <img src={`${basePath}/icons/${s.icon}.svg`} alt={s.label} width={34} height={34} />
              </span>
              <span className="skill-card-label">{s.label}</span>
              <span className="skill-card-desc">{s.desc}</span>
            </button>
          ))}
        </div>

        <button className="skill-confirm-btn" onClick={handleConfirm} disabled={!selected}>
          Начать обучение →
        </button>
      </div>
    </div>
  )
}

export { SKILLS }
export default SkillSelector
