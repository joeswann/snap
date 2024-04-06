import { ToolDefinition } from "../format";
import fetch from "node-fetch";

export const codeTool: ToolDefinition = {
  name: "run_code",
  description:
    "Run code in a specified language and return the results. " +
    "Please note that incomplete code like placeholder API keys won't work. " +
    "Also packages and env vars are not supported.",
  parameters: [
    {
      name: "source",
      type: "string",
      description: "The code to execute",
    },
    {
      name: "language",
      type: "string",
      description:
        "The programming language of the code (e.g., python, javascript).",
    },
    {
      name: "version",
      type: "string",
      description:
        "The version of the language as a string, for python use 3.10.0.",
    },
  ],
  execute: async (parameters: { [key: string]: string | number | boolean }) => {
    const code = parameters["source"] as string;
    const language = parameters["language"] as string;
    const version = parameters["version"] as string | undefined;

    const payload = {
      language: language,
      version: version,
      files: [
        {
          content: code,
        },
      ],
    };

    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log(result);

    if (result.run.stdout) {
      return result.run.stdout;
    } else if (result.run.stderr) {
      return result.run.stderr;
    } else {
      return "No output";
    }
  },
};
