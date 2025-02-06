import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import "./App.css";
import AppSidebar from "@/components/business/AppSidebar";
import { useStore } from "@/lib/store";
import Workspace from "./components/business/Workspace";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Toaster } from "@/components/ui/sonner";
import { Separator } from "@/components/ui/separator";
import NewsEditor from "@/components/business/NewsEditor";
import MessagesPanel from "@/components/business/MessagesPanel";
import { useEffect } from "react";
import ToolsList from "./components/business/ToolsList";
import UserConfirm from "./components/business/UserConfirm";

function App() {
  const { activePage, createChat, addMessage, finishChat, setUserConfirm } =
    useStore();

  useEffect(() => {
    window.ipcRenderer.on("createChat", (_, { chatId, initiator, summary }) => {
      createChat({ id: chatId, initiator, summary });
    });

    window.ipcRenderer.on("addMessage", (_, { chatId, message }) => {
      addMessage(chatId, message);
    });

    window.ipcRenderer.on("finishChat", (_, { chatId, state }) => {
      finishChat(chatId, state);
    });

    window.ipcRenderer.on(
      "user-confirm-request",
      (_, { id, type, payload }) => {
        setUserConfirm({
          id,
          type,
          payload,
        });
      }
    );

    return () => {
      window.ipcRenderer.removeAllListeners("createChat");
      window.ipcRenderer.removeAllListeners("addMessage");
      window.ipcRenderer.removeAllListeners("finishChat");
    };
  }, [createChat, addMessage, finishChat]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbPage>{activePage.type}</BreadcrumbPage>
                </BreadcrumbItem>
                {"id" in activePage && (
                  <>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{activePage.id}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main>
          {activePage.type === "workspace" && <Workspace />}
          {activePage.type === "tools" && <ToolsList />}
          {activePage.type === "news" && <NewsEditor id={activePage.id} />}
        </main>
      </SidebarInset>
      <MessagesPanel />
      <UserConfirm />
      <Toaster />
    </SidebarProvider>
  );
}

export default App;
