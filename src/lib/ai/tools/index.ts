import { codeTool } from "./code";
import { scrapeTool } from "./scrape";
import { searchTool } from "./search";
import { Content, OutputMessage, ToolDefinition } from "../types";

const tools: ToolDefinition[] = [searchTool, scrapeTool, codeTool];

function formatTool(input: ToolDefinition): any {
  return {
    name: input.name,
    description: input.description,
    input_schema: {
      type: "object",
      required: input.parameters.map((param) => param.name),
      properties: input.parameters.reduce((c, v) => {
        return {
          ...c,
          [v.name]: {
            type: v.type,
            description: v.description,
          },
        };
      }, {}),
    },
  };
}

export const formatTools = (tools: ToolDefinition[]) => tools.map(formatTool);

export async function fetchToolResponse(message: OutputMessage) {
  const toolUseContent = message.content.find(
    (content) => content.type === "tool_use",
  ) as Content;

  if (toolUseContent) {
    const { name, input, id } = toolUseContent;

    const tool = tools.find((tool) => tool.name === name);
    const toolReply: OutputMessage = {
      role: "user",
      content: [
        {
          type: "tool_result",
          tool_use_id: id,
          content: await tool?.execute(input as any),
        } as any,
      ],
    };
    return toolReply;
  }
  return null;
}

export const toolDefinitions = formatTools(tools);
