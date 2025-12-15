import { getMCPTools } from "@tools/externals/MCPTools";

type ToolDefinition<I, O> = {
    name: string,
    description: string;
    input: I,
    output: O,
    execute: (input: I) => Promise<O>
}

export const ToolRegistry = {
    WebSearcherTool: {
        name: "WebSearcherTool",
        description: "Search the web for latest URLs",
        input: {} as { query: string },
        output: {} as { urls: string[] },
        execute: async (input) => {
            const tool = (await getMCPTools()).find(t => t.name === "WebSearcherTool");
            if (!tool) throw new Error("MCP tool 'web_search' not found");
            const result = await tool.invoke(input);  // make sure invoke returns a Promise
            return result;
        }
    },

    WebScraperTool: {
        name: "WebScraperTool",
        description: "Scrape HTML from a URL",
        input: {} as { url: string },
        output: {} as { webContent: string },
        execute: async (input) => {
            const tool = (await getMCPTools()).find(t => t.name === "WebScraperTool");
            if (!tool) throw new Error("MCP tool 'web_scraper' not found");
            const result = await tool.invoke(input);
            return result;
        }
    }
} satisfies Record<string, ToolDefinition<any, any>>;

export type ToolName = keyof typeof ToolRegistry;

export type ToolInput<N extends ToolName> = typeof ToolRegistry[N]["input"];

export type ToolOutput<N extends ToolName> = typeof ToolRegistry[N]["output"];
