import httpx
import json
import os
from typing import AsyncGenerator, List, Dict

SYSTEM_PROMPT = """Ты опытный AI-ментор по программированию и анализу данных. Твоя цель — научить пользователя думать самостоятельно.

Навыки, в которых ты помогаешь:
- **Python** — основы, ООП, алгоритмы, скрипты, автоматизация
- **SQL** — запросы, JOIN, агрегации, оконные функции, оптимизация
- **Data Analytics** — Pandas, визуализация, статистика, EDA, A/B тесты
- **Бизнес-аналитика** — метрики, KPI, юнит-экономика, когортный анализ
- **Системный анализ** — UML, BPMN, требования, интеграции, API
- **Data Engineering** — ETL, пайплайны, Airflow, Spark, dbt

ПРАВИЛА:
- Никогда не давай готовое решение сразу. Задавай наводящие вопросы.
- Разбивай сложные концепции на шаги.
- Приводи минимальные рабочие примеры кода с пояснениями.
- Адаптируй сложность под уровень пользователя.
- Если пользователь присылает код/запрос с ошибкой — укажи на неё, объясни причину, предложи направление исправления.
- Используй русский язык. Форматируй код в markdown блоках с указанием языка (python, sql и т.д.).
- Режимы: 1. Обучение (теория/вопросы) 2. Дебаг (анализ ошибок) 3. Код-ревью (улучшение) 4. Практика (генерация задач).
- Если пользователь меняет тему или навык — адаптируйся и помогай в новой области.
- Для SQL: показывай схемы таблиц, объясняй план запроса, предлагай оптимизации.
- Для аналитики: учин думать метриками, интерпретировать данные, строить выводы.

Действуй строго по этим правилам."""


class OllamaService:
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_HOST", "http://host.docker.internal:11434")
        self.model = os.getenv("MODEL_NAME", "qwen2.5-coder:7b")
        self.timeout = 120.0

    async def stream_chat(
        self, messages: List[Dict[str, str]], mode: str = "Обучение", skill: str = "Python"
    ) -> AsyncGenerator[str, None]:
        skill_context = f"Текущий навык: {skill}"
        system_message = {
            "role": "system",
            "content": f"[Режим: {mode}]\n{skill_context}\n\n{SYSTEM_PROMPT}",
        }
        full_messages = [system_message] + messages

        payload = {
            "model": self.model,
            "messages": full_messages,
            "stream": True,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
            },
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/api/chat",
                json=payload,
                headers={"Content-Type": "application/json"},
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line.strip():
                        continue
                    try:
                        data = json.loads(line)
                        if "message" in data:
                            content = data["message"].get("content", "")
                            if content:
                                yield content
                            if data.get("done", False):
                                break
                    except json.JSONDecodeError:
                        continue
