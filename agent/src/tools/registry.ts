import { getMCPTools } from "@/tools/externals/mcp.js";

type ToolDefinition<I, O> = {
    name: string,
    description: string;
    input: I,
    output: O,
    execute: (input: I) => Promise<O>
}

//-------------------------//
// These types will be shared through global shared directory
export type PageResult = {
    status: number,
    contentType: string,
    body: string
}

export type WebScraperOptions = {
    timeoutMS: number,
    maxRetries: number,
    renderJS: boolean,
    partialSelector: string
}

export type WebScraperParams = {
    url: string,
    WebScraperOptions: WebScraperOptions
}
//-------------------------//


export const ToolRegistry = {
    WebSearcherTool: {
        name: "WebSearcherTool",
        description: "Search the web for latest URLs",
        input: {} as { prompt: string; requiredResults?: number },
        output: {} as any,  // TODO: add better output type
        execute: async (input) => {
            const tool = (await getMCPTools()).find(t => t.name === "WebSearcherTool");
            if (!tool) throw new Error("MCP tool 'WebSearcherTool' not found");
            const result = await tool.invoke(input);  // make sure invoke returns a Promise
            return result;
        }
    },

    WebScraperTool: {
        name: "WebScraperTool",
        description: "Scrape HTML from a URL",
        input: {} as WebScraperParams,
        output: {} as PageResult,
        execute: async (input) => {
            const tool = (await getMCPTools()).find(t => t.name === "WebScraperTool");
            if (!tool) throw new Error("MCP tool 'WebScraperTool' not found");
            const result = await tool.invoke(input);
            return result;
        }
    }
} satisfies Record<string, ToolDefinition<any, any>>;

export type ToolName = keyof typeof ToolRegistry;

export type ToolInput<N extends ToolName> = typeof ToolRegistry[N]["input"];

export type ToolOutput<N extends ToolName> = typeof ToolRegistry[N]["output"];
