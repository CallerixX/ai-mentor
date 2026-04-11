import os
import json
import aiosqlite
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from chat_service import OllamaService

DB_PATH = os.getenv("DB_PATH", "/app/data/mentor.db")
ollama = OllamaService()


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                mode TEXT NOT NULL DEFAULT 'Обучение',
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES sessions(id)
            )
            """
        )
        await db.commit()

        async with db.execute("SELECT COUNT(*) FROM sessions") as cursor:
            row = await cursor.fetchone()
            if row[0] == 0:
                await db.execute(
                    "INSERT INTO sessions (name) VALUES (?)",
                    ("Новый чат",),
                )
                await db.commit()
    yield


app = FastAPI(title="AI Mentor", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    mode: str = "Обучение"
    session_id: Optional[int] = None


class SessionCreate(BaseModel):
    name: str = "Новый чат"


class SessionRename(BaseModel):
    name: str


class SolutionCheck(BaseModel):
    task: str
    code: str
    explanation: str


async def get_default_session_id() -> int:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT id FROM sessions ORDER BY created_at LIMIT 1") as cursor:
            row = await cursor.fetchone()
            return row[0] if row else 0


async def get_session_messages(session_id: int, limit: int = 50) -> List[Dict[str, str]]:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT role, content, mode, timestamp FROM messages WHERE session_id = ? ORDER BY timestamp DESC LIMIT ?",
            (session_id, limit),
        ) as cursor:
            rows = await cursor.fetchall()
            return [
                {"role": row[0], "content": row[1], "mode": row[2], "timestamp": row[3]}
                for row in rows
            ]


async def save_session_message(session_id: int, role: str, content: str, mode: str):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO messages (session_id, role, content, mode) VALUES (?, ?, ?, ?)",
            (session_id, role, content, mode),
        )
        await db.commit()


# ---- Sessions ----

@app.get("/api/sessions")
async def list_sessions():
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT id, name, created_at FROM sessions ORDER BY created_at DESC"
        ) as cursor:
            rows = await cursor.fetchall()
            return {
                "sessions": [
                    {"id": row[0], "name": row[1], "created_at": row[2]} for row in rows
                ]
            }


@app.post("/api/sessions")
async def create_session(body: SessionCreate):
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "INSERT INTO sessions (name) VALUES (?)", (body.name,)
        )
        await db.commit()
        return {"id": cursor.lastrowid, "name": body.name}


@app.delete("/api/sessions/{session_id}")
async def delete_session(session_id: int):
    async with aiosqlite.connect(DB_PATH) as db:
        count = await db.execute("SELECT COUNT(*) FROM sessions")
        cnt = (await count.fetchone())[0]
        if cnt <= 1:
            raise HTTPException(status_code=400, detail="Нельзя удалить единственный чат")
        await db.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
        await db.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
        await db.commit()
    return {"status": "deleted"}


@app.put("/api/sessions/{session_id}")
async def rename_session(session_id: int, body: SessionRename):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE sessions SET name = ? WHERE id = ?", (body.name, session_id)
        )
        await db.commit()
    return {"status": "renamed"}


# ---- Chat ----

@app.get("/api/history")
async def history(session_id: Optional[int] = None):
    sid = session_id or await get_default_session_id()
    messages = await get_session_messages(sid, 50)
    return {"messages": messages[::-1], "session_id": sid}


@app.delete("/api/history")
async def clear_history(session_id: Optional[int] = None):
    sid = session_id or await get_default_session_id()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("DELETE FROM messages WHERE session_id = ?", (sid,))
        await db.commit()
    return {"status": "cleared"}


@app.post("/api/chat")
async def chat(request: ChatRequest):
    sid = request.session_id or await get_default_session_id()
    await save_session_message(sid, "user", request.message, request.mode)

    history_msgs = await get_session_messages(sid, 50)
    messages_for_ollama = [
        {"role": m["role"], "content": m["content"]}
        for m in history_msgs[::-1]
    ]

    async def event_stream():
        full_response = ""
        try:
            async for chunk in ollama.stream_chat(messages_for_ollama, request.mode):
                full_response += chunk
                data = json.dumps({"content": chunk, "done": False})
                yield f"data: {data}\n\n"

            await save_session_message(sid, "assistant", full_response, request.mode)
            done_data = json.dumps({"content": "", "done": True})
            yield f"data: {done_data}\n\n"
        except Exception as e:
            error_data = json.dumps({"error": str(e), "done": True})
            yield f"data: {error_data}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


# ---- Solution Check ----

@app.post("/api/check-solution")
async def check_solution(body: SolutionCheck):
    check_prompt = f"""Ты AI-ментор. Пользователь решил задачу. Оцени решение.

ЗАДАЧА: {body.task}
РЕШЕНИЕ ПОЛЬЗОВАТЕЛЯ:
```python
{body.code}
```
ОБЪЯСНЕНИЕ: {body.explanation}

Оцени по шкале 1-10:
1. Правильность кода
2. Качество кода (читаемость, стиль)
3. Эффективность

Дай краткий фидбек на русском. Если есть ошибки — укажи как исправить.
Если решение хорошее — похвали и предложи усложнённую задачу."""

    messages_for_ollama = [
        {"role": "user", "content": check_prompt}
    ]

    async def event_stream():
        full_response = ""
        try:
            async for chunk in ollama.stream_chat(messages_for_ollama, "Практика"):
                full_response += chunk
                data = json.dumps({"content": chunk, "done": False})
                yield f"data: {data}\n\n"
            done_data = json.dumps({"content": "", "done": True})
            yield f"data: {done_data}\n\n"
        except Exception as e:
            error_data = json.dumps({"error": str(e), "done": True})
            yield f"data: {error_data}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.get("/api/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT_BACKEND", 8000)))
