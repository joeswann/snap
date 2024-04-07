"use server";

import { InputMessage, Content, OutputMessage } from "./types";
import {
  ANTHROPIC_MAX_RETRIES,
  ANTHROPIC_MAX_TOKENS,
  ANTHROPIC_TEMPERATURE,
} from "../config";
import Anthropic from "@anthropic-ai/sdk";
import { fetchToolResponse, toolDefinitions } from "./tools";
import { clientFetch } from "./client";
import { formatMessage } from "./format";

export async function fetchMessage(
  messages: InputMessage[],
): Promise<InputMessage[] | null> {
  const responseMessage: OutputMessage | null = await clientFetch({
    tools: toolDefinitions,
    messages,
  });

  if (!responseMessage) return messages;

  if (
    responseMessage.role === "assistant" &&
    responseMessage.stop_reason === "tool_use"
  ) {
    const toolUseContent = responseMessage.content.find(
      (content) => content.type === "tool_use",
    ) as Content;

    if (toolUseContent) {
      const { name, input, id } = toolUseContent;

      const toolResultMessage: OutputMessage = {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: id,
            text: await fetchToolResponse(`${name}`, input),
          },
        ],
      };

      return fetchMessage([
        ...messages,
        ...formatMessage(responseMessage),
        ...formatMessage(toolResultMessage),
      ]);
    }
  }

  return [...messages, ...formatMessage(responseMessage)];
}

export const fetchClean = async (code: string): Promise<string> => {
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      maxRetries: ANTHROPIC_MAX_RETRIES,
    });

    const params: Anthropic.MessageCreateParams = {
      model: "claude-3-haiku-20240307",
      max_tokens: ANTHROPIC_MAX_TOKENS,
      temperature: ANTHROPIC_TEMPERATURE,
      messages: [
        {
          role: "user",
          content: `please use this and send written information contained without skipping or summarising. also include any links in the main content\n\n${code}`,
        },
      ],
    };
    const response = await anthropic.messages.create(params);
    const content = response.content[0].text;
    return content;
  } catch (e) {
    console.log(e);
    return "Error occurred while cleaning up the code.";
  }
};
