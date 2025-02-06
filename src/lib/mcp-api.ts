import type { Client } from "@modelcontextprotocol/sdk/client/index.js";

export const mcpApi: Pick<Client, "listPrompts" | "listTools"> & {
  usePrompt: (
    ...params: Parameters<Client["getPrompt"]>
  ) => ReturnType<Client["callTool"]>;
} = {
  listPrompts: function (params) {
    return window.ipcRenderer.invoke("listPrompts", params);
  },
  usePrompt: async function (params) {
    return window.ipcRenderer.invoke("usePrompt", params);
  },
  listTools: function (params) {
    return window.ipcRenderer.invoke("listTools", params);
  },
};
