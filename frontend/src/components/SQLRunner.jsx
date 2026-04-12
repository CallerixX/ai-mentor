import React, { useState, useEffect, useRef, useCallback } from 'react'

const SQLRunner = ({ initialCode }) => {
  const [code, setCode] = useState(
    initialCode || '-- SQL запрос\n-- Создаём таблицу\nCREATE TABLE users (\n    id INTEGER PRIMARY KEY,\n    name VARCHAR(50),\n    age INTEGER,\n    city VARCHAR(50)\n);\n\nINSERT INTO users VALUES\n    (1, \'Анна\', 25, \'Москва\'),\n    (2, \'Борис\', 30, \'Питер\'),\n    (3, \'Виктория\', 28, \'Москва\'),\n    (4, \'Григорий\', 35, \'Казань\'),\n    (5, \'Дарья\', 22, \'Питер\');\n\nSELECT city, COUNT(*) as cnt, AVG(age) as avg_age\nFROM users\nGROUP BY city\nORDER BY cnt DESC;\n'
  )
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [duckdb, setDuckdb] = useState(null)
  const [conn, setConn] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [tableInfo, setTableInfo] = useState('')

  useEffect(() => {
    if (initialCode) setCode(initialCode)
  }, [initialCode])

  useEffect(() => {
    const loadDuckDB = async () => {
      try {
        const duckdbModule = await import('https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/+esm')
        const duckdb = await duckdbModule.createDuckDB()
        await duckdb.instantiate()
        const conn = await duckdb.connect()
        setDuckdb(duckdb)
        setConn(conn)
      } catch (err) {
        setError('Ошибка загрузки DuckDB: ' + err.message)
      } finally {
        setIsLoading(false)
      }
    }
    loadDuckDB()
  }, [])

  const runQuery = useCallback(async () => {
    if (!conn || isRunning) return

    setIsRunning(true)
    setOutput('')
    setError('')

    try {
      const queries = code.split(';').map(q => q.trim()).filter(Boolean)
      let results = []

      for (const query of queries) {
        if (!query) continue
        try {
          const result = await conn.query(query)
          const rows = result.toArray()
          const cols = result.schema.fields.map(f => f.name)

          if (query.toUpperCase().startsWith('SELECT') || query.toUpperCase().startsWith('WITH')) {
            results.push({ query, columns: cols, rows: rows.map(r => cols.map(c => r[c])) })
          } else {
            const affected = rows.length
            results.push({ query, columns: [], rows: [], info: `Выполнено. Затронуто строк: ${affected}` })
          }
        } catch (err) {
          results.push({ query, error: err.message })
        }
      }

      let out = ''
      results.forEach((r, i) => {
        if (r.error) {
          out += `❌ Запрос #${i + 1}:\n${r.query}\nОшибка: ${r.error}\n\n`
        } else if (r.info) {
          out += `✅ ${r.info}\n\n`
        } else if (r.rows.length === 0) {
          out += `✅ Запрос #${i + 1} выполнен (пустой результат)\n\n`
        } else {
          out += `📊 Результат #${i + 1}:\n`
          const colWidths = r.columns.map((c, ci) =>
            Math.max(c.length, ...r.rows.map(row => String(row[ci]).length))
          )
          const header = r.columns.map((c, i) => c.padEnd(colWidths[i])).join(' │ ')
          const separator = colWidths.map(w => '─'.repeat(w)).join('─┼─')
          out += `${header}\n${separator}\n`
          r.rows.forEach(row => {
            out += row.map((val, i) => String(val).padEnd(colWidths[i])).join(' │ ') + '\n'
          })
          out += `\nВсего строк: ${r.rows.length}\n\n`
        }
      })

      setOutput(out || 'Нет результатов')

      // Update table info
      try {
        const tables = await conn.query("SELECT name FROM sqlite_master WHERE type='table'")
        setTableInfo(tables.toArray().map(r => r.name).join(', ') || 'Нет таблиц')
      } catch {
        setTableInfo('')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsRunning(false)
    }
  }, [conn, code, isRunning])

  const clearAll = useCallback(async () => {
    if (!duckdb) return
    try {
      const newConn = await duckdb.connect()
      setConn(newConn)
      setOutput('')
      setError('')
      setTableInfo('')
    } catch (err) {
      setError(err.message)
    }
  }, [duckdb])

  const exampleSnippets = [
    { label: 'SELECT', code: "SELECT * FROM users WHERE age > 25 ORDER BY age DESC;" },
    { label: 'JOIN', code: "CREATE TABLE orders (\n    id INTEGER PRIMARY KEY,\n    user_id INTEGER,\n    amount REAL,\n    date VARCHAR(20)\n);\n\nINSERT INTO orders VALUES\n    (1, 1, 1500.00, '2024-01-15'),\n    (2, 2, 2300.50, '2024-01-16'),\n    (3, 1, 800.00, '2024-01-17'),\n    (4, 3, 3100.00, '2024-01-18');\n\nSELECT u.name, u.city, SUM(o.amount) as total\nFROM users u\nJOIN orders o ON u.id = o.user_id\nGROUP BY u.id, u.name, u.city\nORDER BY total DESC;" },
    { label: 'Оконные', code: "SELECT \n    name,\n    city,\n    age,\n    ROW_NUMBER() OVER (PARTITION BY city ORDER BY age) as rn,\n    AVG(age) OVER (PARTITION BY city) as city_avg_age,\n    age - AVG(age) OVER (PARTITION BY city) as diff_from_avg\nFROM users\nORDER BY city, age;" },
    { label: 'CTE', code: "WITH city_stats AS (\n    SELECT \n        city,\n        COUNT(*) as user_count,\n        AVG(age) as avg_age,\n        MIN(age) as min_age,\n        MAX(age) as max_age\n    FROM users\n    GROUP BY city\n    HAVING COUNT(*) > 1\n)\nSELECT \n    city,\n    user_count,\n    ROUND(avg_age, 1) as avg_age,\n    min_age,\n    max_age,\n    max_age - min_age as age_range\nFROM city_stats\nORDER BY user_count DESC;" },
  ]

  return (
    <div className="code-runner">
      <div className="code-runner-header">
        <span className="code-runner-title">🗄️ SQL (DuckDB)</span>
        {tableInfo && <span className="code-runner-loading">Таблицы: {tableInfo}</span>}
        {isLoading && <span className="code-runner-loading">Загрузка DuckDB...</span>}
        {!isLoading && (
          <div className="snippet-buttons">
            {exampleSnippets.map((s) => (
              <button key={s.label} className="snippet-btn" onClick={() => setCode(s.code)} title={s.code}>
                {s.label}
              </button>
            ))}
          </div>
        )}
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
              setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = start + 4 }, 0)
            }
            if (e.key === 'Enter' && e.ctrlKey) {
              e.preventDefault()
              runQuery()
            }
          }}
          placeholder="-- SQL запрос..."
          spellCheck={false}
          disabled={isLoading}
        />
      </div>

      <div className="code-runner-controls">
        <button className="run-btn" onClick={runQuery} disabled={!conn || isRunning || isLoading}>
          {isRunning ? (<><span className="run-spinner"></span> Выполняется...</>) : ('▶ Запустить (Ctrl+Enter)')}
        </button>
        <button className="clear-btn-small" onClick={clearAll}>Сбросить БД</button>
      </div>

      {(output || error) && (
        <div className="code-output-wrapper">
          <div className="code-output-label">Результат:</div>
          <pre className={`code-output ${error ? 'code-output-error' : ''}`}>{error || output}</pre>
        </div>
      )}
    </div>
  )
}

export default SQLRunner
