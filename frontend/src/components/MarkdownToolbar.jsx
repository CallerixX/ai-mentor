import React from 'react'

const MarkdownToolbar = ({ onInsert }) => {
  const buttons = [
    {
      label: 'Жирный',
      icon: '𝐁',
      before: '**',
      after: '**',
      title: 'Жирный текст (Ctrl+B)',
    },
    {
      label: 'Курсив',
      icon: '𝐼',
      before: '_',
      after: '_',
      title: 'Курсив (Ctrl+I)',
    },
    {
      label: 'Код',
      icon: '</>',
      before: '`',
      after: '`',
      title: 'Встроенный код',
    },
    {
      label: 'Блок кода',
      icon: '{ }',
      before: '\n```\n',
      after: '\n```\n',
      title: 'Блок кода',
    },
    {
      label: 'Список',
      icon: '☰',
      before: '\n- ',
      after: '',
      title: 'Маркированный список',
    },
    {
      label: 'Цитата',
      icon: '❝',
      before: '\n> ',
      after: '',
      title: 'Цитата',
    },
  ]

  return (
    <div className="markdown-toolbar">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          className="toolbar-btn"
          onClick={() => onInsert(btn.before, btn.after)}
          title={btn.title}
          type="button"
        >
          {btn.icon}
        </button>
      ))}
    </div>
  )
}

export default MarkdownToolbar
