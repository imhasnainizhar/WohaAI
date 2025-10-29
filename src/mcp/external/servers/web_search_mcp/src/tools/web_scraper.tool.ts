/**
 * web_scraper.tool.ts
 *
 * Web Page Scraper tool for an MCP runtime.
 * - Fetches and extracts content from web pages
 * - Supports content extraction via Axios with configurable timeouts
 * - Provides utility functions for scraping and parsing HTML content
 * - Includes error handling and logging for robust web content retrieval
 *
 * USAGE:
 *  - Import and call scrapeWebPage(url, opts) with target URL
 *  - Configure timeout and retry logic as needed
 *  - Optional: Set UPSTREAM_RETRY_DELAY for retry behavior
 *
 * NOTE:
 *  - This tool uses Axios for HTTP requests with simple HTML parsing
 *  - Designed for lightweight content extraction without heavy dependencies
 *  - Consider rate limiting and robots.txt compliance in production use
 */

import { chromium } from "playwright"; // optional if JS rendering is needed

export interface PageResult {
  status: number;
  contentType?: string;
  body: string;
}

/**
 * OpenAI-style universal page fetcher
 * Handles static + dynamic (JS) pages without third-party services.
 */
export async function fetchPageContent(
  url: string,
  {
    timeoutMs = 10_000,
    maxRetries = 2,
    renderJS = false,
  }: { timeoutMs?: number; maxRetries?: number; renderJS?: boolean } = {}
): Promise<PageResult> {
  if (!/^https?:\/\//i.test(url)) throw new Error(`Invalid URL: ${url}`);

  let attempt = 0;
  let lastError: any;

  while (attempt <= maxRetries) {
    try {
      const result = renderJS
        ? await fetchRenderedPage(url, timeoutMs)
        : await fetchStaticPage(url, timeoutMs);

      if (result.body && result.body.length > 200) return result;
      throw new Error("Empty response");
    } catch (err: any) {
      lastError = err;
      if (
        err.name === "AbortError" ||
        err.code === "ECONNRESET" ||
        err.message.includes("timeout")
      ) {
        attempt++;
        await wait(300 * attempt);
        continue;
      }
      throw err;
    }
  }

  throw new Error(`Failed to fetch ${url}: ${lastError?.message ?? "Unknown"}`);
}

async function fetchStaticPage(url: string, timeoutMs: number): Promise<PageResult> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; OpenAI-Fetcher/1.0; +https://openai.com/)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const contentType = resp.headers.get("content-type") ?? undefined;

    if (
      contentType &&
      !contentType.includes("text") &&
      !contentType.includes("json") &&
      !contentType.includes("xml")
    ) {
      throw new Error(`Unsupported content type: ${contentType}`);
    }

    const body = await resp.text();
    return { status: resp.status, contentType, body: sanitizeHTML(body) };
  } finally {
    clearTimeout(id);
  }
}

/** Optional: JS-rendered fallback using Playwright */
async function fetchRenderedPage(url: string, timeoutMs: number): Promise<PageResult> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const resp = await page.goto(url, { timeout: timeoutMs, waitUntil: "domcontentloaded" });
    const body = await page.content();
    const contentType =
      resp?.headers()["content-type"] ?? "text/html; charset=utf-8";
    return { status: resp?.status() ?? 200, contentType, body: sanitizeHTML(body) };
  } finally {
    await browser.close();
  }
}

/** Sanitize HTML for embeddings/vectorization */
function sanitizeHTML(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Utility delay */
function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
