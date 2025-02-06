import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import {
  CreateMessageRequestSchema,
  LoggingMessageNotificationSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { llmClient, provider, transformMessages } from "./llm";
import { BrowserWindow } from "electron";
import { v4 } from "uuid";
import { main } from "../../mcp-servers/koala-news-server";
import { userConfirm } from "./ui";

export function createChat(initiator: "user" | "background", summary: string) {
  const mainWindow = BrowserWindow.getAllWindows()[0];
  const chatId = v4();
  mainWindow.webContents.send("createChat", {
    chatId,
    initiator,
    summary,
  });

  return { chatId };
}

export function addChatMessage(chatId: string, message: unknown) {
  const mainWindow = BrowserWindow.getAllWindows()[0];
  mainWindow.webContents.send("addMessage", {
    chatId,
    message,
  });
}

export function finishChat(chatId: string, state: "error" | "success") {
  const mainWindow = BrowserWindow.getAllWindows()[0];
  mainWindow.webContents.send("finishChat", {
    chatId,
    state,
  });
}

export const NAME = "koala-news";
export const client = new Client(
  {
    name: NAME,
    version: "1.0.0",
  },
  {
    capabilities: {
      sampling: {},
    },
  }
);

client.setNotificationHandler(
  LoggingMessageNotificationSchema,
  ({ params }) => {
    console.log(params.data);
  }
);

client.setRequestHandler(CreateMessageRequestSchema, async (request) => {
  const { messages, maxTokens, systemPrompt } = request.params;
  const { chatId } = createChat("background", `数据取样`);

  const fullMessages = transformMessages(messages);
  if (systemPrompt) {
    fullMessages.unshift({
      role: "system",
      content: systemPrompt,
    });
  }

  fullMessages.forEach((m) => {
    addChatMessage(chatId, m);
  });

  await userConfirm({
    type: "confirm-sampling-request",
    payload: {
      messages: fullMessages,
    },
  });

  const completion = await llmClient.chat.completions.create({
    messages: fullMessages,
    max_tokens: maxTokens,
    model: provider.model,
  });

  await userConfirm({
    type: "confirm-sampling-result",
    payload: {
      result: completion.choices[0].message.content,
    },
  });

  completion.choices.forEach((c) => {
    addChatMessage(chatId, c.message);
  });

  // handle error
  finishChat(chatId, "success");

  return {
    content: {
      type: "text",
      text: completion.choices[0].message.content,
    },
    model: provider.model,
    role: "assistant",
  };
});

export async function connectServer() {
  await main();

  const transport = new SSEClientTransport(
    new URL("http://localhost:3000/sse")
  );

  await client.connect(transport);
}
