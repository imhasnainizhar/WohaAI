import { mcpServerLogger as logger } from "@packages/observability";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import z from "zod"
import { webScraper } from '@/tools/web-scraper';
import { webSearchTool } from '@/tools/web-search';


export const server = new McpServer({
  name: 'WebToolsMCP',
  version: "1.0.0"
});

server.registerTool("WebSearcherTool",
  {
    title: "WebSearcher MCP Tool",
    description: "To browse internet",
    inputSchema: z.object({
      prompt: z.string().describe("Browsing prompt"),
      requiredResults: z.number().describe("Results required by LLM").optional()
    }),
  },
  async ({ prompt, requiredResults }) => {
    logger.debug({
      tool: "WebSearcherTool",
      action: "tool_invoked",
      params: { prompt, requiredResults }
    }, "WebSearcherTool invoked");
    
    const results = await webSearchTool({ prompt, requiredResults });
    
    logger.debug({
      tool: "WebSearcherTool",
      action: "tool_completed",
      resultsCount: Array.isArray(results) ? results.length : 0
    }, "WebSearcherTool completed successfully");
    
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

server.registerTool("WebScraperTool",
  {
    title: "Webpage Scraper MCP Tool",
    description: "To scrape browsed pages to get data",
    inputSchema: z.object({
      url: z.string().describe("URL of page to be scrapped for llm"),
      WebScraperOptions: z.object({
        timeoutMS: z.number().optional(),
        maxRetries: z.number(),
        renderJS: z.boolean(),
        partialSelector: z.string().optional()
      }).describe("Options for web scraper tool. Options: timeoutMS, maxRetries & renderJS.")
    }),
  },
  async ({ url, WebScraperOptions }) => {
    logger.debug({
      tool: "WebScraperTool",
      action: "tool_invoked",
      params: { 
        url, 
        renderJS: WebScraperOptions?.renderJS,
        maxRetries: WebScraperOptions?.maxRetries,
        timeoutMS: WebScraperOptions?.timeoutMS,
        partialSelector: WebScraperOptions?.partialSelector
      }
    }, "WebScraperTool invoked");
    
    try {
      const result = await webScraper({
        url,
        WebScraperOptions
      });

      logger.debug({
        tool: "WebScraperTool",
        action: "tool_completed",
        url,
        status: result.status,
        contentType: result.contentType,
        bodyLength: result.body?.length || 0,
        renderJS: WebScraperOptions?.renderJS,
        partialSelector: WebScraperOptions?.partialSelector
      }, "WebScraperTool completed successfully");

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error: any) {
      logger.error({
        tool: "WebScraperTool",
        action: "tool_error",
        url,
        error: error?.message || error?.toString(),
        renderJS: WebScraperOptions?.renderJS,
        partialSelector: WebScraperOptions?.partialSelector
      }, "WebScraperTool failed");
      
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