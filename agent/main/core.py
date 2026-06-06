# agent.py

from __future__ import annotations

from typing import Any, AsyncGenerator, Dict, Optional, List

import dataclasses
import json
from claude_agent_sdk import ClaudeAgentOptions, StreamEvent, query

from anthropic import APIConnectionError, APIStatusError, APITimeoutError

from observability.logger import logger

from types.event import (
    WMessageStart,
    WMessageStop,
    WSSEEvent,
    WTextDelta,
    WContentDeltaBlock,
    WInputJsonDelta,
    WSignatureDelta,
    WThinkingDelta,
    WMessageDelta,
    WContentBlockStop,
    TextBlock,
    ThinkingBlock,
    ToolUseBlock,
    WError,
    WSearchResult,
    WWebSearchToolResult,
)


def _serialise(obj: Any) -> Any:
    """Recursively convert dataclasses → dicts, leave primitives alone."""
    if dataclasses.is_dataclass(obj) and not isinstance(obj, type):
        return {k: _serialise(v) for k, v in dataclasses.asdict(obj).items()}
    if isinstance(obj, list):
        return [_serialise(i) for i in obj]
    if isinstance(obj, dict):
        return {k: _serialise(v) for k, v in obj.items()}
    return obj


def _sse(event: WSSEEvent) -> str:
    """
    Serialise a WSSEEvent to a valid SSE string.

    Format:
        event: <type>\\n
        data: <json>\\n
        \\n
    """
    payload = _serialise(event.data) if event.data is not None else {}
    return (
        f"event: {event.type}\n"
        f"data: {json.dumps(payload, ensure_ascii=False, separators=(',', ':'))}\n\n"
    )


def _error_sse(error_type: str, message: str, recoverable: bool = False) -> str:
    return _sse(
        WSSEEvent(
            type="w_error",
            data=WError(
                error_type=error_type, message=message, recoverable=recoverable
            ),
        )
    )


def _parse_web_search_result(
    tool_use_id: str,
    raw_content: List[Dict[str, Any]],
) -> WWebSearchToolResult:
    """
    The web_search server tool returns a tool_result content block whose
    content is a list of objects with type "web_search_result".

    Example shape (from Anthropic docs):
        [
          {
            "type": "web_search_result",
            "url": "https://...",
            "title": "...",
            "encrypted_content": "...",
            "page_age": "2024-01-01"
          }
        ]

    We extract the query from the first entry if present and build our
    typed result list.
    """
    results: List[WSearchResult] = []
    query = ""

    for item in raw_content:
        if not isinstance(item, dict):
            continue

        item_type = item.get("type", "")

        if item_type == "web_search_result":
            results.append(
                WSearchResult(
                    url=item.get("url", ""),
                    title=item.get("title", ""),
                    snippet=item.get("snippet") or item.get("encrypted_content", ""),
                    page_age=item.get("page_age"),
                )
            )
        elif item_type == "web_search_tool_result":
            # Outer wrapper when Anthropic bundles them
            inner = item.get("content", [])
            query = item.get("query", "")
            for hit in inner:
                if isinstance(hit, dict) and hit.get("type") == "web_search_result":
                    results.append(
                        WSearchResult(
                            url=hit.get("url", ""),
                            title=hit.get("title", ""),
                            snippet=hit.get("snippet")
                            or hit.get("encrypted_content", ""),
                            page_age=hit.get("page_age"),
                        )
                    )

    return WWebSearchToolResult(
        tool_use_id=tool_use_id,
        query=query,
        results=results,
    )


in_tool = False


