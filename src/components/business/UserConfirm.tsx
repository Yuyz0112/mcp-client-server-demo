import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import CodeBlock from "./CodeBlock";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { MessageBlock } from "./MessageBlock";

function ConfirmToolCall(props: {
  payload: { toolName: string; input: unknown };
  onOk: () => void;
}) {
  const {
    payload: { toolName, input },
    onOk,
  } = props;
  return (
    <DialogContent className="sm:max-w-[1025px]">
      <DialogHeader>
        <DialogTitle>即将发起工具调用</DialogTitle>
        <DialogDescription>工具：{toolName}</DialogDescription>
      </DialogHeader>

      <ScrollArea className="h-72 rounded-md">
        <CodeBlock>{JSON.stringify(input, null, 2)}</CodeBlock>
      </ScrollArea>
      <DialogFooter>
        <Button onClick={onOk}>确认</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function ConfrimToolResult(props: {
  payload: { toolName: string; result: unknown };
  onOk: () => void;
}) {
  const {
    payload: { toolName, result },
    onOk,
  } = props;
  return (
    <DialogContent className="sm:max-w-[1025px]">
      <DialogHeader>
        <DialogTitle>工具调用结果</DialogTitle>
        <DialogDescription>工具：{toolName}</DialogDescription>
      </DialogHeader>
      <ScrollArea className="h-72 rounded-md">
        <CodeBlock>{JSON.stringify(result, null, 2)}</CodeBlock>
      </ScrollArea>
      <DialogFooter>
        <Button onClick={onOk}>确认</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function ConfirmSampingRequest(props: {
  payload: { messages: ChatCompletionMessageParam[] };
  onOk: () => void;
}) {
  return (
    <DialogContent className="sm:max-w-[1025px]">
      <DialogHeader>
        <DialogTitle>即将发起采样请求</DialogTitle>
      </DialogHeader>
      <ScrollArea className="h-72 rounded-md">
        {props.payload.messages.map((message, index) => {
          return <MessageBlock message={message} key={index} />;
        })}
      </ScrollArea>
      <DialogFooter>
        <Button onClick={props.onOk}>确认</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function ConfirmSampingResult(props: {
  payload: { result: string };
  onOk: () => void;
}) {
  return (
    <DialogContent className="sm:max-w-[1025px]">
      <DialogHeader>
        <DialogTitle>采样结果</DialogTitle>
      </DialogHeader>

      <ScrollArea className="h-72 rounded-md">
        <CodeBlock>{props.payload.result}</CodeBlock>
      </ScrollArea>
      <DialogFooter>
        <Button onClick={props.onOk}>确认</Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default function UserConfirm() {
  const { userConfirm, setUserConfirm } = useStore();

  const onOk = () => {
    setUserConfirm(null);
    window.ipcRenderer.send(`user-confirm-response`, {
      id: userConfirm?.id,
      ok: true,
      payload: userConfirm?.payload,
    });
  };

  return (
    <Dialog
      open={Boolean(userConfirm)}
      onOpenChange={(open) => {
        // handle close
        if (!open) {
          setUserConfirm(null);
          window.ipcRenderer.send(`user-confirm-response`, {
            id: userConfirm?.id,
            ok: false,
          });
        }
      }}
    >
      {userConfirm?.type === "confirm-tool-call" && (
        <ConfirmToolCall onOk={onOk} payload={userConfirm.payload} />
      )}
      {userConfirm?.type === "confirm-tool-result" && (
        <ConfrimToolResult onOk={onOk} payload={userConfirm.payload} />
      )}
      {userConfirm?.type === "confirm-sampling-request" && (
        <ConfirmSampingRequest onOk={onOk} payload={userConfirm.payload} />
      )}
      {userConfirm?.type === "confirm-sampling-result" && (
        <ConfirmSampingResult onOk={onOk} payload={userConfirm.payload} />
      )}
    </Dialog>
  );
}
