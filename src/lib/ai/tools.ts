import { ToolDefinition } from "./format";
import { JSDOM } from "jsdom";

export const tools: ToolDefinition[] = [
  {
    name: "fetch_google_results",
    description: "Fetch search results from Google",
    parameters: [
      {
        name: "query",
        type: "string",
        description: "The search query to use.",
      },
    ],
    execute: async (parameters: {
      [key: string]: string | number | boolean;
    }) => {
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
      console.log(query, json);

      return JSON.stringify(
        json.organic.map(
          (result: any) => `
          title: ${result.title}
          url: ${result.link}
          text: ${result.snippet}
          date: ${result.date}
        `,
        ),
      );
    },
  },
  {
    name: "scrape_webpage",
    description: "Scrape a webpage using chrome.browserless.io",
    parameters: [
      {
        name: "url",
        type: "string",
        description: "The URL of the webpage to scrape.",
      },
    ],
    execute: async (parameters: {
      [key: string]: string | number | boolean;
    }) => {
      "use server";
      const url = parameters["url"] as string;
      const browserlessUrl = `https://chrome.browserless.io/content?token=${process.env.BROWSERLESS_API_KEY}`;

      const payload = JSON.stringify({ url: url });
      const headers = {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      };

      const response = await fetch(browserlessUrl, {
        method: "POST",
        headers: headers,
        body: payload,
      });

      const html = await response.text();

      // Remove unnecessary HTML using JSDOM
      const dom = new JSDOM(html);
      const doc = dom.window.document;

      // Remove script tags
      ["head", "script", "img", "style"].map((tag) => {
        const element = doc.getElementsByTagName(tag);
        for (const e of element) e.parentNode?.removeChild(e);
        return element;
      });

      // Remove comments
      const comments = doc.createTreeWalker(
        doc,
        dom.window.NodeFilter.SHOW_COMMENT,
        null,
      );
      while (comments.nextNode()) {
        comments.currentNode.parentNode?.removeChild(comments.currentNode);
      }

      // Get the cleaned HTML
      const cleanedHtml = doc.documentElement.outerHTML;

      console.log(cleanedHtml);

      return cleanedHtml;
    },
  },
];
