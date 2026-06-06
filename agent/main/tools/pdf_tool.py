"""
agent/tools/pdf_tool.py
────────────────────────
Custom LangChain tool for reading PDF files using PyMuPDF (fitz).

Why not OpenAI's file_search?
─────────────────────────────
OpenAI's file_search is part of the Responses API / Assistants API and requires
uploading files to OpenAI's servers first. For a self-contained agent that reads
local PDFs on demand, PyMuPDF is the right choice — no upload, no storage, fast.
"""
from langchain_core.tools import tool
import fitz

@tool
def read_pdf(file_path: str) -> str:
    """
    Read and extract all text content from a PDF file on disk.

    Use this tool whenever the user provides a path to a PDF file they want
    analysed, summarised, or queried. The tool returns the raw text extracted
    from every page, labelled by page number.

    Args:
        file_path: Absolute or relative path to the .pdf file.

    Returns:
        Extracted text grouped by page, or an error message if the file
        cannot be opened.
    """

    try:
        doc = fitz.open(file_path)
    except Exception as exc:
        return f"ERROR: Could not open file '{file_path}': {exc}"

    pages: list[str] = []
    for page_num, page in enumerate(doc, start=1):
        text = page.get_text().strip()
        if text:
            pages.append(f"### Page {page_num}\n{text}")

    doc.close()

    if not pages:
        return "No readable text found in the PDF (it may be image-only / scanned)."

    header = f"PDF: {file_path}  |  {len(pages)} pages with text\n\n"
    return header + "\n\n---\n\n".join(pages)
