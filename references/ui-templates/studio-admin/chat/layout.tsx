// Source: arhamkhnz/next-shadcn-admin-dashboard@e832f5b src/app/(main)/chat/layout.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import type { ReactNode } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";

import { ChatHeader } from "./_components/chat-header";
import { ChatSidebar } from "./_components/chat-sidebar";

export default async function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <ChatHeader />
        <div className="flex flex-1">
          <ChatSidebar />
          {children}
        </div>
      </SidebarProvider>
    </div>
  );
}
