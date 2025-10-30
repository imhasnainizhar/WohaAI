import { Request, Response } from "express";
import { webSearchTool } from "@tools/web_search.tool";
import { fetchPageContentTool } from "@tools/web_scraper.tool";

// Handle web search
export async function handleWebSearch(req: Request, res: Response) {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: "Missing 'q' query parameter" });
    }

    const results = await webSearchTool(query);
    res.json({ results });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

// Handle page scraping
export async function handleWebScrape(req: Request, res: Response) {
  try {
    const url = req.query.url as string;
    if (!url) {
      return res.status(400).json({ error: "Missing 'url' query parameter" });
    }

    const data = await fetchPageContentTool(url);
    res.json({ data });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
