import { Anthropic } from "@anthropic-ai/sdk";
import { Message, fetchMessages } from "./fetch";
export type Messages = Message[];
type ToolParameter = {
  name: string;
  type: string;
  description: string;
};

export type Tool = {
  name: string;
  useTool: (...args: any[]) => any;
};

export type ToolDescription = {
  name: string;
  description: string;
  parameters: ToolParameter[];
};

function constructToolUseSystemPrompt(tools: ToolDescription[]): string {
  const toolDescriptions = tools.map(constructToolDescription).join("\n");
  return `In this environment you have access to a set of tools you can use to answer the user's question.\n\nYou may call them like this:\n<function_calls>\n<invoke>\n<tool_name>$TOOL_NAME</tool_name>\n<parameters>\n<$PARAMETER_NAME>$PARAMETER_VALUE</$PARAMETER_NAME>\n...\n</parameters>\n</invoke>\n</function_calls>\n\nHere are the tools available:\n<tools>\n${toolDescriptions}\n</tools>`;
}

function constructUseToolsPrompt(
  prompt: string,
  tools: ToolDescription[],
  lastMessageRole: string,
): string {
  const toolUseSystemPrompt = constructToolUseSystemPrompt(tools);
  if (lastMessageRole === "user") {
    return `${toolUseSystemPrompt}${prompt}\n\nAssistant:`;
  } else {
    return `${toolUseSystemPrompt}${prompt}`;
  }
}
function formatParameters(parameters: ToolParameter[]): string {
  return parameters
    .map(
      (param) =>
        `<parameter>\n<name>${param.name}</name>\n<type>${param.type}</type>\n<description>${param.description}</description>\n</parameter>`,
    )
    .join("\n");
}
function constructToolDescription(tool: ToolDescription): string {
  return `<tool_description>\n<tool_name>${tool.name}</tool_name>\n<description>\n${tool.description}\n</description>\n<parameters>\n${formatParameters(tool.parameters)}\n</parameters>\n</tool_description>`;
}

function constructSuccessfulFunctionRunInjectionPrompt(
  invokeResultsResults: { toolName: string; toolResult: any }[],
): string {
  const results = invokeResultsResults
    .map(
      (res) =>
        `<result>\n<tool_name>${res.toolName}</tool_name>\n<stdout>\n${res.toolResult}\n</stdout>\n</result>`,
    )
    .join("\n");
  return `<function_results>\n${results}\n</function_results>`;
}

function constructErrorFunctionRunInjectionPrompt(
  invokeResultsErrorMessage: string,
): string {
  return `<function_results>\n<system>\n${invokeResultsErrorMessage}\n</system>\n</function_results>`;
}

function constructPromptFromMessages(messages: Message[]): string {
  return messages
    .map((message) => {
      const prefix =
        message.role === "user" ? "\n\nHuman: " : "\n\nAssistant: ";
      return `${prefix}${message.content}`;
    })
    .join("");
}

class ToolUser {
  private tools: Tool[];
  private maxRetries: number = 3;
  private currentNumRetries: number = 0;

  constructor(tools: Tool[], maxRetries: number = 3) {
    this.tools = tools;
    this.maxRetries = maxRetries;
  }

