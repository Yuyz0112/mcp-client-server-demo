import { mcpApi } from "@/lib/mcp-api";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function ToolsList() {
  const { data, isPending, error } = useQuery({
    queryKey: ["tools"],
    queryFn: mcpApi.listTools,
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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold">工具列表</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left">
                  <div className="flex items-center">Name</div>
                </th>
                <th className="p-4 text-left">
                  <div className="flex items-center">Description</div>
                </th>
                <th className="p-4 text-left">
                  <div className="flex items-center">Status</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.tools.map((tool) => (
                <tr key={tool.name} className="border-b hover:bg-gray-50">
                  <td className="p-4">{tool.name}</td>
                  <td className="p-4">{tool.description}</td>
                  <td className="p-4 flex items-center space-x-2">
                    <Switch checked={true} />
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${"bg-green-100 text-green-800"}`}
                    >
                      active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
