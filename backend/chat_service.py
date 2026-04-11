import httpx
import json
import os
from typing import AsyncGenerator, List, Dict

SYSTEM_PROMPT = """Ты опытный AI-ментор по программированию. Твоя цель — научить пользователя думать самостоятельно.
ПРАВИЛА:
- Никогда не давай готовое решение сразу. Задавай наводящие вопросы.
- Разбивай сложные концепции на шаги.
- Приводи минимальные рабочие примеры кода с пояснениями.
- Адаптируй сложность под уровень пользователя.
- Если пользователь присылает код с ошибкой — укажи на неё, объясни причину, предложи направление исправления.
- Используй русский язык. Форматируй код в markdown блоках.
- Режимы: 1. Обучение (теория/вопросы) 2. Дебаг (анализ ошибок) 3. Код-ревью (улучшение) 4. Практика (генерация задач).
Действуй строго по этим правилам."""


class OllamaService:
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_HOST", "http://host.docker.internal:11434")
        self.model = os.getenv("MODEL_NAME", "qwen2.5-coder:7b")
        self.timeout = 120.0

    async def stream_chat(
        self, messages: List[Dict[str, str]], mode: str = "Обучение"
    ) -> AsyncGenerator[str, None]:
        system_message = {
            "role": "system",
            "content": f"[Режим: {mode}]\n{SYSTEM_PROMPT}",
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
