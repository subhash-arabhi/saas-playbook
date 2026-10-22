// Source: arhamkhnz/next-shadcn-admin-dashboard@e832f5b src/app/(main)/dashboard/crm/_components/opportunities-table/schema.ts (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import z from "zod";

const opportunitySchema = z.object({
  id: z.string(),
  account: z.string(),
  stage: z.string(),
  priority: z.number(),
  health: z.string(),
  value: z.string(),
});

export const opportunitiesSchema = z.array(opportunitySchema);

export type OpportunityRow = z.infer<typeof opportunitySchema>;
