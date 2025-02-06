import { PromptMessage } from "@modelcontextprotocol/sdk/types.js";
import OpenAI from "openai";

export const provider = {
  baseURL: process.env.VITE_APP_BASE_URL || "",
  apiKey: process.env.VITE_APP_API_KEY || "",
  model: process.env.VITE_APP_MODEL || "",
};

export const llmClient = new OpenAI({
  ...provider,
  fetch: async (url: RequestInfo, init?: RequestInit): Promise<Response> => {
    // console.log("About to make a request", init?.body);
    const response = await fetch(url, init);
    if (response.status >= 400) {
      const reason = await response.text();
      throw new Error(`Failed to fetch ${url} ${reason}`);
    }
    return response;
  },
  timeout: 300_000,
});

export function transformMessages(
  messages: PromptMessage[]
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  return messages.map((m) => ({
    role: m.role,
    content: [
      {
        type: m.content.type as "text",
        text: m.content.text as string,
      },
    ],
  }));
}
