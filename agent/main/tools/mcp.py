"""
agent/tools/mcp_tools.py
─────────────────────────
MCP tool integration built to langchain-mcp-adapters standards.

TWO LAYERS IN THIS FILE
────────────────────────
1. MCPRegistry  — production-ready async loader using MultiServerMCPClient.
                  Replace every REPLACE_ME_* value with your actual server config.
                  Supports stdio (local subprocess), http (streamable), and sse transports.

2. Mock tools   — synchronous @tool stubs that return realistic structured data.
                  The agent can actually use these during dev — they return proper responses.
                  Once MCPRegistry is wired, swap MOCK_MCP_TOOLS for registry.get_tools().

HOW TO MIGRATE (when you're ready)
────────────────────────────────────
Step 1 — Fill in MCPRegistry:
    Replace REPLACE_ME_* values with your actual server names, commands, and URLs.

Step 2 — Wire startup/shutdown in api/server.py lifespan:
    mcp_registry = MCPRegistry()
    tools = await mcp_registry.startup()

Step 3 — In agent/core.py _build_tools(), replace:
    from agent.tools.mcp_tools import MOCK_MCP_TOOLS
    tools.extend(MOCK_MCP_TOOLS)
  with:
    tools.extend(mcp_registry.get_tools())

Step 4 — Add to requirements.txt:
    langchain-mcp-adapters>=0.1.0
    mcp>=1.0.0

TRANSPORT QUICK REFERENCE
──────────────────────────
  stdio     — local subprocess (npm/python MCP server running as child process)
  http      — streamable HTTP  (modern standard, preferred for remote servers)
  sse       — Server-Sent Events (legacy remote, still widely used)
  websocket — WebSocket (real-time bidirectional, needs `websockets` package)
"""
from __future__ import annotations

import json
import logging
import random
from datetime import datetime, timedelta
from typing import Any, Optional

from langchain_core.tools import BaseTool, tool

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════════════════════
# SECTION 1 — MCPRegistry  (production async loader)
# ══════════════════════════════════════════════════════════════════════════════

