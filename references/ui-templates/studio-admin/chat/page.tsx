// Source: arhamkhnz/next-shadcn-admin-dashboard@e832f5b src/app/(main)/chat/page.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import type { Metadata } from "next";

import { Chat } from "./_components/chat";
import { conversations } from "./_components/data";

export const metadata: Metadata = {
  title: "Open Source Chat Interface with shadcn/ui",
  description:
    "Explore an open source chat interface with conversation search, message threads, internal notes, and contact details.",
  alternates: {
    canonical: "/chat",
  },
};

export default function Page() {
  return <Chat conversations={conversations} />;
}
