"""
types/event.py

Canonical SSE event dataclasses for the Woah agent streaming protocol.
All wire types map 1-to-1 to Anthropic SDK stream events, extended with
web-search result events and a first-class error envelope.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Literal, Optional, Union, TypedDict


# ---------------------------------------------------------------------------
# Message Dataclasses
# ---------------------------------------------------------------------------

@dataclass
class WMessageStart:
    id: str
    type: Literal["assistant"]
    model: str
    input_tokens: int
    output_tokens: int
    stop_reason: Optional[str]
    stop_sequence: Optional[str]
    content: List[Any] = field(default_factory=list)


@dataclass
class WMessageStop:
    type: Literal["assistant"] = "assistant"


@dataclass
class WMessageDelta:
    stop_reason: Optional[str] = None
    stop_sequence: Optional[str] = None
    output_tokens: Optional[int] = None   # cumulative from usage


# ---------------------------------------------------------------------------
# Content block Dataclasses
# ---------------------------------------------------------------------------

class TextBlock(TypedDict):
    type: Literal["text"]
    text: str


class ToolUseBlock(TypedDict):
    type: Literal["tool_use"]
    id: str
    name: str
    input: Dict[str, Any]
        
class ThinkingBlock(TypedDict):
    type: Literal["thinking"]
    thinking: str
    signature: str = Literal[""]


ContentBlock = Union[TextBlock, ToolUseBlock, ThinkingBlock]


@dataclass
class WContentBlockStart:
    index: int
    type: Literal["w_content_block_start"]
    content_block: ContentBlock

@dataclass
class WContentBlockStop:
    type: Literal["w_content_block_stop"]
    index: int


# ---------------------------------------------------------------------------
# Delta types (within a content block)
# ---------------------------------------------------------------------------

class WTextDelta(TypedDict):
    type: Literal["w_text_delta"]
    index: int
    text: str


class WThinkingDelta(TypedDict):
    """Extended-thinking / reasoning delta."""
    type: Literal["w_thinking_delta"]
    index: int
    thinking: str


class WSignatureDelta(TypedDict):
    """Thinking block signature delta (end of thinking block)."""
    type: Literal["w_signature_delta"]
    index: int
    signature: str


class WInputJsonDelta(TypedDict):
    """
    Partial JSON string for a tool_use input block.
    Accumulate `partial_json` strings and parse once you see
    the matching content_block_stop.
    """
    type: Literal["w_input_json_delta"]
    index: int
    partial_json: str
    
DeltaBlock = Union[WTextDelta, WThinkingDelta, WSignatureDelta, WInputJsonDelta]


@dataclass
class WContentDeltaBlock:
    """Represents a delta update during message streaming."""
    type: Literal["w_content_delta_block"]
    index: int
    delta: DeltaBlock


# ---------------------------------------------------------------------------
# Web-search / server-tool result
# ---------------------------------------------------------------------------

@dataclass
class WSearchResult:
    """A single search result returned by the web_search server tool."""
    url: str
    title: str
    snippet: str
    
    page_age: Optional[str] = None


@dataclass
class WWebSearchToolResult:
    """
    Emitted once after the web_search server tool finishes and
    returns its result block.  `results` is the parsed list of hits.
    """
    tool_use_id: str
    query: str
    results: List[WSearchResult] = field(default_factory=list)
    # raw content in case the response is not the expected shape
    raw_content: Optional[str] = None


# ---------------------------------------------------------------------------
# Error
# ---------------------------------------------------------------------------

@dataclass
class WError:
    """
    Wraps both API-level stream errors (e.g. overloaded_error) and
    internal processing exceptions so the client always gets a typed
    event instead of a silent stream close.
    """
    error_type: str          # e.g. "overloaded_error", "internal_error"
    message: str
    recoverable: bool = False


# ---------------------------------------------------------------------------
# Ping (keep-alive)
# ---------------------------------------------------------------------------

@dataclass
class WPing:
    pass


# ---------------------------------------------------------------------------
# Envelope
# ---------------------------------------------------------------------------

WSSEPayload = Union[
    WMessageStart,
    WMessageStop,
    WMessageDelta,
    WContentBlockStart,
    WContentBlockStop,
    WTextDelta,
    WThinkingDelta,
    WSignatureDelta,
    WInputJsonDelta,
    WWebSearchToolResult,
    WError,
    WPing,
]

WSSEEventType = Literal[
    "w_message_start",
    "w_message_stop",
    "w_message_delta",
    "w_text_content_block_start",
    "w_tool_use_content_block_start",
    "w_server_tool_use_content_block_start",
    "w_content_block_stop",
    "w_text_delta",
    "w_thinking_delta",
    "w_signature_delta",
    "w_input_json_delta",
    "w_web_search_tool_result",
    "w_error",
    "w_ping",
]


@dataclass
class WSSEEvent:
    type: WSSEEventType
    data: Optional[WSSEPayload] = None