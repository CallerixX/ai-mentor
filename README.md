# AI Mentor — Локальный AI-наставник по программированию

Интерактивный AI-ментор для обучения программированию с голосовым общением и встроенным редактором кода. Всё работает локально — ваши данные никуда не уходят.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)
![React](https://img.shields.io/badge/React-18-blue)
![Ollama](https://img.shields.io/badge/Ollama-qwen2.5--coder:7b-orange)

## Возможности

###  AI-ментор
- Работает на **qwen2.5-coder:7b** через локальный Ollama
- 4 режима: **Обучение**, **Дебаг**, **Код-ревью**, **Практика**
- Ментор не даёт готовых решений — задаёт наводящие вопросы и учит думать

###  Голосовое общение
- **Голосовой ввод** — говорите вопросы вместо набора текста
- **Голосовой вывод** — ментор озвучивает ответы
- Выбор голоса из доступных в системе + кнопка «Тест»

###  Python REPL
- Встроенный редактор кода прямо в чате
- Запуск Python-кода в браузере через **Pyodide** (WebAssembly)
- Кнопка «В редактор» на каждом блоке кода от ментора
- Готовые сниппеты: Hello, Цикл, Функция, Списки, Класс

###  Продвинутый чат
- Markdown + подсветка синтаксиса (highlight.js)
- Кнопка «Скопировать код» на каждом блоке
- **Экспорт чата** в .md файл
- **Поиск по чату** (Ctrl+F) с подсветкой найденного
- Умная вставка кода — авто-оборачивание в ``` при Ctrl+V
- Горячие клавиши: `Ctrl+Enter` — отправить, `Ctrl+B` — жирный, `Ctrl+I` — курсив, `Esc` — закрыть поиск

## Требования

- [Docker](https://www.docker.com/) + Docker Compose
- [Ollama](https://ollama.com/) с моделью `qwen2.5-coder:7b`

## Установка

### 1. Установите Ollama и модель

```bash
# Скачайте и установите Ollama с https://ollama.com/
# Затем загрузите модель:
ollama pull qwen2.5-coder:7b
```

### 2. Клонируйте репозиторий

```bash
git clone https://github.com/CallerixX/ai-mentor.git
cd ai-mentor
```

### 3. Настройте переменные окружения

```bash
cp .env.example .env
```

### 4. Запустите

```bash
docker compose up --build
```

Откройте в браузере:
- **Фронтенд:** http://localhost:3000
- **Бэкенд API:** http://localhost:8000/docs

## Структура проекта

```
ai-mentor/
├── backend/
│   ├── main.py            # FastAPI сервер + SSE стриминг
│   ├── chat_service.py    # Обёртка над Ollama API
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Главный компонент
│   │   ├── components/
│   │   │   ├── Chat.jsx         # Чат с markdown
│   │   │   ├── CodeRunner.jsx   # Python REPL (Pyodide)
│   │   │   ├── MarkdownToolbar.jsx
│   │   │   └── VoiceInput.jsx   # Голосовой ввод
│   │   ├── hooks/
│   │   │   └── useVoiceOutput.js
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## Архитектура

```
┌─────────────┐     SSE      ┌─────────────┐     HTTP      ┌──────────┐
│  Браузер    │ ◄────────── ►│   Backend   │ ◄────────── ►│  Ollama  │
│  (React)    │              │  (FastAPI)  │              │(qwen2.5) │
└─────────────┘              └─────────────┘              └──────────┘
      │                             │
      │   Pyodide (WASM)            │   SQLite
      ▼                             ▼
┌─────────────┐              ┌─────────────┐
│ Python REPL │              │  История    │
│ (клиент)    │              │  диалогов   │
└─────────────┘              └─────────────┘
```

- **Pyodide** работает полностью в браузере — сервер не нагружается
- **Голос** — Web Speech API (встроен в браузер)
- **История** хранится в SQLite на бэкенде

## Горячие клавиши

| Клавиши | Действие |
|---------|----------|
| `Enter` | Отправить сообщение |
| `Shift+Enter` | Новая строка |
| `Ctrl+Enter` | Отправить сообщение |
| `Ctrl+B` | Жирный текст |
| `Ctrl+I` | Курсив |
| `Ctrl+F` | Поиск по чату |
| `Esc` | Закрыть поиск |
| `Tab` (в REPL) | Отступ 4 пробела |
| `Ctrl+Enter` (в REPL) | Запустить код |

## Лицензия

MIT
