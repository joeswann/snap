import { ToolDefinition } from "../format";
import { JSDOM } from "jsdom";

export const scrapeTool: ToolDefinition = {
  name: "scrape_webpage",
  description: "Scrape a webpage using chrome.browserless.io",
  parameters: [
    {
      name: "url",
      type: "string",
      description: "The URL of the webpage to scrape.",
    },
  ],
  execute: async (parameters: { [key: string]: string | number | boolean }) => {
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

    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Remove unreadable tags
    const tagsToRemove = ["head", "script", "img", "style", "svg"];
    tagsToRemove.forEach((tag) => {
      const elements = doc.getElementsByTagName(tag);
      while (elements.length > 0) {
        elements?.[0].parentNode?.removeChild(elements[0]);
      }
    });

    // Get the cleaned HTML
    const cleanedHtml = doc.documentElement.outerHTML;

    console.log(cleanedHtml);

    return cleanedHtml;
  },
};
