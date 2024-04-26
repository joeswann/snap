"use server";

import axios, { AxiosResponse } from "axios";

import {
  ANTHROPIC_MAX_TOKENS,
  ANTHROPIC_MODEL,
  ANTHROPIC_TEMPERATURE,
  SYSTEM_PROMPT,
} from "../config";

const claudeClient = () =>
  axios.create({
    baseURL: "https://api.anthropic.com",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "tools-2024-04-04",
    },
  });

export const fetchClaudeResponse = async (params: { [key: string]: any }) => {
  try {
    const response = await claudeClient().request({
      method: "post",
      url: "/v1/messages",
      data: {
        system: SYSTEM_PROMPT,
        model: ANTHROPIC_MODEL,
        max_tokens: ANTHROPIC_MAX_TOKENS,
        temperature: ANTHROPIC_TEMPERATURE,
        ...params,
      },
    });
    return response.data;
  } catch (e: any) {
    console.log("error", JSON.stringify(e.response.data, null, 2));
    return null;
  }
};