class MCPRegistry:
    """
    Async manager for one or more MCP server connections.

    Uses langchain-mcp-adapters' MultiServerMCPClient under the hood.
    By default each tool call opens a fresh session (stateless), which is safe
    for concurrent FastAPI requests. For stateful servers, see the
    `persistent_session()` example below.

    Usage in api/server.py lifespan:
    ─────────────────────────────────
        mcp_registry = MCPRegistry()

        @asynccontextmanager
        async def lifespan(app: FastAPI):
            await mcp_registry.startup()
            yield
            await mcp_registry.shutdown()

        # In AgentRunner._build_tools():
        tools.extend(mcp_registry.get_tools())
    """

    def __init__(self) -> None:
        self._client: Any = None          # MultiServerMCPClient instance
        self._tools: list[BaseTool] = []
        self._ready: bool = False

    # ── Server config ─────────────────────────────────────────────────────────

    SERVER_CONFIG: dict[str, dict] = {

        # ── stdio server (local subprocess) ───────────────────────────────────
        # Spawns an MCP server as a child process via stdin/stdout.
        # Ideal for npm-distributed MCP servers or local Python servers.
        #
        # Replace:
        #   REPLACE_ME_STDIO_SERVER_NAME  — any unique key you want (used in logs)
        #   REPLACE_ME_COMMAND            — "npx", "python", "node", "uvx", etc.
        #   REPLACE_ME_ARGS               — list of arguments to the command
        #   REPLACE_ME_ENV_VAR            — any env var the server needs (optional)
        #
        "REPLACE_ME_STDIO_SERVER_NAME": {
            "transport": "stdio",
            "command": "REPLACE_ME_COMMAND",               # e.g. "npx"
            "args": [
                "REPLACE_ME_ARG_1",                        # e.g. "-y"
                "REPLACE_ME_ARG_2",                        # e.g. "@your-org/mcp-server"
            ],
            "env": {
                "REPLACE_ME_ENV_VAR": "REPLACE_ME_ENV_VALUE",   # e.g. API keys
            },
        },

        # ── http server (streamable HTTP — modern standard) ───────────────────
        # Connects to a remote MCP server over HTTP.
        # Use this for cloud-hosted or containerised MCP servers.
        #
        # Replace:
        #   REPLACE_ME_HTTP_SERVER_NAME — unique key
        #   REPLACE_ME_HTTP_URL         — full URL including path, e.g.
        #                                 "http://my-mcp-server:8000/mcp"
        #   REPLACE_ME_AUTH_TOKEN       — bearer token or API key (optional)
        #
        "REPLACE_ME_HTTP_SERVER_NAME": {
            "transport": "http",
            "url": "http://REPLACE_ME_HOST:REPLACE_ME_PORT/mcp",
            "headers": {
                "Authorization": "Bearer REPLACE_ME_AUTH_TOKEN",
            },
        },

        # ── sse server (Server-Sent Events — legacy but common) ───────────────
        # Use when the remote server only supports SSE (older standard).
        # MultiServerMCPClient auto-falls-back from http to sse if needed.
        #
        "REPLACE_ME_SSE_SERVER_NAME": {
            "transport": "sse",
            "url": "http://REPLACE_ME_HOST:REPLACE_ME_PORT/sse",
            "headers": {
                "Authorization": "Bearer REPLACE_ME_AUTH_TOKEN",
            },
        },

        # ── websocket server (real-time bidirectional) ────────────────────────
        # Requires `pip install websockets`.
        # Use for servers that push events back (streaming results, live updates).
        #
        # "REPLACE_ME_WS_SERVER_NAME": {
        #     "transport": "websocket",
        #     "url": "ws://REPLACE_ME_HOST:REPLACE_ME_PORT/ws",
        # },

    }

    # ── Lifecycle ─────────────────────────────────────────────────────────────

    async def startup(self) -> list[BaseTool]:
        """
        Connect to all configured MCP servers and load their tools.
        Call once from FastAPI lifespan before the first request.
        """
        try:
            from langchain_mcp_adapters.client import MultiServerMCPClient
        except ImportError as exc:
            raise RuntimeError(
                "langchain-mcp-adapters is not installed. "
                "Run: pip install langchain-mcp-adapters mcp"
            ) from exc

        # Filter out placeholder entries that haven't been replaced yet
        live_config = {
            name: cfg
            for name, cfg in self.SERVER_CONFIG.items()
            if "REPLACE_ME" not in name
        }

        if not live_config:
            logger.warning(
                "MCPRegistry: no real servers configured — "
                "all SERVER_CONFIG entries are still placeholders. "
                "Returning empty tool list."
            )
            self._ready = True
            return []

        logger.info("MCPRegistry: connecting to %d MCP server(s)…", len(live_config))
        self._client = MultiServerMCPClient(live_config)

        try:
            self._tools = await self._client.get_tools()
            logger.info(
                "MCPRegistry: loaded %d tool(s): %s",
                len(self._tools),
                [t.name for t in self._tools],
            )
        except Exception as exc:
            logger.error("MCPRegistry: failed to load tools — %s", exc, exc_info=True)
            self._tools = []

        self._ready = True
        return self._tools

    async def shutdown(self) -> None:
        """
        Clean up MCP connections. Call from FastAPI lifespan on shutdown.
        MultiServerMCPClient handles session cleanup internally.
        """
        self._client = None
        self._tools = []
        self._ready = False
        logger.info("MCPRegistry: shut down.")

    def get_tools(self) -> list[BaseTool]:
        """
        Return loaded tools. Call after startup().
        Returns empty list if startup() has not been called yet.
        """
        if not self._ready:
            logger.warning("MCPRegistry.get_tools() called before startup().")
        return self._tools

    # ── Stateful single-session pattern (for servers that need persistent state) ──

    async def persistent_session_example(self, server_name: str) -> list[BaseTool]:
        """
        Example: open a long-lived session to one server (for stateful servers).
        You own the lifecycle — close the session when done.

        Usage:
            async with client.session("REPLACE_ME_SERVER_NAME") as session:
                tools = await load_mcp_tools(session)
                # use tools within this block only
        """
        if not self._client:
            raise RuntimeError("Call startup() first.")

        from langchain_mcp_adapters.tools import load_mcp_tools

        async with self._client.session(server_name) as session:
            return await load_mcp_tools(session)


# Singleton — import this in core.py and server.py
mcp_registry = MCPRegistry()


# ══════════════════════════════════════════════════════════════════════════════
# SECTION 2 — Mock tools  (realistic stubs for dev / before servers are wired)
# ══════════════════════════════════════════════════════════════════════════════
#
# Design rules for mocks:
#  - Return realistic JSON-structured data so the agent can actually reason on it.
#  - Match the function signature you'll use in the real MCP tool.
#  - Each docstring starts with "[MCP: SERVER_NAME]" so it's clear what server
#    this will map to.
#  - Replace the entire function body once the real server is connected.
# ─────────────────────────────────────────────────────────────────────────────


# ── Mock 1: Data store query ──────────────────────────────────────────────────

