import { InputMessage, OutputMessage, ToolDefinition } from "./types";
export const systemPrompt = () => `
  In this environment you have access to a set of tools you can use to answer the user's question.
  Please note, when you get results from a tool, please summarise the answer in plain text.
`;

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

export const formatMessage = (message: OutputMessage) => {
  return {
    role: message.role,
    content: message.content,
  };
};
