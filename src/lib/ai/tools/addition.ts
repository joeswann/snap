import BaseTool, { Tool, ToolDescription } from "../base";

export class AdditionTool implements Tool {
  name = "perform_addition";
  useTool(a: number, b: number): number {
    return a + b;
  }
}

export const additionToolDescription: ToolDescription = {
  name: "perform_addition",
  description:
    "Add one number (a) to another (b), returning a+b.\n\nUse this tool WHENEVER you need to perform any addition calculation, as it will ensure your answer is precise.",
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
};
