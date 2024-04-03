"use server";
import Anthropic from "@anthropic-ai/sdk";
import { ToolDefinition, functionResults, systemPrompt } from "./format";
import { tools } from "./tools";
import {
  ANTHROPIC_MAX_RETRIES,
  ANTHROPIC_MAX_TOKENS,
  ANTHROPIC_MODEL,
  ANTHROPIC_TEMPERATURE,
} from "../config";
import { warn } from "console";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type Messages = Message[];

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: ANTHROPIC_MAX_RETRIES,
});

export const fetchWithTools = async ({
  messages,
  tools,
}: {
  tools: ToolDefinition[];
  messages: Messages;
}): Promise<Messages> => {
  try {
    const params: Anthropic.MessageCreateParams = {
      model: ANTHROPIC_MODEL,
      max_tokens: ANTHROPIC_MAX_TOKENS,
      temperature: ANTHROPIC_TEMPERATURE,
      messages: [...messages].filter(Boolean),
      system: systemPrompt(tools),
      stop_sequences: ["</function_calls>"],
    };
    const response = await anthropic.messages.create(params);
    const content = response.content[0].text;
    const results = await functionResults(tools, content);

    if (results) {
      return fetchWithTools({
        messages: [
          ...messages,
          { role: "assistant", content: content },
          { role: "user", content: results },
        ],
        tools,
      });
    }

    return [...messages, { role: "assistant", content }];
  } catch (e) {
    console.log(e);
    return [];
  }
};

export const fetchMessages = (messages: Message[]) =>
  fetchWithTools({
    tools,
    messages,
  });

export const fetchClean = async (code: string): Promise<string> => {
  try {
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
