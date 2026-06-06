"""
agent/skills/pdf_skill.py
─────────────────────────
Activating this skill gives the agent:
  - The read_pdf tool (PyMuPDF-backed, no API key needed).
  - Detailed instructions on how to handle PDF analysis tasks.
"""
from agent.skills.base import Skill
from agent.tools.pdf_tool import read_pdf


PDF_SKILL = Skill(
    name="pdf",
    description="Read and analyse local PDF files using PyMuPDF.",
    tools=[read_pdf],
    system_prompt_addition="""
## PDF Analysis Skill
You have access to the `read_pdf` tool which can extract text from any PDF file on disk.

Guidelines for PDF tasks:
- When the user mentions a file path ending in `.pdf`, call `read_pdf` with that exact path.
- Do NOT guess or invent file paths — only use paths the user explicitly provides.
- After extraction, structure your analysis clearly:
  - Start with a **Summary** (what the document is about, key topics).
  - Follow with **Key Findings** as a bullet list.
  - If the user asks a specific question, answer it with page-level citations
    (e.g. "According to Page 3, …").
- If the PDF appears to be scanned / image-only, inform the user that OCR
  is required and suggest tools like Adobe Acrobat or Tesseract.
- Never truncate extracted content silently — if very long, summarise by section.
""",
)
