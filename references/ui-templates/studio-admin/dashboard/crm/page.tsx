// Source: arhamkhnz/next-shadcn-admin-dashboard@e832f5b src/app/(main)/dashboard/crm/page.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import type { Metadata } from "next";

import { KpiCards } from "./_components/kpi-cards";
import { OpportunitiesSection } from "./_components/opportunities-section";
import { PipelineActivity } from "./_components/pipeline-activity";
import { TaskReminders } from "./_components/task-reminders";

export const metadata: Metadata = {
  title: "Open Source CRM Dashboard with shadcn/ui",
  description:
    "Explore an open source CRM dashboard with pipeline activity, opportunities, sales performance, and task reminders.",
  alternates: {
    canonical: "/dashboard/crm",
  },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <KpiCards />
      <PipelineActivity />
      <TaskReminders />
      <OpportunitiesSection />
    </div>
  );
}
