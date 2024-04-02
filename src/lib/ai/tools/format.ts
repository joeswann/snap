import { XMLBuilder, XMLParser } from "fast-xml-parser";

type ToolParameter = {
  name: string;
  type: "string" | "number" | "boolean";
  description: string;
};

export type ToolDefinition = {
  name: string;
  description: string;
  parameters: ToolParameter[];
  execute: (parameters: {
    [key: string]: string | number | boolean;
  }) => Promise<string>;
};

type ToolInvocation = {
  tool_name: string;
  parameters: { [key: string]: string | number | boolean };
};

const builder = new XMLBuilder({});
const parser = new XMLParser({});

const getToolDescription = (tool: ToolDefinition) => {
  const params = {
    tool_description: {
      tool_name: tool.name,
      description: tool.description,
      parameters: tool.parameters.map((param) => ({
        parameter: {
          name: param.name,
          type: param.type,
          description: param.description,
        },
      })),
    },
  };
  return params;
};

const getToolDescriptions = (tools: ToolDefinition[]) => {
  return {
    tools: tools.map(getToolDescription),
  };
};

const formatToolDescriptions = (tools: ToolDefinition[]) => {
  return builder.build(getToolDescriptions(tools));
};

export const systemPrompt = (tools: ToolDefinition[]) => {
  return `
In this environment you have access to a set of tools you can use to answer the user's question.

You may call them like this:
<function_calls>
<invoke>
<tool_name>$TOOL_NAME</tool_name>
<parameters>
<$PARAMETER_NAME>$PARAMETER_VALUE</$PARAMETER_NAME>
...
</parameters>
</invoke>
</function_calls>

Here are the tools available:
${formatToolDescriptions(tools)}
`;
};

const getFunctionCalls = (message: string) => {
  const functionCalls = message.match(/<invoke>([\s\S]*?)<\/invoke>/g);
  if (functionCalls) {
    return functionCalls.map(getFunctionCall);
  }
  return [];
};

const getFunctionCall = (message: string) => {
  return parser.parse(message) as ToolInvocation;
};

const getFunctionResults = async (tools: ToolDefinition[], message: string) => {
  const calls = getFunctionCalls(message);

  const resultPromises = calls.map(async (call) => {
    const { tool_name, parameters } = call;
    const tool = tools.find((tool) => tool.name === tool_name);
    if (tool) {
      try {
        const result = await tool.execute(parameters);
        return {
          result: {
            tool_name,
            stdout: result,
          },
        };
      } catch (e: any) {
        return {
          error: e.message,
        };
      }
    }
  });

  return { function_results: await Promise.all(resultPromises) };
};

export const functionResults = async (
  tools: ToolDefinition[],
  message: string,
) => {
  return builder.build(await getFunctionResults(tools, message)) as string;
};