  async useTools(
    messages: Message[],
    toolDescriptions: ToolDescription[],
    verbose: number = 1,
    executionMode: "manual" | "automatic" = "manual",
  ): Promise<
    | Message
    | { status: string; errorMessage: string }
    | { role: string; content: string; toolInputs: { toolName: string }[] }
  > {
    if (executionMode !== "manual" && executionMode !== "automatic") {
      throw new Error(
        `Error: execution_mode must be either 'manual' or 'automatic'. Provided Value: ${executionMode}`,
      );
    }

    const prompt = constructPromptFromMessages(messages);
    let constructedPrompt = constructUseToolsPrompt(
      prompt,
      toolDescriptions,
      messages[messages.length - 1].role,
    );

    if (verbose === 1) {
      console.log("----------CURRENT PROMPT----------");
      console.log(constructedPrompt);
    }
    if (verbose === 0.5) {
      console.log(
        "----------INPUT (TO SEE SYSTEM PROMPT WITH TOOLS SET verbose=1)----------",
      );
      console.log(prompt);
    }

    const response = await fetchMessages({
      messages: [
        ...messages,
        { role: "assistant", content: constructedPrompt },
      ],
    });

    const formattedCompletion = response[response.length - 1].content;

    if (verbose === 1) {
      console.log("----------COMPLETION----------");
      console.log(formattedCompletion);
    }
    if (verbose === 0.5) {
      console.log("----------CLAUDE GENERATION----------");
      console.log(formattedCompletion);
    }

    if (executionMode === "manual") {
      const parsedFunctionCalls = this.parseFunctionCalls(
        formattedCompletion,
        false,
      );
      if (parsedFunctionCalls.status === "DONE") {
        return { role: "assistant", content: formattedCompletion };
      } else if (parsedFunctionCalls.status === "ERROR") {
        return {
          status: "ERROR",
          errorMessage: `${parsedFunctionCalls.message}`,
        };
      } else if (parsedFunctionCalls.status === "SUCCESS") {
        return {
          role: "tool_inputs",
          content: `${parsedFunctionCalls.content}`,
          toolInputs: parsedFunctionCalls.invokeResults || [],
        };
      } else {
        throw new Error("Unrecognized status in parsed_function_calls.");
      }
    }

    while (true) {
      const parsedFunctionCalls = this.parseFunctionCalls(
        formattedCompletion,
        true,
      );
      if (parsedFunctionCalls.status === "DONE") {
        return { role: "assistant", content: formattedCompletion };
      }

      const claudeResponse = this.constructNextInjection(parsedFunctionCalls);
      if (verbose === 0.5) {
        console.log(
          "----------RESPONSE TO FUNCTION CALLS (fed back into Claude)----------",
        );
        console.log(claudeResponse);
      }

      constructedPrompt = `${constructedPrompt}${formattedCompletion}\n\n${claudeResponse}`;

      if (verbose === 1) {
        console.log("----------CURRENT PROMPT----------");
        console.log(constructedPrompt);
      }

      const nextResponse = await fetchMessages({
        system: constructToolUseSystemPrompt(toolDescriptions),
        messages: [
          ...messages,
          { role: "assistant", content: constructedPrompt },
        ],
      });

      console.log({ nextResponse });

      const nextFormattedCompletion =
        nextResponse[nextResponse.length - 1].content;

      if (verbose === 1) {
        console.log("----------CLAUDE GENERATION----------");
        console.log(nextFormattedCompletion);
      }
      if (verbose === 0.5) {
        console.log("----------CLAUDE GENERATION----------");
        console.log(nextFormattedCompletion);
      }
    }
  }

