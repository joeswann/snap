import { ToolDefinition } from "../format";
import { scrapeTool } from "./scrape";
import { searchTool } from "./search";

export const tools: ToolDefinition[] = [searchTool, scrapeTool];
