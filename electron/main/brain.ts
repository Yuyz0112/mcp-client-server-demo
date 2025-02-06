import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  client as koalaNewsClient,
  NAME as KOALA_NEWS_NAME,
  createChat,
  addChatMessage,
  finishChat,
} from "./koala-news-client";
import { llmClient, provider, transformMessages } from "./llm";
import {
  GetPromptRequest,
  ListToolsResult,
  PromptMessage,
} from "@modelcontextprotocol/sdk/types.js";
import { userConfirm } from "./ui";

export type RunToolsPayload = {
  messages: PromptMessage[];
  tools: ListToolsResult["tools"];
  mcpClient: string;
};

class Brain {
  clients: Record<string, Client> = {};

  constructor({ clients }: { clients: Record<string, Client> }) {
    this.clients = clients;
  }

  async usePrompt(
    params: GetPromptRequest["params"],
    mcpClient = KOALA_NEWS_NAME
  ) {
    const client = this.clients[mcpClient];
    const { tools } = await client.listTools();
    const prompt = await client.getPrompt(params);

    const { chatId } = createChat("user", `使用提示词模版「${params.name}」`);

    return this.runTools(
      {
        messages: prompt.messages,
        tools,
        mcpClient,
      },
      (m) => {
        addChatMessage(chatId, m);
      }
    )
      .then((result) => {
        finishChat(chatId, "success");
        return result;
      })
      .catch((error) => {
        console.error(error); // log to UI
        finishChat(chatId, "error");
      });
  }

  private async runTools(
    { messages, tools, mcpClient = KOALA_NEWS_NAME }: RunToolsPayload,
    onMessage: (message: unknown) => void
  ) {
    const _messages = transformMessages(messages);

    _messages.forEach(onMessage);

    const runner = llmClient.beta.chat.completions
      .runTools(
        {
          messages: _messages,
          model: provider.model,
          tools: tools.map((t) => {
            return {
              type: "function" as const,
              function: {
                parse: JSON.parse,
                description: t.description ?? "",
                function: async (input) => {
                  await userConfirm({
                    type: "confirm-tool-call",
                    payload: {
                      toolName: t.name,
                      input,
                    },
                  });

                  const { content } = await this.clients[mcpClient].callTool({
                    name: t.name,
                    arguments: input as unknown as Record<string, string>,
                  });

                  await userConfirm({
                    type: "confirm-tool-result",
                    payload: {
                      toolName: t.name,
                      result: content,
                    },
                  });

                  return content;
                },
                name: t.name,
                parameters: t.inputSchema as Record<string, string>,
              },
            };
          }),
        },
        {
          // FIXME: https://github.com/deepseek-ai/DeepSeek-V3/issues/15
          maxChatCompletions: 1,
        }
      )
      .on("message", (m) => {
        onMessage(m);
      });

    await runner.finalFunctionCallResult();
  }
}

export const brain = new Brain({
  clients: {
    [KOALA_NEWS_NAME]: koalaNewsClient,
  },
});
