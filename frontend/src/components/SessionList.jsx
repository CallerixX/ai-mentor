import React, { useState } from 'react'

const SessionList = ({ sessions, activeSessionId, onSelect, onCreate, onDelete, onRename }) => {
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')

  const startRename = (session) => {
    setEditingId(session.id)
    setEditName(session.name)
  }

  const saveRename = () => {
    if (editName.trim()) {
      onRename(editingId, editName.trim())
    }
    setEditingId(null)
  }

  const handleCreate = () => {
    if (newName.trim()) {
      onCreate(newName.trim())
      setNewName('')
      setShowCreate(false)
    }
  }

  return (
    <div className="session-list">
      {sessions.map((s) => (
        <div
          key={s.id}
          className={`session-item ${s.id === activeSessionId ? 'active' : ''}`}
          onClick={() => onSelect(s.id)}
        >
          <span className="session-icon">💬</span>
          {editingId === s.id ? (
            <input
              className="session-edit-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveRename()
                if (e.key === 'Escape') setEditingId(null)
              }}
              onBlur={saveRename}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="session-name">{s.name}</span>
          )}
          <div className="session-actions" onClick={(e) => e.stopPropagation()}>
            <button
              className="session-action-btn"
              onClick={() => startRename(s)}
              title="Переименовать"
            >
              ✏️
            </button>
            <button
              className="session-action-btn session-delete"
              onClick={() => onDelete(s.id)}
              title="Удалить"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}

      {showCreate ? (
        <div className="session-create">
          <input
            className="session-create-input"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate()
              if (e.key === 'Escape') { setShowCreate(false); setNewName('') }
            }}
            placeholder="Название чата..."
            autoFocus
          />
          <div className="session-create-actions">
            <button className="create-confirm" onClick={handleCreate}>✓</button>
            <button className="create-cancel" onClick={() => { setShowCreate(false); setNewName('') }}>✕</button>
          </div>
        </div>
      ) : (
        <button className="session-add-btn" onClick={() => setShowCreate(true)}>
          ＋ Новый чат
        </button>
      )}
    </div>
  )
}

export default SessionList
