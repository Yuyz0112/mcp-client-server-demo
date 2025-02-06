import type { ResourceContents } from "@modelcontextprotocol/sdk/types.js";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
type _ChatCompletionContentPartResource = {
  type: "resource";
  resource: ResourceContents;
};

type NormalizedContent =
  | Exclude<ChatCompletionMessageParam["content"], string | null | undefined>
  | _ChatCompletionContentPartResource[];

export function normalizeContent(
  content: ChatCompletionMessageParam["content"]
) {
  let result: NormalizedContent = [];

  if (typeof content === "string") {
    try {
      const parsedContent = JSON.parse(content);
      if (Array.isArray(parsedContent)) {
        result = parsedContent;
      } else {
        result = [{ type: "text", text: content }];
      }
    } catch {
      result = [{ type: "text", text: content }];
    }
  } else {
    result = content || [];
  }

  return result;
}

export function parseUri(uri: string) {
  const url = new URL(uri);
  return {
    protocol: url.protocol,
    hostname: url.hostname,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
  };
}
