import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/db";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useStore } from "@/lib/store";

export default function AppSidebar() {
  const {
    isPending,
    error,
    data: newsData,
  } = useQuery({
    queryKey: ["news"],
    queryFn: db.listNews,
  });
  const { activePage, setActivePage } = useStore();

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
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activePage.type === "tools"}
              onClick={() => setActivePage({ type: "tools" })}
            >
              工具库
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activePage.type === "workspace"}
              onClick={() => setActivePage({ type: "workspace" })}
            >
              工作区
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>科技周报</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              {newsData.length === 0 && (
                <SidebarMenuButton disabled>暂无</SidebarMenuButton>
              )}
              {newsData.map((item) => {
                return (
                  <SidebarMenuButton
                    key={item.id}
                    isActive={
                      activePage.type === "news" && activePage.id === item.id
                    }
                    onClick={() => setActivePage({ type: "news", id: item.id })}
                    className={`${item.draft ? "bg-red-50" : ""} truncate`}
                    title={item.title}
                  >
                    {item.title}
                  </SidebarMenuButton>
                );
              })}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>俱乐部视频</SidebarGroupLabel>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
