import axios, { AxiosInstance } from "axios";
import {
  ANTHROPIC_MAX_TOKENS,
  ANTHROPIC_MODEL,
  ANTHROPIC_TEMPERATURE,
} from "../config";
import { systemPrompt } from "./format";

function claudeClient(): AxiosInstance {
  return axios.create({
    baseURL: "https://api.anthropic.com",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "tools-2024-04-04",
    },
  });
}

export const clientFetch = async (params: { [key: string]: any }) => {
  try {
    console.log("params", JSON.stringify(params, null, 2));
    const response = await claudeClient().request({
      method: "post",
      url: "/v1/messages",
      data: {
        system: systemPrompt(),
        model: ANTHROPIC_MODEL,
        max_tokens: ANTHROPIC_MAX_TOKENS,
        temperature: ANTHROPIC_TEMPERATURE,
        ...params,
      },
    });
    // console.log(response.data);
    return response.data;
  } catch (e: any) {
    console.log("error", JSON.stringify(e.response.data, null, 2));
    return null;
  }
};
