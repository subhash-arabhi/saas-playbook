// Source: arhamkhnz/next-shadcn-admin-dashboard@e832f5b src/app/(main)/dashboard/ecommerce/_components/recent-orders-table/schema.ts (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
export const orderFilters = ["All", "Needs action", "Unfulfilled", "Unpaid", "Returns"] as const;

export type OrderFilter = (typeof orderFilters)[number];

export type OrderRow = {
  id: string;
  date: string;
  customer: string;
  payment: "Paid" | "Pending" | "Refunded";
  total: string;
  items: string;
  fulfillment: "Fulfilled" | "Returned" | "Unfulfilled";
};
