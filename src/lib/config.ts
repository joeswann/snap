export const ANTHROPIC_MODEL = "claude-3-opus-20240229";
export const ANTHROPIC_MAX_TOKENS = 1024;
export const ANTHROPIC_MAX_RETRIES = 4;
export const ANTHROPIC_TEMPERATURE = 0.5;

export const SYSTEM_PROMPT = `

  In this environment you have access to a set of tools you can use to answer the user's question.
  Please note, when you get results from a tool, please summarise the answer in plain text.
`;
