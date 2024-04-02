"use server";
import Anthropic from "@anthropic-ai/sdk";
import { ToolDefinition, functionResults, systemPrompt } from "./format";
import { tools } from "./tools";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type Messages = Message[];

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 4,
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
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      temperature: 0.5,
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
