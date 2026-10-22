// Source: arhamkhnz/next-shadcn-admin-dashboard@e832f5b src/app/(main)/dashboard/invoice/_components/invoice.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
"use client";

import { FormProvider, useForm, useWatch } from "react-hook-form";

import { defaultInvoiceValues, type InvoiceFormValues } from "./data";
import { InvoiceForm } from "./invoice-form";
import { InvoicePreview } from "./invoice-preview";

export function Invoice() {
  const form = useForm<InvoiceFormValues>({
    defaultValues: defaultInvoiceValues,
  });
  const invoice = useWatch({ control: form.control }) as InvoiceFormValues;

  return (
    <FormProvider {...form}>
      <form className="grid gap-5 xl:grid-cols-2" noValidate onSubmit={(event) => event.preventDefault()}>
        <InvoiceForm />
        <InvoicePreview invoice={invoice} />
      </form>
    </FormProvider>
  );
}
