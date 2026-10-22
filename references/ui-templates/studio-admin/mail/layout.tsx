// Source: arhamkhnz/next-shadcn-admin-dashboard@e832f5b src/app/(main)/mail/layout.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import type { ReactNode } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";

import { MailSidebar } from "./_components/mail-sidebar";

export default async function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="relative h-full">
      <SidebarProvider className="h-full min-h-0">
        <MailSidebar />
        <div className="size-full">{children}</div>
      </SidebarProvider>
    </div>
  );
}
