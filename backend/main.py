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
            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                mode TEXT NOT NULL DEFAULT 'Обучение',
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """
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


class Message(BaseModel):
    role: str
    content: str


async def get_history(limit: int = 50) -> List[Dict[str, str]]:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT role, content, mode FROM chat_history ORDER BY timestamp DESC LIMIT ?",
            (limit,),
        ) as cursor:
            rows = await cursor.fetchall()
            return [
                {"role": row[0], "content": row[1], "mode": row[2]} for row in rows
            ]


async def save_message(role: str, content: str, mode: str):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO chat_history (role, content, mode) VALUES (?, ?, ?)",
            (role, content, mode),
        )
        await db.commit()


@app.get("/api/history")
async def history():
    messages = await get_history()
    return {"messages": messages[::-1]}


@app.delete("/api/history")
async def clear_history():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("DELETE FROM chat_history")
        await db.commit()
    return {"status": "cleared"}


@app.post("/api/chat")
async def chat(request: ChatRequest):
    await save_message("user", request.message, request.mode)

    history = await get_history(50)
    messages_for_ollama = [
        {"role": m["role"], "content": m["content"]}
        for m in history[::-1]
    ]

    async def event_stream():
        full_response = ""
        try:
            async for chunk in ollama.stream_chat(messages_for_ollama, request.mode):
                full_response += chunk
                data = json.dumps({"content": chunk, "done": False})
                yield f"data: {data}\n\n"

            await save_message("assistant", full_response, request.mode)
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
