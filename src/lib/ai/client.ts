"use server";
import Anthropic from "@anthropic-ai/sdk";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type Messages = Message[];

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
});

export const fetchMessages = async ({
  messages,
}: {
  messages: Messages;
}): Promise<Messages> => {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",

      max_tokens: 1024,
      messages,
    });

    const content = response.content[0].text;

    console.log({ content });

    return [...messages, { role: "assistant", content }];
  } catch (e) {
    console.log(e);
    return [];
  }
};
