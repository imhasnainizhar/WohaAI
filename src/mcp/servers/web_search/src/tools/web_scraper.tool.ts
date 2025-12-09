/**
 * web_scraper.tool.ts
 *
 * Web Page Scraper tool for an MCP runtime.
 * - Fetches and extracts content from web pages
 * - Supports content extraction via native fetch API with configurable timeouts
 * - Provides utility functions for scraping and parsing HTML content
 * - Includes error handling and retry logic for robust web content retrieval
 *
 * USAGE:
 *  - Import and call webScraper({ url, WebScraperOptions }) with target URL
 *  - Configure timeout and retry logic as needed
 *  - Set renderJS: true for JavaScript-rendered pages (requires Playwright)
 *
 * NOTE:
 *  - This tool uses native fetch API for HTTP requests with simple HTML parsing
 *  - Designed for lightweight content extraction without heavy dependencies
 *  - Playwright is only loaded when renderJS is true
 *  - Consider rate limiting and robots.txt compliance in production use
 */

import { WebScraperParams } from "@custom_types/input";

export interface PageResult {
  status: number;
  contentType?: string;
  body: string;
}

/**
 * OpenAI-style universal page fetcher
 * Handles static + dynamic (JS) pages without third-party services.
 */
export async function webScraper(
  {
    url,
    WebScraperOptions
  }: WebScraperParams): Promise<PageResult> {
  if (!/^https?:\/\//i.test(url)) throw new Error(`Invalid URL: ${url}`);
  const { maxRetries, timeoutMS, renderJS } = WebScraperOptions;

  let attempt = 0;
  let lastError: any;

  while (attempt <= maxRetries) {
    try {
      const result = renderJS
        ? await fetchRenderedPage(url, timeoutMS)
        : await fetchStaticPage(url, timeoutMS);

      // Check for valid content (reduced threshold for smaller pages)
      if (result.body && result.body.length > 50) return result;
      throw new Error("Empty or insufficient response");
    } catch (err: any) {
      lastError = err;
      const shouldRetry = 
        err.name === "AbortError" ||
        err.code === "ECONNRESET" ||
        err.code === "ETIMEDOUT" ||
        err.message?.includes("timeout") ||
        err.message?.includes("Empty") ||
        (err.status && err.status >= 500 && err.status < 600);

      if (shouldRetry && attempt < maxRetries) {
        attempt++;
        await wait(300 * attempt);
        continue;
      }
      throw err;
    }
  }

  throw new Error(`Failed to fetch ${url} after ${maxRetries + 1} attempts: ${lastError?.message ?? "Unknown error"}`);
}

async function fetchStaticPage(url: string, timeoutMS: number): Promise<PageResult> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMS);

  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    // Check HTTP status before processing
    if (!resp.ok && resp.status >= 500) {
      const error: any = new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      error.status = resp.status;
      throw error;
    }

    const contentType = resp.headers.get("content-type") ?? undefined;

    // More lenient content type check
    if (
      contentType &&
      !contentType.includes("text") &&
      !contentType.includes("json") &&
      !contentType.includes("xml") &&
      !contentType.includes("html")
    ) {
      throw new Error(`Unsupported content type: ${contentType}`);
    }

    const body = await resp.text();
    
    // Return error status but still provide body for 4xx errors (client might want to see it)
    return { 
      status: resp.status, 
      contentType, 
      body: sanitizeHTML(body) 
    };
  } catch (err: any) {
    // Re-throw abort errors and network errors
    if (err.name === "AbortError" || err.code === "ECONNRESET" || err.code === "ETIMEDOUT") {
      throw err;
    }
    // Re-throw HTTP errors
    if (err.status) {
      throw err;
    }
    // Wrap other errors
    throw new Error(`Failed to fetch ${url}: ${err.message ?? "Unknown error"}`);
  } finally {
    clearTimeout(id);
  }
}

/** Optional: JS-rendered fallback using Playwright */
async function fetchRenderedPage(url: string, timeoutMS: number): Promise<PageResult> {
  // Dynamic import to avoid loading Playwright when not needed
  let chromium: any;
  try {
    const playwright = await import("playwright");
    chromium = playwright.chromium;
  } catch (err) {
    throw new Error(
      "Playwright is required for JavaScript rendering. Install it with: npm install playwright && npx playwright install"
    );
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const resp = await page.goto(url, { 
      timeout: timeoutMS, 
      waitUntil: "domcontentloaded" 
    });
    
    if (!resp || !resp.ok()) {
      const status = resp?.status() ?? 500;
      if (status >= 500) {
        const error: any = new Error(`HTTP ${status}: ${resp?.statusText() ?? "Server Error"}`);
        error.status = status;
        throw error;
      }
    }

    const body = await page.content();
    const contentType =
      resp?.headers()["content-type"] ?? "text/html; charset=utf-8";
    
    return { 
      status: resp?.status() ?? 200, 
      contentType, 
      body: sanitizeHTML(body) 
    };
  } catch (err: any) {
    // Re-throw HTTP errors
    if (err.status) {
      throw err;
    }
    // Re-throw timeout errors
    if (err.message?.includes("timeout") || err.name === "TimeoutError") {
      throw new Error(`Timeout after ${timeoutMS}ms: ${err.message}`);
    }
    throw err;
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
