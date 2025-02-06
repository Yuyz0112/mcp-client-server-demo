import PromptFormCard from "./PromptFormCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { mcpApi } from "@/lib/mcp-api";

export default function Workspace() {
  const { isPending, error, data } = useQuery({
    queryKey: ["prompts"],
    queryFn: mcpApi.listPrompts,
  });

  if (isPending) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    );
  }

  if (error) {
    return <p>{"An error has occurred: " + error.message}</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-2 grid-rows-2 gap-4 p-2">
        {data.prompts.map((prompt) => (
          <PromptFormCard key={prompt.name} prompt={prompt} />
        ))}
      </div>
    </div>
  );
}
