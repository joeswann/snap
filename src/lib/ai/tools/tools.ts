import { ToolDefinition } from "./format";

export const tools: ToolDefinition[] = [
  {
    name: "add",
    description: "Add two numbers together",
    parameters: [
      {
        name: "a",
        type: "number",
        description: "The first number in your addition equation.",
      },
      {
        name: "b",
        type: "number",
        description: "The second number in your addition equation.",
      },
    ],
    execute: async (parameters: {
      [key: string]: string | number | boolean;
    }) => {
      const a = parameters["a"] as number;
      const b = parameters["b"] as number;
      return `${a + b}`;
    },
  },
];
