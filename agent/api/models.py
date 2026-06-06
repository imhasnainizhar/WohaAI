from pydantic import BaseModel, Field
from typing import Literal, Optional


# =========================
# Claude model registry
# =========================
ClaudeModelName = Literal[
    "claude-3-opus",
    "claude-3-sonnet",
    "claude-3-haiku",
]

StyleType = Literal[
    "casual",
    "normal",
    "learning",
    "explanatory",
]


# =========================
# Chat request schema
# =========================
class ChatRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=50_000)

    model: ClaudeModelName = Field(
        default="claude-3-sonnet",
        description="Claude model selection",
    )

    style: StyleType = Field(default="casual")

# =========================
# Optional SSE event models (future-proofing)
# =========================
class ErrorData(BaseModel):
    message: str
    recoverable: bool = False


class MessageStartData(BaseModel):
    id: str
    model: str
    type: str
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None


class TextDeltaData(BaseModel):
    text: str