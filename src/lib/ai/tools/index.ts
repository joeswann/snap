import Anthropic from "@anthropic-ai/sdk";
import { formatTools } from "../format";
import { codeTool } from "./code";
import { scrapeTool } from "./scrape";
import { searchTool } from "./search";
import { ToolDefinition } from "../types";

const tools: ToolDefinition[] = [searchTool, scrapeTool, codeTool];

export const fetchToolResponse = async (name: string, params: any) => {
  const tool = tools.find((tool) => tool.name === name);

  const response = await tool?.execute(params);

  return response;
};

export const toolDefinitions = formatTools(tools);
