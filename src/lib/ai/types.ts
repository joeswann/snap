export interface InputMessage {
  role: "user" | "assistant";
  content: string;
}

export interface OutputMessage {
  role: "user" | "assistant";
  content: Content[];
  stop_reason?: "max_tokens" | "tool_use";
}

export interface Content {
  type: "text" | "tool_use" | "tool_result";
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  is_error?: boolean;
}

export interface Tool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export interface ChatOptions {
  model: string;
  max_tokens: number;
  tools: Tool[];
}
type ToolParameter = {
  type: "string" | "number" | "boolean";
  name: string;
  description: string;
};

export type ToolDefinition = {
  parameters: ToolParameter[];
  description: string;
  name: string;
  execute: (parameters: {
    [key: string]: string | number | boolean;
  }) => Promise<string>;
};
