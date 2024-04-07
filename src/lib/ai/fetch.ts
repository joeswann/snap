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
  messages: OutputMessage[],
): Promise<OutputMessage[] | null> {
  const reply: OutputMessage | null = await clientFetch({
    tools: toolDefinitions,
    messages,
  });

  if (!reply) return messages;

  if (reply.role === "assistant" && reply.stop_reason === "tool_use") {
    const toolUseContent = reply.content.find(
      (content) => content.type === "tool_use",
    ) as Content;

    if (toolUseContent) {
      const { name, input, id } = toolUseContent;

      const toolReply: OutputMessage = {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: id,
            content: await fetchToolResponse(`${name}`, input),
          } as any,
        ],
      };

      return fetchMessage([...messages, formatMessage(reply), toolReply]);
    }
  }

  return [...messages, formatMessage(reply)];
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
