import React, { useState, useRef } from 'react'

const SolutionChecker = ({ isOpen, onClose, initialCode = '', initialTask = '' }) => {
  const [task, setTask] = useState(initialTask)
  const [code, setCode] = useState(initialCode)
  const [explanation, setExplanation] = useState('')
  const [result, setResult] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const resultRef = useRef(null)

  const checkSolution = async () => {
    if (!code.trim()) return
    setIsChecking(true)
    setResult('')

    try {
      const response = await fetch('/api/check-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: task || 'Решить задачу на Python',
          code,
          explanation,
        }),
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullResult = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content && !data.done) {
                fullResult += data.content
                setResult(fullResult)
              }
            } catch {
              // skip
            }
          }
        }
      }
    } catch (err) {
      setResult('Ошибка: ' + err.message)
    } finally {
      setIsChecking(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="solution-checker">
      <div className="solution-checker-header">
        <span className="solution-checker-title">✅ Проверка решения</span>
        <div className="solution-checker-actions">
          <button
            className="collapse-btn"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '▴' : '▾'}
          </button>
          <button className="solution-close-btn" onClick={onClose}>✕</button>
        </div>
      </div>

      {expanded && (
        <>
          <div className="solution-inputs">
            <input
              className="solution-task-input"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Описание задачи (необязательно)"
            />
            <textarea
              className="solution-code-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Твоё решение..."
              rows={6}
              spellCheck={false}
            />
            <input
              className="solution-explain-input"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Объяснение решения (необязательно)"
            />
            <button
              className="solution-check-btn"
              onClick={checkSolution}
              disabled={isChecking || !code.trim()}
            >
              {isChecking ? 'Проверяю...' : '🔍 Проверить решение'}
            </button>
          </div>

          {result && (
            <div className="solution-result">
              <div className="solution-result-label">Результат проверки:</div>
              <pre className="solution-result-text">{result}</pre>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SolutionChecker
