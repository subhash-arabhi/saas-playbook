// Source: arhamkhnz/next-shadcn-admin-dashboard@e832f5b src/app/(main)/dashboard/roles/page.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import type { Metadata } from "next";

import { Roles } from "./_components/roles";
import { roles } from "./_components/roles-table/data";

export const metadata: Metadata = {
  title: "Open Source Roles and Permissions UI with shadcn/ui",
  description: "Explore an open source roles and permissions interface for reviewing access levels and managing roles.",
  alternates: {
    canonical: "/dashboard/roles",
  },
};

export default function Page() {
  return <Roles roles={roles} />;
}
