import { ToolDefinition } from "../format";

export const searchTool: ToolDefinition = {
  name: "fetch_google_results",
  description: "Fetch search results from Google",
  parameters: [
    {
      name: "query",
      type: "string",
      description: "The search query to use.",
    },
  ],
  execute: async (parameters: { [key: string]: string | number | boolean }) => {
    "use server";
    const query = parameters["query"] as string;
    const url = "https://google.serper.dev/search";

    const payload = JSON.stringify({ q: query });
    const headers = {
      "X-API-KEY": process.env.SERP_API_KEY || "",
      "Content-Type": "application/json",
    };

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: payload,
    });

    const json = await response.json();
    if (json.statusCode) throw new Error(json.message);

    return `
        Organic results:
        ${json.organic.map(
          (result: any) => `
        Title: ${result.title}
        Date: ${result.date}
        Url: ${result.link}
        Snippet: ${result.snippet}
        `,
        )}

        Questions:
        ${json.peopleAlsoAsk.map(
          (result: any) => `
        Question: ${result.question}
        Answer: ${result.snippet}
        Url: ${result.link}
        `,
        )}
      `;
  },
};
