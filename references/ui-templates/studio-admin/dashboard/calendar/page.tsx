// Source: arhamkhnz/next-shadcn-admin-dashboard@e832f5b src/app/(main)/dashboard/calendar/page.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import type { Metadata } from "next";

import { Calendar } from "./_components/calendar";

export const metadata: Metadata = {
  title: "Open Source Calendar with shadcn/ui",
  description: "Explore an open source calendar interface for organizing events, schedules, and daily activities.",
  alternates: {
    canonical: "/dashboard/calendar",
  },
};

export default function Page() {
  return <Calendar />;
}
