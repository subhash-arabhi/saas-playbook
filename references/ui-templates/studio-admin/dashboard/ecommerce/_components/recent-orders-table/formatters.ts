// Source: arhamkhnz/next-shadcn-admin-dashboard@e832f5b src/app/(main)/dashboard/ecommerce/_components/recent-orders-table/formatters.ts (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import type React from "react";

import type { OrderFilter } from "./schema";

export function formatOrderCount(filter: OrderFilter, count: number) {
  const orderLabel = count === 1 ? "order" : "orders";

  if (filter === "All") {
    return `${count.toLocaleString()} ${orderLabel}`;
  }

  if (filter === "Needs action") {
    return `${count.toLocaleString()} ${orderLabel} need action`;
  }

  if (filter === "Returns") {
    return `${count.toLocaleString()} ${count === 1 ? "return" : "returns"}`;
  }

  return `${count.toLocaleString()} ${filter.toLowerCase()} ${orderLabel}`;
}

export function formatSelectedOrderCount(count: number) {
  const orderLabel = count === 1 ? "order" : "orders";

  return `${count.toLocaleString()} ${orderLabel} selected`;
}

export function preventPaginationNavigation(event: React.MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
}
