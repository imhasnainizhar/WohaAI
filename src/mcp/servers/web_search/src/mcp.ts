// import { logger } from "@utils/logger";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod"
import { webScraper } from '@tools/web_scraper.tool';
import { webSearchTool } from '@tools/web_search.tool';
import { WebScraperParams } from "./custom_types/input";


export const server = new McpServer({
  name: 'browsing',
  version: "1.0.0"
});

server.registerTool("web_search",
  {
    title: "Web Search Tool",
    description: "To browse internet",
    inputSchema: z.object({
      prompt: z.string().describe("Browsing prompt"),
      requiredResults: z.number().describe("Results required by LLM").optional()
    }),
  },
  async ({ prompt, requiredResults }) => {
    const results = await webSearchTool({ prompt, requiredResults });
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(results, null, 2)
        }
      ]
    };
  }
)

server.registerTool("web_scraper",
  {
    title: "Webpage Scraper",
    description: "To scrape browsed pages to get data",
    inputSchema: z.object({
      url: z.string(),
      WebScraperOptions: z.object({
        timeoutMS: z.number(),
        maxRetries: z.number(),
        renderJS: z.boolean()
      })
    }),
  },
  async ({ url, WebScraperOptions }) => {
    try {
      const result = await webScraper({
        url,
        WebScraperOptions
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              error: true,
              message: error?.message || error?.toString() || "Unknown error occurred",
              url: url || "unknown"
            }, null, 2)
          }
        ]
      };
    }
  }
)


console.log("🧩 Booting Web MCP server...");