  private parseFunctionCalls(
    lastCompletion: string,
    evaluateFunctionCalls: boolean,
  ): {
    status: string;
    message?: string;
    invokeResults?: { toolName: string; toolResult: any }[];
    content?: string;
  } {
    // Implement parsing logic based on expected format
    // This is a simplified example. Adjust as necessary for actual content format.
    const functionCallTags = lastCompletion.match(
      /<function_calls>|<\/function_calls>|<invoke>|<\/invoke>|<tool_name>|<\/tool_name>|<parameters>|<\/parameters>/g,
    );
    if (!functionCallTags) {
      return { status: "DONE" };
    }

    const match = lastCompletion.match(
      /<function_calls>(.*)<\/function_calls>/s,
    );
    if (!match) {
      return {
        status: "ERROR",
        message:
          "No valid <function_calls></function_calls> tags present in your query.",
      };
    }

    const funcCalls = match[1];

    const prefixMatch = lastCompletion.match(/^(.*?)<function_calls>/s);
    let funcCallPrefixContent = "";
    if (prefixMatch) {
      funcCallPrefixContent = prefixMatch[1];
    }

    const invokeRegex = /<invoke>.*?<\/invoke>/gs;
    if (!invokeRegex.test(funcCalls)) {
      return {
        status: "ERROR",
        message:
          "Missing <invoke></invoke> tags inside of <function_calls></function_calls> tags.",
      };
    }

    const invokeStrings = funcCalls.match(invokeRegex);
    const invokes: {
      toolName: string;
      parametersWithValues: [string, string][];
    }[] = [];

    for (const invokeString of invokeStrings!) {
      const toolName = invokeString.match(/<tool_name>.*?<\/tool_name>/s);
      if (!toolName) {
        return {
          status: "ERROR",
          message:
            "Missing <tool_name></tool_name> tags inside of <invoke></invoke> tags.",
        };
      }
      if (toolName.length > 1) {
        return {
          status: "ERROR",
          message:
            "More than one tool_name specified inside single set of <invoke></invoke> tags.",
        };
      }

      const parameters = invokeString.match(/<parameters>.*?<\/parameters>/s);
      if (!parameters) {
        return {
          status: "ERROR",
          message:
            "Missing <parameters></parameters> tags inside of <invoke></invoke> tags.",
        };
      }
      if (parameters.length > 1) {
        return {
          status: "ERROR",
          message:
            "More than one set of <parameters></parameters> tags specified inside single set of <invoke></invoke> tags.",
        };
      }

      const tags = parameters[0]
        .replace(/<parameters>/, "")
        .replace(/<\/parameters>/, "")
        .match(/<.*?>/gs);
      if (tags!.length % 2 !== 0) {
        return {
          status: "ERROR",
          message: "Imbalanced tags inside <parameters></parameters> tags.",
        };
      }

      const parametersWithValues: [string, string][] = [];
      for (let i = 0; i < tags!.length; i += 2) {
        const openingTag = tags![i];
        const closingTag = tags![i + 1];
        const closingTagWithoutSecondChar =
          closingTag.slice(0, 1) + closingTag.slice(2);
        if (
          closingTag[1] !== "/" ||
          openingTag !== closingTagWithoutSecondChar
        ) {
          return {
            status: "ERROR",
            message:
              "Non-matching opening and closing tags inside <parameters></parameters> tags.",
          };
        }

        const value = parameters[0].match(
          new RegExp(`${openingTag}(.*?)${closingTag}`, "s"),
        )![1];
        parametersWithValues.push([openingTag.slice(1, -1), value]);
      }

      invokes.push({
        toolName: toolName[0]
          .replace(/<tool_name>/, "")
          .replace(/<\/tool_name>/, ""),
        parametersWithValues,
      });
    }

    const invokeResults: { toolName: string; toolResult: any }[] = [];
    for (const invokeCall of invokes) {
      const tool = this.tools.find((t) => t.name === invokeCall.toolName);
      if (!tool) {
        return {
          status: "ERROR",
          message: `No tool named <tool_name>${invokeCall.toolName}</tool_name> available.`,
        };
      }

      const convertedParams: Record<string, any> = {};
      for (const [name, value] of invokeCall.parametersWithValues) {
        const type = typeof value;
        convertedParams[name] = ToolUser.convertValue(value, type);
      }

      if (!evaluateFunctionCalls) {
        invokeResults.push({
          toolName: invokeCall.toolName,
          toolResult: convertedParams,
        });
      } else {
        invokeResults.push({
          toolName: invokeCall.toolName,
          toolResult: tool.useTool(convertedParams),
        });
      }
    }

    return { status: "SUCCESS", invokeResults, content: funcCallPrefixContent };
  }

  private constructNextInjection(invokeResults: {
    status: string;
    message?: string;
    invokeResults?: { toolName: string; toolResult: any }[];
  }): string {
    if (invokeResults.status === "SUCCESS") {
      this.currentNumRetries = 0;
      return constructSuccessfulFunctionRunInjectionPrompt(
        invokeResults.invokeResults!,
      );
    } else if (invokeResults.status === "ERROR") {
      if (this.currentNumRetries === this.maxRetries) {
        throw new Error(
          "Hit maximum number of retries attempting to use tools.",
        );
      }

      this.currentNumRetries++;
      return constructErrorFunctionRunInjectionPrompt(invokeResults.message!);
    } else {
      throw new Error(
        `Unrecognized status from invoke_results, ${invokeResults.status}.`,
      );
    }
  }

  private static convertValue(value: string, type: string): any {
    if (type === "number") {
      return Number(value);
    }
    // Add more type conversions as needed
    return value;
  }
}

export default ToolUser;
