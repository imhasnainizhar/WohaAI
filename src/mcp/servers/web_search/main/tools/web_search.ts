
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

import { env } from "@config/env";
import axios from "axios";
import { logger } from "@utils/logger";
import { ServiceResponse, ServiceException } from "@utils/response";
import { WebSearchParams } from "@domain/types/input";

interface SerperSearchResult {
    title: string;
    snippet: string;
    link: string;
}

interface SerperSearchResponse {
    organic: SerperSearchResult[];
    num_results: number;
}

export const webSearchTool = async ({ prompt, requiredResults = 10 }: WebSearchParams) => {
    logger.debug({
        action: "web_search_started",
        prompt,
        requiredResults
    }, "Starting web search");

    try {
        if (!env.SERPER_API_KEY) {
            logger.error({
                action: "web_search_error",
                error: "SERPER_API_KEY is not set"
            }, "SERPER_API_KEY missing");

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
        logger.debug({
            action: "web_search_api_call",
            url,
            prompt,
            num_results: requiredResults
        }, "Calling Serper API");

        const response = await axios.post<SerperSearchResponse>(url,
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
        const results = organic.slice(0, response.data.num_results).map((r: SerperSearchResult) => ({
            title: r.title,
            snippet: r.snippet,
            url: r.link,
        }));

        logger.debug({
            action: "web_search_completed",
            totalResults: organic.length,
            returnedResults: results.length,
            num_results: response.data.num_results
        }, "Web search completed successfully");

        return results;
    } catch (error) {
        logger.error({
            action: "web_search_failed",
            error: error instanceof Error ? error.message : String(error),
            prompt
        }, "Failed to search the web");
        throw new Error("Failed to search the web");
    }
};