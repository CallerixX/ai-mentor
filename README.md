# AI Mentor — Локальный AI-наставник по программированию

Интерактивный AI-ментор для обучения программированию с голосовым общением, встроенным редактором кода и системой прогресса. Всё работает локально — ваши данные никуда не уходят.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)
![React](https://img.shields.io/badge/React-18-blue)
![Ollama](https://img.shields.io/badge/Ollama-qwen2.5--coder:7b-orange)

## Возможности

### AI-ментор
- Работает на **qwen2.5-coder:7b** через локальный Ollama
- 4 режима: **Обучение**, **Дебаг**, **Код-ревью**, **Практика**
- Ментор не даёт готовых решений — задаёт наводящие вопросы и учит думать

### Система навыков
- **20+ направлений**: Python, JavaScript, TypeScript, Java, C++, C#, Rust, Go, SQL, HTML/CSS, PHP, Swift, Kotlin, Ruby, Data Analytics, Бизнес-аналитика, Системный анализ, Data Engineering, DevOps и другие
- Выбор навыка при старте, ментор адаптируется под контекст

### Система прогресса
- **XP и уровни** — зарабатывай очки за каждое действие
- **Достижения** — открывай награды за активность
- **Статистика** — отслеживай свой прогресс

### Голосовое общение
- **Голосовой ввод** — говорите вопросы вместо набора текста
- **Голосовой вывод** — ментор озвучивает ответы
- Выбор голоса из доступных в системе + кнопка «Тест»

### Python REPL
- Встроенный редактор кода прямо в чате
- Запуск Python-кода в браузере через **Pyodide** (WebAssembly)
- Кнопка «В редактор» на каждом блоке кода от ментора

### SQL REPL
- Интерактивная SQL-песочница на **DuckDB**
- Создание таблиц, запросы, JOIN, GROUP BY — прямо в браузере

### Сниппеты
- Библиотека готовых кусков кода
- Сохранение полезного кода из чата в один клик
- Фильтрация по тегам

### Проверка решений
- В режиме «Практика» — отправь своё решение ментору на проверку
- Получи обратную связь и рекомендации

### Продвинутый чат
- Markdown + подсветка синтаксиса (highlight.js)
- Кнопка «Скопировать код» на каждом блоке
- **Экспорт чата** в .md файл
- **Поиск по чату** (Ctrl+F) с подсветкой найденного
- Умная вставка кода — авто-оборачивание в ``` при Ctrl+V

### Дизайн и темы
- **3 темы**: тёмная, светлая, AMOLED
- **2 стиля**: Glass Morphism (по умолчанию) и Brutalist
- Плавные анимации и переходы

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
│   │   │   ├── SQLRunner.jsx    # SQL REPL (DuckDB)
│   │   │   ├── SnippetsPanel.jsx     # Панель сниппетов
│   │   │   ├── SolutionChecker.jsx # Проверка решений
│   │   │   ├── SessionList.jsx       # Список сессий
│   │   │   ├── SkillSelector.jsx     # Выбор навыка
│   │   │   ├── StatsDashboard.jsx    # Статистика и достижения
│   │   │   ├── AchievementToast.jsx  # Уведомления о достижениях
│   │   │   ├── ThemeSwitcher.jsx     # Переключатель тем
│   │   │   ├── MarkdownToolbar.jsx
│   │   │   ├── VoiceInput.jsx   # Голосовой ввод
│   │   │   └── Icon.jsx         # Компонент иконок
│   │   ├── hooks/
│   │   │   ├── useVoiceOutput.js  # Голосовой вывод
│   │   │   └── useProgress.js     # Система прогресса
│   │   ├── index.css
│   │   ├── custom.css
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
