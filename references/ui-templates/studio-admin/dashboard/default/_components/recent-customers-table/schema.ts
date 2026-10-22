// Source: arhamkhnz/next-shadcn-admin-dashboard@e832f5b src/app/(main)/dashboard/default/_components/recent-customers-table/schema.ts (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import z from "zod";

const recentCustomersSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  plan: z.string(),
  status: z.string(),
  billing: z.string(),
  joined: z.string(),
});

export type RecentCustomerRow = z.infer<typeof recentCustomersSchema>;
