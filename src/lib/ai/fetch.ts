"use server";
import Anthropic from "@anthropic-ai/sdk";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type Messages = Message[];

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
  maxRetries: 4,
});

export const fetchMessages = async ({
  messages,
  system,
}: {
  system?: string;
  messages: Messages;
}): Promise<Messages> => {
  try {
    const params: Anthropic.MessageCreateParams = {
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      temperature: 0.5,
      messages,
      system,
    };

    const response = await anthropic.messages.create(params);
    console.log(response);
    const content = response.content[0].text;

    return [...messages, { role: "assistant", content }];
  } catch (e) {
    console.log(e);
    return [];
  }
};
