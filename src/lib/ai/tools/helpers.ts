import Anthropic from "@anthropic-ai/sdk";
import {
  ANTHROPIC_MAX_RETRIES,
  ANTHROPIC_MAX_TOKENS,
  ANTHROPIC_TEMPERATURE,
} from "~/lib/config";

export const summarise = async (code: string): Promise<string> => {
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
