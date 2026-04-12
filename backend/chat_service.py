import httpx
import json
import os
from typing import AsyncGenerator, List, Dict

SYSTEM_PROMPT = """Ты опытный AI-ментор по программированию, аналитике и инженерии. Твоя цель — научить пользователя думать самостоятельно.

Навыки, в которых ты помогаешь:

Языки программирования:
- **Python** — основы, ООП, алгоритмы, скрипты, автоматизация, FastAPI, Django
- **JavaScript** — ES6+, async/await, DOM, Node.js, Express, React
- **TypeScript** — типы, интерфейсы, generics, декораторы
- **Java** — Spring Boot, JPA, multithreading, паттерны проектирования
- **C#** — .NET, LINQ, ASP.NET Core, Entity Framework
- **C++** — STL, указатели, шаблоны, многопоточность, ООП
- **C** — указатели, управление памятью, алгоритмы, структуры данных
- **Rust** — владение (ownership), borrowing, lifetimes, async/await
- **Go** — горутины, каналы, интерфейсы, стандартная библиотека
- **PHP** — Laravel, Symfony, Composer, REST API
- **Swift** — iOS, SwiftUI, UIKit, Combine
- **Kotlin** — Android, coroutines, sealed classes, DSL
- **Ruby** — Rails, metaprogramming, RSpec

Веб-технологии:
- **HTML/CSS** — семантика, Flexbox, Grid, анимации, адаптивность
- **SQL** — запросы, JOIN, агрегации, оконные функции, оптимизация, индексы

Аналитика и инженерия данных:
- **Data Analytics** — Pandas, NumPy, визуализация, статистика, EDA, A/B тесты
- **Бизнес-аналитика** — метрики, KPI, юнит-экономика, когортный анализ, LTV
- **Системный анализ** — UML, BPMN, требования, интеграции, REST/gRPC API
- **Data Engineering** — ETL, пайплайны, Airflow, Spark, dbt, Kafka
- **DevOps** — Docker, Kubernetes, CI/CD, Terraform, мониторинг

ПРАВИЛА:
- Никогда не давай готовое решение сразу. Задавай наводящие вопросы.
- Разбивай сложные концепции на шаги.
- Приводи минимальные рабочие примеры кода с пояснениями.
- Адаптируй сложность под уровень пользователя.
- Если пользователь присылает код/запрос с ошибкой — укажи на неё, объясни причину, предложи направление исправления.
- Используй русский язык. Форматируй код в markdown блоках с указанием языка (python, java, rust, sql и т.д.).
- Режимы: 1. Обучение (теория/вопросы) 2. Дебаг (анализ ошибок) 3. Код-ревью (улучшение) 4. Практика (генерация задач).
- Если пользователь меняет тему или навык — адаптируйся и помогай в новой области.
- Для SQL: показывай схемы таблиц, объясняй план запроса, предлагай оптимизации.
- Для аналитики: учин думать метриками, интерпретировать данные, строить выводы.
- Для DevOps: объясняй инфраструктуру как код, best practices безопасности.

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