@tool
def datastore_query(
    collection: str,
    filters: str = "{}",
    limit: int = 10,
    sort_by: str = "created_at",
) -> str:
    """
    [MCP: REPLACE_ME_STDIO_SERVER_NAME] Query records from the connected data store.

    Use this to look up records, find entries by field value, or list all items
    in a collection. Always pass filters as a JSON string.

    Args:
        collection: Name of the collection / table to query (e.g. "users", "orders").
        filters:    JSON string of field-value filters (e.g. '{"status": "active"}').
        limit:      Max records to return (default 10, max 100).
        sort_by:    Field to sort results by (default "created_at").

    Returns:
        JSON object with a "results" array and "meta" summary.
    """
    # ── REPLACE THIS BODY with your real MCP call ──────────────────────
    # Example real body:
    #   result = await mcp_client.call_tool("query", {"collection": collection, ...})
    #   return result.content[0].text
    # ───────────────────────────────────────────────────────────────────

    try:
        parsed_filters = json.loads(filters)
    except json.JSONDecodeError:
        return json.dumps({"error": f"Invalid JSON in filters: {filters}"})

    statuses = ["active", "pending", "completed", "archived"]
    records = [
        {
            "id": f"{collection[:3].upper()}-{1000 + i}",
            "name": f"Sample {collection.rstrip('s').title()} {i}",
            "status": statuses[i % len(statuses)],
            "created_at": (datetime.utcnow() - timedelta(days=i * 3)).isoformat() + "Z",
            "updated_at": (datetime.utcnow() - timedelta(hours=i * 5)).isoformat() + "Z",
            "meta": {"source": "mock", "filters_applied": parsed_filters},
        }
        for i in range(1, min(limit, 8) + 1)
    ]

    return json.dumps(
        {
            "collection": collection,
            "filters": parsed_filters,
            "sort_by": sort_by,
            "results": records,
            "meta": {"total": len(records), "limit": limit, "mock": True},
        },
        indent=2,
    )


# ── Mock 2: Data store write ──────────────────────────────────────────────────

@tool
def datastore_write(
    collection: str,
    record_id: Optional[str],
    data: str,
    operation: str = "upsert",
) -> str:
    """
    [MCP: REPLACE_ME_STDIO_SERVER_NAME] Write or update a record in the data store.

    Args:
        collection: Name of the collection / table.
        record_id:  ID of the record to update. Pass null / empty for new records.
        data:       JSON string of fields to set (e.g. '{"status": "active", "name": "Hani"}').
        operation:  "insert" | "update" | "upsert" (default: "upsert").

    Returns:
        JSON object confirming the write with the resulting record ID.
    """
    # ── REPLACE THIS BODY ────────────────────────────────────────────────
    try:
        payload = json.loads(data)
    except json.JSONDecodeError:
        return json.dumps({"error": f"Invalid JSON in data: {data}"})

    generated_id = record_id or f"{collection[:3].upper()}-{random.randint(2000, 9999)}"
    return json.dumps(
        {
            "ok": True,
            "operation": operation,
            "collection": collection,
            "id": generated_id,
            "fields_written": list(payload.keys()),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "mock": True,
        },
        indent=2,
    )


# ── Mock 3: Filesystem read ───────────────────────────────────────────────────

@tool
def filesystem_read(path: str) -> str:
    """
    [MCP: REPLACE_ME_HTTP_SERVER_NAME] Read the content of a file from the connected
    remote file system / object store. The path is relative to the server's root.

    Args:
        path: File path relative to server root (e.g. "docs/readme.md", "data/config.json").

    Returns:
        File content as a string, or a JSON error object if not found.
    """
    # ── REPLACE THIS BODY ────────────────────────────────────────────────
    ext = path.rsplit(".", 1)[-1].lower() if "." in path else "txt"
    mock_contents: dict[str, str] = {
        "md":   f"# {path}\n\nThis is mock markdown content for **{path}**.\n\n## Section 1\nSome body text here.\n",
        "json": json.dumps({"file": path, "mock": True, "version": "1.0.0", "items": [1, 2, 3]}, indent=2),
        "txt":  f"Mock plain text content of {path}.\nLine 2.\nLine 3.\n",
        "ts":   f"// {path}\nexport const config = {{\n  key: 'REPLACE_ME_VALUE',\n  enabled: true,\n}};\n",
        "py":   f"# {path}\ndef main():\n    print('Mock content for {path}')\n",
        "yaml": f"# {path}\nversion: '3'\nservices:\n  app:\n    image: REPLACE_ME_IMAGE\n",
    }
    content = mock_contents.get(ext, mock_contents["txt"])
    return json.dumps(
        {
            "path": path,
            "size_bytes": len(content),
            "content": content,
            "mime_type": f"text/{ext}",
            "mock": True,
        },
        indent=2,
    )


