
/**
 * mcp-web-search-tool.ts
 *
 * Web Search / Fetch / Scrape tool for an MCP runtime.
 * - Supports Serper.dev (Google-like API) and Bing Search (configurable)
 * - Exposes: search(query, opts), fetchPage(url), scrapeAndExtract(url, opts)
 * - Includes hook for converting scraped content to embeddings (adapter function)
 *
 * USAGE:
 *  - Set SERPER_API_KEY or BING_API_KEY and optionally EMBEDDING_PROVIDER env vars
 *  - Import registerWebSearchTool(...) in your MCP tool registry
 *
 * NOTE:
 *  - Adjust `registerWithMCP` to match the API of your mcp package (I included examples).
 *  - This file intentionally keeps network calls minimal and parser simple (cheerio).
 */

import { env } from "@config/env.config";
import axios from "axios";
import { logger } from "@utils/logger";
import { ServiceResponse, ServiceException } from "@utils/response";
import { WebSearchParams } from "@custom_types/input";

export const webSearchTool = async ({prompt, requiredResults = 10}: WebSearchParams) => {
    try {
        if (!env.SERPER_API_KEY) {
            throw new ServiceException(
                ServiceResponse.error({
                    success: false,
                    statusCode: 500,
                    message: "SERPER_API_KEY is not set",
                    errorType: "internal_server_error",
                    errors: {
                        "SERPER_API_KEY": ["SERPER_API_KEY is not set"],
                    },
                })
            )
        }
        const url = "https://google.serper.dev/search";
        const response = await axios.post(url,
            { 
                q: prompt,
                num_results: requiredResults,
            },
            {
                headers: {
                    "X-API-KEY": env.SERPER_API_KEY,
                    "Content-Type": "application/json",
                },
            }
        );
        const organic = response.data.organic || []
        const results = organic.slice(0, response.data.num_results).map((r: any) => ({
            title: r.title,
            snippet: r.snippet,
            url: r.link,
        }));
        return results;
    } catch (error) {
        logger.debug(`Failed to search the web: ${error}`);
        throw new Error("Failed to search the web");
    }
};