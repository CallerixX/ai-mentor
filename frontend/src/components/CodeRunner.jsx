import React, { useState, useEffect, useRef, useCallback } from 'react'

const CodeRunner = ({ initialCode }) => {
  const [code, setCode] = useState(
    initialCode || '# Введите Python код здесь\nprint("Привет, мир!")\n'
  )
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [pyodide, setPyodide] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const outputRef = useRef(null)

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode)
    }
  }, [initialCode])

  useEffect(() => {
    const loadPyodide = async () => {
      try {
        if (window.loadPyodide) {
          const py = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
          })
          setPyodide(py)
        }
      } catch (err) {
        setError('Ошибка загрузки Python: ' + err.message)
      } finally {
        setIsLoading(false)
      }
    }
    loadPyodide()
  }, [])

  const runCode = useCallback(async () => {
    if (!pyodide || isRunning) return

    setIsRunning(true)
    setOutput('')
    setError('')

    try {
      pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
`)

      const result = await pyodide.runPythonAsync(code)

      const stdout = pyodide.runPython('sys.stdout.getvalue()')
      const stderr = pyodide.runPython('sys.stderr.getvalue()')

      let out = ''
      if (stdout) out += stdout
      if (stderr) out += '⚠️ Ошибки:\n' + stderr
      if (result !== undefined && result !== null && !stderr) {
        out += String(result)
      }

      setOutput(out || '(нет вывода)')

      pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
`)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsRunning(false)
    }
  }, [pyodide, code, isRunning])

  const clearOutput = () => {
    setOutput('')
    setError('')
  }

  const exampleSnippets = [
    { label: 'Hello', code: 'print("Привет, мир!")' },
    { label: 'Цикл', code: 'for i in range(5):\n    print(f"Число: {i}")' },
    { label: 'Функция', code: 'def fib(n):\n    a, b = 0, 1\n    for _ in range(n):\n        print(a)\n        a, b = b, a + b\n\nfib(10)' },
    { label: 'Списки', code: 'numbers = [1, 2, 3, 4, 5]\nsquared = [x**2 for x in numbers]\nprint(squared)' },
    { label: 'Класс', code: 'class Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return f"{self.name} говорит!"\n\ncat = Animal("Кот")\nprint(cat.speak())' },
  ]

  return (
    <div className="code-runner">
      <div className="code-runner-header">
        <span className="code-runner-title">🐍 Python REPL</span>
        <div className="code-runner-actions">
          {isLoading && <span className="code-runner-loading">Загрузка Python...</span>}
          {!isLoading && (
            <div className="snippet-buttons">
              {exampleSnippets.map((s) => (
                <button
                  key={s.label}
                  className="snippet-btn"
                  onClick={() => setCode(s.code)}
                  title={s.code}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="code-editor-wrapper">
        <textarea
          className="code-editor"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault()
              const start = e.target.selectionStart
              const end = e.target.selectionEnd
              setCode(code.substring(0, start) + '    ' + code.substring(end))
              setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 4
              }, 0)
            }
            if (e.key === 'Enter' && e.ctrlKey) {
              e.preventDefault()
              runCode()
            }
          }}
          placeholder="# Введите Python код..."
          spellCheck={false}
          disabled={isLoading}
        />
      </div>

      <div className="code-runner-controls">
        <button
          className="run-btn"
          onClick={runCode}
          disabled={!pyodide || isRunning || isLoading}
        >
          {isRunning ? (
            <>
              <span className="run-spinner"></span>
              Выполняется...
            </>
          ) : (
            '▶ Запустить (Ctrl+Enter)'
          )}
        </button>
        <button className="clear-btn-small" onClick={clearOutput}>
          Очистить вывод
        </button>
      </div>

      {(output || error) && (
        <div className="code-output-wrapper">
          <div className="code-output-label">Вывод:</div>
          <pre className={`code-output ${error ? 'code-output-error' : ''}`}>
            {error || output}
          </pre>
        </div>
      )}
    </div>
  )
}

export default CodeRunner