class WoahAgent:
    def __init__(
        self,
        model_name: str,
        prompt: str,
        max_turns: int = 12,
        thinking_allowed: bool = True,
        thinking_budget_tokens: int = 10_000,
        max_budget_usd: float = 5.0,
        temperature: Optional[float] = None,
    ):
        self.model_name = model_name
        self.prompt = prompt
        self.max_turns = max_turns
        self.max_budget_usd = max_budget_usd
        self.temperature = (
            1.0
            if thinking_allowed
            else (temperature if temperature is not None else 1.0)
        )
        self.thinking_allowed = thinking_allowed
        self.thinking_budget_tokens = thinking_budget_tokens

    async def chat(self) -> AsyncGenerator[str, None]:
        """
        Yields raw SSE-formatted strings.  Handles all event types from
        the Anthropic streaming protocol and maps them to our W* types.
        """

        options = ClaudeAgentOptions(
            include_partial_messages=True,
            allowed_tools=[
                "WebSearch",
                "WebFetch",
                "AskUserQuestion",
                "Skill",
                "Monitor",
            ],
        )

        try:
            for message in query(prompt=self.prompt, options=options):
                if isinstance(message, StreamEvent):
                    event = message.event
                    etype = event.type

                    if etype == "message_start":
                        m = event.message
                        yield (
                            _sse(
                                WSSEEvent(
                                    type="w_message_start",
                                    data=WMessageStart(
                                        id=m.id,
                                        type=m.type,
                                        model=m.model,
                                        input_tokens=m.usage.input_tokens,
                                        output_tokens=m.usage.output_tokens,
                                        stop_reason=m.stop_reason,
                                        stop_sequence=m.stop_sequence,
                                        content=m.content,
                                    ),
                                )
                            )
                        )

                    if etype == "content_block_start":
                        b = event.content_block
                        content_type = b.type
                        if content_type == "text":
                            yield _sse(
                                WSSEEvent(
                                    type="w_content_block_start",
                                    data=TextBlock(
                                        type="text", index=event.index, text=""
                                    ),
                                )
                            )
                        elif content_type == "tool_use":
                            t = event.content_block
                            yield (
                                _sse(
                                    WSSEEvent(
                                        type="w_content_block_start",
                                        data=ToolUseBlock(
                                            type="tool_use",
                                            index=event.index,
                                            id=t.id,
                                            name=t.name,
                                            input=t.input,
                                        ),
                                    )
                                )
                            )

                        elif content_type == "thinking":
                            th = event.content_block
                            yield _sse(
                                WSSEEvent(
                                    type="w_content_block_start",
                                    data=ThinkingBlock(
                                        type="thinking",
                                        index=event.index,
                                        signature=th.signature,
                                    ),
                                )
                            )
                            
                        # tool_result (web search results come back here) ─
                        elif content_type == "web_search_tool_result":
                            # The Anthropic SDK surfaces completed server-tool results
                            # via tool_result events in some versions; handle defensively.
                            tool_use_id: str = event.tool_use_id
                            content = event.content
                            result = _parse_web_search_result(
                                tool_use_id=tool_use_id,
                                raw_content=content if isinstance(content, list) else [],
                            )
                            yield _sse(
                                WSSEEvent(
                                    type="w_web_search_tool_result",
                                    data=result,
                                )
                            )

                    elif etype == "content_block_delta":
                        delta = event.delta
                        dtype = delta.type

                        if dtype == "text_delta":
                            text = delta.text

                            yield _sse(
                                WSSEEvent(
                                    type="w_content_block_delta",
                                    data=WTextDelta(
                                        type="w_text_delta",
                                        index=event.index,
                                        text=text,
                                    ),
                                )
                            )

                        elif dtype == "input_json_delta":
                            tool_data = delta.partial_json

                            tool_name = tool_data.get("name", "")
                            tool_arguments = tool_data.get("arguments", {})

                            yield _sse(
                                WSSEEvent(
                                    type="W_content_block_delta",
                                    data=WInputJsonDelta(
                                        type="w_input_json_delta",
                                        index=event.index,
                                        name=tool_name,
                                        arguments=tool_arguments,
                                    ),
                                )
                            )

                        elif dtype == "signature_delta":
                            signature = delta.signature

                            yield _sse(
                                WSSEEvent(
                                    WContentDeltaBlock(
                                        type="w_content_block_delta",
                                        data=WSignatureDelta(
                                            type="w_signature_delta",
                                            index=event.index,
                                            signature=signature,
                                        ),
                                    )
                                )
                            )

                        elif dtype == "thinking_delta":
                            yield _sse(
                                WSSEEvent(
                                    type="w_content_block_delta",
                                    data=WThinkingDelta(
                                        type="w_thinking_delta",
                                        index=event.index,
                                        thinking=delta.thinking,
                                    ),
                                )
                            )

                    elif etype == "ping":
                        yield (
                            _sse(
                                WSSEEvent(
                                    type="w_ping",
                                )
                            )
                        )

                    elif etype == "content_block_stop":
                        yield _sse(
                            WSSEEvent(
                                type="w_content_block_stop",
                                data=WContentBlockStop(
                                    index=delta.index,
                                ),
                            )
                        )

                    elif etype == "message_delta":
                        delta = event.delta
                        usage = event.usage

                        yield _sse(
                            WSSEEvent(
                                type="w_message_delta",
                                data=WMessageDelta(
                                    stop_reason=delta.stop_reason,
                                    stop_sequence=delta.stop_sequence,
                                    usage=usage,
                                ),
                            )
                        )

                    elif etype == "message_stop":
                        yield _sse(
                            WSSEEvent(
                                type="w_message_stop",
                                data=WMessageStop(type="assistant"),
                            )
                        )

                    #  error (API-level stream error)
                    elif etype == "error":
                        err = event.error
                        err_type = err.type
                        err_msg = err.message
                        logger.error(
                            "API stream error: type=%s message=%s", err_type, err_msg
                        )
                        yield _error_sse(err_type, err_msg, recoverable=False)

                    else:
                        # Forward-compatible: unknown events are logged and ignored.
                        logger.debug("Unhandled stream event type: %s", etype)

        except APIStatusError as exc:
            logger.error(
                "Anthropic API status error: status=%s body=%s",
                exc.status_code,
                exc.body,
            )
            yield _error_sse(
                error_type=f"api_status_{exc.status_code}",
                message=str(exc.message),
                recoverable=exc.status_code in (429, 529),
            )

        except APIConnectionError as exc:
            logger.error("Anthropic API connection error: %s", exc)
            yield _error_sse("connection_error", str(exc), recoverable=True)

        except APITimeoutError as exc:
            logger.error("Anthropic API timeout: %s", exc)
            yield _error_sse("timeout_error", str(exc), recoverable=True)

        except Exception as exc:
            logger.exception("Unexpected error in WoahAgent.stream()")
            yield _error_sse("internal_server_error", str(exc), recoverable=False)
