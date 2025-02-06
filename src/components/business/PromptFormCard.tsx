import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mcpApi } from "@/lib/mcp-api";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type { Prompt } from "@modelcontextprotocol/sdk/types.js";

export default function PromptFormCard({ prompt }: { prompt: Prompt }) {
  const [args, setArgs] = useState<Record<string, string>>({});
  const { isPending, mutate } = useMutation({
    mutationFn: () => {
      return mcpApi.usePrompt({
        name: prompt.name,
        arguments: args,
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{prompt.name}</CardTitle>
        {prompt.description && (
          <CardDescription>{prompt.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {(prompt.arguments || []).map((item) => {
          return (
            <div key={item.name} className="space-y-2">
              <Label>{item.name}</Label>
              <PromptArgsInput item={item} args={args} setArgs={setArgs} />
            </div>
          );
        })}
      </CardContent>
      <CardFooter>
        <Button disabled={isPending} onClick={() => mutate()}>
          {isPending ? "运行中..." : "运行"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function PromptArgsInput(props: {
  item: Exclude<Prompt["arguments"], undefined>[0];
  args: Record<string, string>;
  setArgs: (args: Record<string, string>) => void;
}) {
  const { item, args, setArgs } = props;

  if (item.xInputType === "file") {
    return (
      <Input
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              setArgs({ ...args, [item.name]: reader.result as string });
            };
            reader.readAsDataURL(file);
          }
        }}
        placeholder={item.description}
        required={item.required}
        type="file"
      />
    );
  }

  return (
    <Input
      value={args[item.name] || ""}
      onChange={(e) => {
        setArgs({ ...args, [item.name]: e.target.value });
      }}
      placeholder={item.description}
      required={item.required}
    />
  );
}