# ── Mock 4: Filesystem list ───────────────────────────────────────────────────

@tool
def filesystem_list(directory: str = "/", pattern: str = "*") -> str:
    """
    [MCP: REPLACE_ME_HTTP_SERVER_NAME] List files and directories at the given path
    on the connected remote file system.

    Args:
        directory: Directory path relative to server root (default: root "/").
        pattern:   Glob pattern to filter results (e.g. "*.ts", "*.md").

    Returns:
        JSON array of file/directory entries with name, type, and size.
    """
    # ── REPLACE THIS BODY ────────────────────────────────────────────────
    mock_entries = [
        {"name": "src",          "type": "directory", "size_bytes": None,   "modified": "2026-05-01T10:00:00Z"},
        {"name": "docs",         "type": "directory", "size_bytes": None,   "modified": "2026-04-15T08:30:00Z"},
        {"name": "README.md",    "type": "file",      "size_bytes": 2048,   "modified": "2026-05-20T14:22:00Z"},
        {"name": "package.json", "type": "file",      "size_bytes": 834,    "modified": "2026-05-18T09:11:00Z"},
        {"name": ".env.example", "type": "file",      "size_bytes": 312,    "modified": "2026-03-10T16:45:00Z"},
        {"name": "tsconfig.json","type": "file",      "size_bytes": 620,    "modified": "2026-04-02T11:00:00Z"},
    ]
    return json.dumps(
        {
            "directory": directory,
            "pattern": pattern,
            "entries": mock_entries,
            "count": len(mock_entries),
            "mock": True,
        },
        indent=2,
    )


# ── Mock 5: Task list ─────────────────────────────────────────────────────────

@tool
def task_list(
    project_id: str,
    status: str = "all",
    assignee: Optional[str] = None,
) -> str:
    """
    [MCP: REPLACE_ME_SSE_SERVER_NAME] List tasks from the connected project management
    tool (e.g. Linear, Jira, Asana, Notion).

    Args:
        project_id: ID or slug of the project to query.
        status:     Filter by status: "open" | "in_progress" | "done" | "all".
        assignee:   Filter by assignee name or ID. Omit to include all assignees.

    Returns:
        JSON array of task objects.
    """
    # ── REPLACE THIS BODY ────────────────────────────────────────────────
    all_tasks = [
        {
            "id": f"TASK-{100 + i}",
            "title": f"Mock task {i}: REPLACE_ME description",
            "status": ["open", "in_progress", "done"][i % 3],
            "priority": ["urgent", "high", "medium", "low"][i % 4],
            "assignee": f"user_{i % 3}",
            "project_id": project_id,
            "due_date": (datetime.utcnow() + timedelta(days=i * 7)).strftime("%Y-%m-%d"),
            "labels": ["feature", "bug", "chore"][i % 3 : i % 3 + 1],
            "created_at": (datetime.utcnow() - timedelta(days=i * 2)).isoformat() + "Z",
        }
        for i in range(1, 7)
    ]

    tasks = all_tasks
    if status != "all":
        tasks = [t for t in tasks if t["status"] == status]
    if assignee:
        tasks = [t for t in tasks if t["assignee"] == assignee]

    return json.dumps(
        {
            "project_id": project_id,
            "filters": {"status": status, "assignee": assignee},
            "tasks": tasks,
            "count": len(tasks),
            "mock": True,
        },
        indent=2,
    )


# ── Mock 6: Task create ───────────────────────────────────────────────────────

@tool
def task_create(
    project_id: str,
    title: str,
    description: str = "",
    priority: str = "medium",
    assignee: Optional[str] = None,
    due_date: Optional[str] = None,
) -> str:
    """
    [MCP: REPLACE_ME_SSE_SERVER_NAME] Create a new task in the connected project
    management tool.

    Args:
        project_id:  ID or slug of the target project.
        title:       Short title of the task.
        description: Full description (markdown supported).
        priority:    "urgent" | "high" | "medium" | "low" (default: "medium").
        assignee:    Assignee name or user ID (optional).
        due_date:    Due date in YYYY-MM-DD format (optional).

    Returns:
        JSON object with the created task's ID and a direct URL.
    """
    # ── REPLACE THIS BODY ────────────────────────────────────────────────
    new_id = f"TASK-{random.randint(500, 999)}"
    return json.dumps(
        {
            "ok": True,
            "id": new_id,
            "title": title,
            "status": "open",
            "priority": priority,
            "project_id": project_id,
            "assignee": assignee,
            "due_date": due_date,
            "url": f"https://REPLACE_ME_TOOL_URL/projects/{project_id}/tasks/{new_id}",
            "created_at": datetime.utcnow().isoformat() + "Z",
            "mock": True,
        },
        indent=2,
    )


