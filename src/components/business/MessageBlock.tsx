import { cn } from "@/lib/utils";
import type {
  ChatCompletionAssistantMessageParam,
  ChatCompletionMessageParam,
} from "openai/resources/index.mjs";
import Time from "./Time";
import { normalizeContent, parseUri } from "@/lib/format";
import type { ResourceContents } from "@modelcontextprotocol/sdk/types.js";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import CodeBlock from "./CodeBlock";

export function MessageBlock({
  message,
}: {
  message: ChatCompletionMessageParam & { createdAt?: Date };
}) {
  const { role, content } = message;

  return (
    <div
      className={cn(
        "flex flex-col mt-2 text-sm",
        role === "user" && "items-end"
      )}
    >
      <div
        className={cn(
          `w-[85%]`,
          role !== "user" &&
            `p-2 text-secondary-foreground rounded-r-lg rounded-tl-lg break-words max-w-full whitespace-pre-wrap`,
          role === "user" &&
            `p-2 bg-primary text-primary-foreground rounded-l-lg rounded-tr-lg break-words max-w-full whitespace-pre-wrap`,
          role === "assistant" && "bg-slate-600 text-white",
          role === "system" && "bg-gray-200 text-gray-600",
          role === "tool" && "bg-yellow-100 text-gray-700"
        )}
      >
        {role === "assistant" && <AssistantMessageBlock message={message} />}
        {!["assistant"].includes(role) && <MessageContent content={content} />}
      </div>
      <div>
        {role}
        {message.createdAt && (
          <span className="text-gray-500 text-sm ml-2">
            <Time date={message.createdAt} />
          </span>
        )}
      </div>
    </div>
  );
}

function AssistantMessageBlock({
  message,
}: {
  message: ChatCompletionAssistantMessageParam;
}) {
  const { tool_calls, content } = message;

  return (
    <div>
      {tool_calls &&
        tool_calls.map((c) => {
          return (
            <div key={c.id}>
              <div>
                使用工具{" "}
                <span className="bg-gray-100 text-gray-800 rounded-sm p-1">
                  {c.function.name}
                </span>
              </div>
              <div>
                参数
                <CodeBlock>{c.function.arguments}</CodeBlock>
              </div>
            </div>
          );
        })}
      {content && <MessageContent content={content} />}
    </div>
  );
}

function MessageContent({
  content,
}: {
  content: ChatCompletionMessageParam["content"];
}) {
  return (
    <>
      {normalizeContent(content).map((part, index) => {
        return (
          <div key={index}>
            {part.type === "text" && <div>{part.text}</div>}
            {part.type === "image_url" && (
              <img src={part.image_url.url} alt="" />
            )}
            {part.type === "resource" && (
              <ResourceCard resource={part.resource} />
            )}
            {part.type === "refusal" && (
              <div className="text-red-300">{part.refusal}</div>
            )}
            {/* not supported yet */}
            {part.type === "input_audio" && null}
          </div>
        );
      })}
    </>
  );
}

function ResourceCard({ resource }: { resource: ResourceContents }) {
  const { protocol } = parseUri(resource.uri);

  let detail = null;

  if (typeof resource.text === "string") {
    switch (resource.mimeType) {
      case "text/plain":
        detail = resource.text;
        break;
      case "application/json":
        detail = (
          <Popover>
            <PopoverTrigger>
              <Button>点击查看</Button>
            </PopoverTrigger>
            <PopoverContent className="w-[480px] overflow-auto">
              <pre>{JSON.stringify(JSON.parse(resource.text), null, 2)}</pre>
            </PopoverContent>
          </Popover>
        );
        break;
      default:
    }
  }

  return (
    <div className="border p-2 rounded-md shadow-sm bg-white mt-1">
      <div className="font-bold">{protocol.replace(":", "")}</div>
      {detail}
    </div>
  );
}
