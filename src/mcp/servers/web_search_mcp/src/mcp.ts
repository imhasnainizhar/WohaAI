import { webSearchTool } from "@tools/web_search.tool";
import { fetchPageContentTool } from "@tools/web_scraper.tool";

export const mcpTools = {
  service: "web-access",
  tools: [webSearchTool, fetchPageContentTool],
};

export function getToolByName(name: string) {
  return mcpTools.tools.find((tool) => tool.name === name);
}