# ── Mock 7: Send notification / message ──────────────────────────────────────

@tool
def send_notification(
    channel: str,
    message: str,
    level: str = "info",
    thread_id: Optional[str] = None,
) -> str:
    """
    [MCP: REPLACE_ME_HTTP_SERVER_NAME] Send a message or notification via the
    connected messaging platform (e.g. Slack, Teams, Discord, email).

    Args:
        channel:   Channel name, room ID, or email address to send to.
        message:   Message body (markdown supported in most platforms).
        level:     "info" | "success" | "warning" | "error" (affects formatting).
        thread_id: Thread or parent message ID to reply in-thread (optional).

    Returns:
        JSON confirmation with the message ID and timestamp.
    """
    # ── REPLACE THIS BODY ────────────────────────────────────────────────
    return json.dumps(
        {
            "ok": True,
            "message_id": f"msg_{random.randint(10000, 99999)}",
            "channel": channel,
            "level": level,
            "thread_id": thread_id,
            "preview": message[:120] + ("…" if len(message) > 120 else ""),
            "sent_at": datetime.utcnow().isoformat() + "Z",
            "mock": True,
        },
        indent=2,
    )


# ── Mock 8: Code search ───────────────────────────────────────────────────────

@tool
def code_search(
    query: str,
    repo: str = "REPLACE_ME_REPO",
    file_pattern: str = "*",
    max_results: int = 5,
) -> str:
    """
    [MCP: REPLACE_ME_STDIO_SERVER_NAME] Search the connected code repository for
    files or symbols matching a query. Useful for understanding the codebase,
    finding usages, or locating relevant files before making changes.

    Args:
        query:       Search term, symbol name, or code pattern.
        repo:        Repository name or path (default: primary configured repo).
        file_pattern: Glob filter for file types (e.g. "*.ts", "*.py").
        max_results: Maximum number of results to return (default 5).

    Returns:
        JSON array of match objects with file path, line number, and snippet.
    """
    # ── REPLACE THIS BODY ────────────────────────────────────────────────
    mock_files = [
        ("src/components/Button.tsx", "export function Button"),
        ("src/lib/api.ts",            "export async function fetchData"),
        ("src/hooks/useAuth.ts",      "export function useAuth"),
        ("src/app/layout.tsx",        "export default function RootLayout"),
        ("src/utils/helpers.ts",      "export function formatDate"),
    ]
    results = [
        {
            "file": path,
            "line": random.randint(1, 120),
            "snippet": f"{code}({query})",  # simulate the match context
            "repo": repo,
            "score": round(1.0 - (i * 0.12), 2),
        }
        for i, (path, code) in enumerate(mock_files[:max_results])
    ]
    return json.dumps(
        {
            "query": query,
            "repo": repo,
            "file_pattern": file_pattern,
            "results": results,
            "count": len(results),
            "mock": True,
        },
        indent=2,
    )


# ══════════════════════════════════════════════════════════════════════════════
# SECTION 3 — Public exports
# ══════════════════════════════════════════════════════════════════════════════

# All mock tools in one list — add to agent tools during dev:
#   from agent.tools.mcp_tools import MOCK_MCP_TOOLS
#   tools.extend(MOCK_MCP_TOOLS)
MOCK_MCP_TOOLS: list[BaseTool] = [
    datastore_query,
    datastore_write,
    filesystem_read,
    filesystem_list,
    task_list,
    task_create,
    send_notification,
    code_search,
]


def get_mcp_tools(use_mocks: bool = True) -> list[BaseTool]:
    """
    Single import point for core.py.

    Args:
        use_mocks: True  → return MOCK_MCP_TOOLS (dev / before servers wired).
                   False → return mcp_registry.get_tools() (production).

    In core.py _build_tools():
        from agent.tools.mcp_tools import get_mcp_tools
        tools.extend(get_mcp_tools(use_mocks=not settings.mcp_enabled))
    """
    if use_mocks:
        logger.debug("MCP: using mock tools (%d tools)", len(MOCK_MCP_TOOLS))
        return MOCK_MCP_TOOLS
    return mcp_registry.get_tools()