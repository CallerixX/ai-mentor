import React, { useState, useEffect } from 'react'

const SnippetsPanel = ({ isOpen, onClose }) => {
  const [snippets, setSnippets] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ai-mentor-snippets') || '[]')
    } catch {
      return []
    }
  })
  const [filterTag, setFilterTag] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    localStorage.setItem('ai-mentor-snippets', JSON.stringify(snippets))
  }, [snippets])

  const allTags = [...new Set(snippets.flatMap((s) => s.tags))]
  const filtered = filterTag
    ? snippets.filter((s) => s.tags.includes(filterTag))
    : snippets

  const addSnippet = () => {
    if (!newCode.trim()) return
    const tags = newTag.split(',').map((t) => t.trim()).filter(Boolean)
    setSnippets((prev) => [
      {
        id: Date.now(),
        code: newCode,
        tags: tags.length > 0 ? tags : ['без тега'],
        created: new Date().toLocaleDateString('ru-RU'),
      },
      ...prev,
    ])
    setNewCode('')
    setNewTag('')
    setShowAdd(false)
  }

  const deleteSnippet = (id) => {
    setSnippets((prev) => prev.filter((s) => s.id !== id))
  }

  const copySnippet = (code) => {
    navigator.clipboard.writeText(code)
  }

  if (!isOpen) return null

  return (
    <div className="snippets-panel">
      <div className="snippets-header">
        <span className="snippets-title">📌 Избранные сниппеты</span>
        <div className="snippets-header-actions">
          <button className="snippets-add-btn" onClick={() => setShowAdd(!showAdd)}>
            ＋
          </button>
          <button className="snippets-close-btn" onClick={onClose}>✕</button>
        </div>
      </div>

      <div className="snippets-tags">
        <button
          className={`tag-btn ${!filterTag ? 'active' : ''}`}
          onClick={() => setFilterTag('')}
        >
          Все
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            className={`tag-btn ${filterTag === tag ? 'active' : ''}`}
            onClick={() => setFilterTag(tag === filterTag ? '' : tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {showAdd && (
        <div className="snippets-add-form">
          <textarea
            className="snippets-code-input"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="Вставь код сюда..."
            rows={5}
          />
          <input
            className="snippets-tag-input"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Теги через запятую (python, основы)"
          />
          <button className="snippets-save-btn" onClick={addSnippet}>
            Сохранить
          </button>
        </div>
      )}

      <div className="snippets-list">
        {filtered.length === 0 && (
          <div className="snippets-empty">
            Нет сохранённых сниппетов
          </div>
        )}
        {filtered.map((s) => (
          <div key={s.id} className="snippet-card">
            <div className="snippet-card-header">
              <div className="snippet-tags">
                {s.tags.map((t) => (
                  <span key={t} className="snippet-tag">{t}</span>
                ))}
              </div>
              <div className="snippet-card-actions">
                <button
                  className="snippet-copy-btn"
                  onClick={() => copySnippet(s.code)}
                  title="Копировать"
                >
                  📋
                </button>
                <button
                  className="snippet-delete-btn"
                  onClick={() => deleteSnippet(s.id)}
                  title="Удалить"
                >
                  ✕
                </button>
              </div>
            </div>
            <pre className="snippet-code">{s.code}</pre>
            <span className="snippet-date">{s.created}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SnippetsPanel
