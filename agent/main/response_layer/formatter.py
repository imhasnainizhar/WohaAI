"""
agent/response_layer/formatter.py
──────────────────────────────────
The ResponseFormatLayer is the contract between this agent and your frontend renderer.

How it works
────────────
1. You already have a markdown renderer on your frontend.
2. You want the agent to output markdown that YOUR renderer can handle correctly.
3. Pass your format spec as a string in the API request field `markdown_format`.
4. If you don't pass one, a sensible default is used.

The layer injects the format spec into the system prompt so every agent response
respects your rendering constraints without the API caller needing to know how
the system prompt is constructed.

Example usage in your API call:
    {
      "message": "Explain async/await",
      "style": "learning",
      "markdown_format": "Use only ## and ### headings. Wrap all code in ```language blocks. No HTML tags. Keep responses under 600 words."
    }
"""

DEFAULT_MARKDOWN_FORMAT = """
## Output Formatting Rules
You MUST format every response in valid Markdown. Follow these rules precisely:

**Headings**
- Use `##` for top-level sections, `###` for sub-sections.
- Never use `#` (H1) — the frontend reserves that for page titles.
- Never nest beyond `####`.

**Code**
- Always use fenced code blocks with an explicit language tag:
  ` ```python `, ` ```typescript `, ` ```bash `, ` ```json `, etc.
- Inline code uses single backticks: `variable_name`.
- Never embed code in plain text without a code block or backticks.

**Lists**
- Unordered: `-` (dash + space). Do not mix `*` and `-`.
- Ordered: `1.` for sequential steps.
- Do not nest lists more than 2 levels deep.

**Emphasis**
- **Bold** for key terms, important warnings, or critical facts.
- *Italic* for technical terms on first introduction or light emphasis.
- Do not bold entire sentences.

**Callouts**
- Prefix important notes with `> **Note:**`
- Prefix warnings with `> **Warning:**`
- Prefix tips with `> **Tip:**`

**Tables**
- Use Markdown tables for comparisons or structured reference data.
- Always include a header row and alignment row (`| --- |`).

**Links**
- Format as `[display text](url)` — never paste raw URLs.

**Length**
- For short factual questions: answer directly without unnecessary headers.
- For explanations / guides: structure with headings.
- Never pad responses. Say what needs to be said and stop.
"""


class ResponseFormatLayer:
    """
    Holds the markdown format spec and injects it into any system prompt.

    Args:
        user_format_spec: A custom format spec string from the API caller.
                          If None or empty, DEFAULT_MARKDOWN_FORMAT is used.
    """

    def __init__(self, user_format_spec: str | None = None):
        self._spec = user_format_spec.strip() if user_format_spec else DEFAULT_MARKDOWN_FORMAT

    def build_format_instructions(self) -> str:
        """Return the format instruction block ready for system prompt injection."""
        return self._spec

    def inject_into(self, system_prompt: str) -> str:
        """
        Append the format instructions to an existing system prompt string.
        Returns the combined prompt.
        """
        return f"{system_prompt.rstrip()}\n\n{self._spec}"

    @staticmethod
    def default_spec() -> str:
        """Expose the default spec so callers can inspect or extend it."""
        return DEFAULT_MARKDOWN_FORMAT
