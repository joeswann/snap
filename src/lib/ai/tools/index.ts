import { ToolDefinition } from "../format";
import { codeTool } from "./code";
import { scrapeTool } from "./scrape";
import { searchTool } from "./search";

export const tools: ToolDefinition[] = [searchTool, scrapeTool, codeTool];
