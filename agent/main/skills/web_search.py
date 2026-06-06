"""
agent/tools/web_search.py
─────────────────────────
Wraps Tavily as the agent's web search capability.

Why Tavily and not OpenAI's built-in web_search?
─────────────────────────────────────────────────
OpenAI's built-in tools (web_search, file_search) are part of the Responses API,
which is a separate primitive from Chat Completions. LangChain's ChatOpenAI sits
on top of Chat Completions, so OpenAI's built-in tools do NOT wire into LangChain's
tool-calling loop. Tavily is LangChain's recommended partner for web search and
integrates natively with the ReAct agent tool system.
"""
import os
from typing import Optional

from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.tools import BaseTool


def get_web_search_tool(max_results: int = 5) -> Optional[BaseTool]:
    """
    Returns a configured TavilySearchResults tool, or None if no API key is set.
    Returning None allows callers to silently skip web search without crashing.
    """
    api_key = os.environ.get("TAVILY_API_KEY", "")
    if not api_key:
        return None

    return TavilySearchResults(
        max_results=max_results,
        name="web_search",
        description=(
            "Search the web for current, real-world information. "
            "Use this when you need facts that may have changed recently, "
            "documentation, news, or anything outside your training data. "
            "Input should be a clear, specific search query string."
        ),
    )
