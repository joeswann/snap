import { fetchClaudeResponse } from "./fetch";
import { fetchToolResponse, toolDefinitions } from "./tools";
import { OutputMessage } from "./types";

export const formatMessage = (message: OutputMessage) => {
  return {
    role: message.role,
    content: message.content,
  };
};

export async function fetchMessages(
  messages: OutputMessage[],
  setMessages: (messages: OutputMessage[]) => void,
): Promise<void> {
  const reply: OutputMessage | null = await fetchClaudeResponse({
    tools: toolDefinitions,
    messages,
  });

  if (!reply) return;

  if (reply.role === "assistant" && reply.stop_reason === "tool_use") {
    const toolReply = await fetchToolResponse(reply);

    if (toolReply) {
      fetchMessages(
        [...messages, formatMessage(reply), toolReply],
        setMessages,
      );
    }
    return;
  }

  setMessages([...messages, formatMessage(reply)]);
}
