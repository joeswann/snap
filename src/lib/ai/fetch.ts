"use server";
import Anthropic from "@anthropic-ai/sdk";
import { fetchWithTools, tools } from "./tools";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type Messages = Message[];

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
  maxRetries: 4,
});

export const fetchMessages = (messages: Message[]) =>
  fetchWithTools({
    tools,
    messages,
  });
