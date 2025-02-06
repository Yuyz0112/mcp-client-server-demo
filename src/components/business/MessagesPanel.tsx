import { useStore } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  // DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Wrench } from "lucide-react";
import { MessageBlock } from "./MessageBlock";
import Time from "./Time";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function MessagesPanel() {
  const { chats, activeChatId, setActiveChatId } = useStore();
  const activeChat =
    activeChatId && chats.find((chat) => chat.id === activeChatId);
  const [open, setOpen] = useState(Boolean(activeChat));

  return (
    <Drawer
      open={open || Boolean(activeChat)}
      onOpenChange={(v) => {
        if (v === false) {
          setActiveChatId("");
        }
        setOpen(v);
      }}
    >
      <DrawerTrigger asChild>
        <Button className="fixed right-3 bottom-3 rounded-lg" size="icon">
          <Wrench />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="right-2 top-2 bottom-2 fixed z-50 outline-none w-[400px] flex">
        <div className="bg-zinc-50 h-full w-full grow p-5 flex flex-col rounded-[16px] overflow-auto">
          <DrawerTitle className="w-full">
            <Select
              value={activeChatId ?? undefined}
              onValueChange={(v) => setActiveChatId(v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="历史 AI 任务" />
              </SelectTrigger>
              <SelectContent>
                {chats.length === 0 && (
                  <SelectItem value="noop" disabled>
                    暂无
                  </SelectItem>
                )}
                {chats.map((chat) => {
                  return (
                    <SelectItem key={chat.id} value={chat.id}>
                      {chat.summary}
                      {chat.messages.length && (
                        <span className="text-gray-500 text-sm ml-2">
                          <Time date={chat.messages[0].createdAt} />
                        </span>
                      )}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </DrawerTitle>
          {activeChat && (
            <div key={activeChat.id} className="mt-4">
              <div
                className={`text-xs uppercase font-bold ${
                  activeChat.initiator === "user"
                    ? "text-blue-400"
                    : "text-gray-400"
                }`}
              >
                {activeChat.initiator === "user" ? "用户任务" : "后台任务"}
              </div>
              {activeChat.messages.map((message, index) => {
                return <MessageBlock message={message} key={index} />;
              })}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
