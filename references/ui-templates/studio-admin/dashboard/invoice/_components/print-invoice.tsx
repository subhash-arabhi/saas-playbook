// Source: arhamkhnz/next-shadcn-admin-dashboard@e832f5b src/app/(main)/dashboard/invoice/_components/print-invoice.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
"use client";

import * as React from "react";

import { createPortal } from "react-dom";

import type { InvoiceFormValues } from "./data";
import { InvoicePaper } from "./invoice-paper";

export function PrintInvoice({ invoice }: { invoice: InvoiceFormValues }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div data-print-root>
      <InvoicePaper invoice={invoice} />
    </div>,
    document.body,
  );
}
