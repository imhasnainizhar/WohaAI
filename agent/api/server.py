from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse

import asyncio

from .models import ChatRequest, ErrorData
from ..main.core import WoahAgent
from ..main.styles.definitions import get_style_prompt
from typing import AsyncGenerator

app = FastAPI(title="Woah Streaming Server", version="1.0")


# =========================
# SSE helper
# =========================
def format_sse(event: str, data: dict) -> str:
    return (
        f"event: {event}\n"
        f"data: {data}\n\n"
    )


def safe_serialize(data):
    if hasattr(data, "model_dump"):
        return data.model_dump()
    return data

def get_chat_prompt(style: str, user_prompt: str) -> str:
    return f"""
        You are WohaAIChatbot.

        {get_style_prompt(style)}

        Always follow the selected style strictly.

        User: {user_prompt}"""


# =========================
# Streaming endpoint
# =========================
@app.post("/chat/stream")
async def chat_stream(req: ChatRequest, request: Request):
    agent = WoahAgent(
        model_name=req.model,
        prompt=get_chat_prompt(req.style, req.prompt),
    )

    async def event_generator() -> AsyncGenerator[str, None]:
        try:
            async for event in agent.chat():

                if await request.is_disconnected():
                    break

                yield format_sse(event.type, safe_serialize(event.data))
                await asyncio.sleep(0)

        except Exception as e:
            yield format_sse(
                "error",
                safe_serialize(ErrorData(message=str(e)))
            )

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# =========================
# Health check
# =========================
@app.get("/health")
def health():
    return {"status": "ok"}