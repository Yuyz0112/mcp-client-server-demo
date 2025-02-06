import { create } from "zustand";
import { toast } from "sonner";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { normalizeContent, parseUri } from "@/lib/format";
import { queryClient } from "@/lib/query";

type Chat = {
  id: string;
  state: "error" | "loading" | "success";
  initiator: "user" | "background";
  summary: string;
  messages: (ChatCompletionMessageParam & { createdAt: Date })[];
};

type UserConfirm = {
  id: string;
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
};

interface State {
  activePage:
    | {
        type: "workspace";
      }
    | {
        type: "news";
        id: number;
      }
    | {
        type: "tools";
      };
  setActivePage: (newPage: State["activePage"]) => void;

  activeChatId: string | null;
  setActiveChatId: (chatId: string) => void;

  chats: Chat[];
  createChat: (params: Omit<Chat, "messages" | "state">) => string;
  addMessage: (chatId: string, message: Chat["messages"][0]) => void;
  finishChat: (chatId: string, state: "error" | "success") => void;

  userConfirm: UserConfirm | null;
  setUserConfirm: {
    (options: UserConfirm | null): void;
  };
}

export const useStore = create<State>((set) => ({
  activePage: {
    type: "workspace",
  },
  setActivePage: (newPage: State["activePage"]) => set({ activePage: newPage }),
  activeChatId: null,
  setActiveChatId: (chatId) => set({ activeChatId: chatId }),

  chats: [],
  createChat: (params: Omit<Chat, "messages" | "state">) => {
    set((prev) => ({
      chats: [{ ...params, messages: [], state: "loading" }, ...prev.chats],
    }));
    return params.id;
  },
  addMessage(chatId, message: ChatCompletionMessageParam) {
    set((prev) => {
      const chat = prev.chats.find((c) => c.id === chatId);
      if (!chat) {
        return prev;
      }
      chat.messages.push({
        ...message,
        createdAt: new Date(),
      });

      if (message.role === "tool") {
        normalizeContent(message.content).forEach((part) => {
          if (part.type === "resource") {
            const { protocol } = parseUri(part.resource.uri);
            queryClient.invalidateQueries({
              queryKey: [protocol.replace(":", "")],
            });
          }
        });
      }

      return { chats: prev.chats };
    });
  },
  finishChat(chatId, state) {
    set((prev) => {
      const chat = prev.chats.find((c) => c.id === chatId);
      if (!chat) {
        return prev;
      }
      chat.state = state;
      return { chats: prev.chats };
    });
  },
  userConfirm: null,
  setUserConfirm(options) {
    set({ userConfirm: options });
  },
}));

const dismissSet = new Set<string>();

useStore.subscribe(({ chats }) => {
  for (const chat of chats) {
    if (dismissSet.has(chat.id)) {
      continue;
    }
    toast[chat.state](
      `${chat.initiator === "user" ? "用户" : "后台"} AI 任务：${chat.summary}`,
      {
        id: chat.id,
        description: `当前对话数 ${chat.messages.length}`,
        richColors: true,
        duration: Infinity,
        action: {
          label: "查看详情",
          onClick(event) {
            useStore.getState().setActiveChatId(chat.id);
            event.preventDefault();
          },
        },
        closeButton: true,
        onDismiss() {
          dismissSet.add(chat.id);
        },
      }
    );
  }
});
