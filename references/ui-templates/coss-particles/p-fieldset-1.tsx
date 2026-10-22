// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-fieldset-1.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/registry/default/ui/field";
import { Fieldset, FieldsetLegend } from "@/registry/default/ui/fieldset";
import { Input } from "@/registry/default/ui/input";

export default function Particle() {
  return (
    <Fieldset className="flex w-full flex-col gap-6">
      <FieldsetLegend>Billing Details</FieldsetLegend>
      <Field>
        <FieldLabel>Company</FieldLabel>
        <Input placeholder="Enter company name" type="text" />
        <FieldDescription>
          The name that will appear on invoices.
        </FieldDescription>
      </Field>

      <Field>
        <FieldLabel>Tax ID</FieldLabel>
        <Input placeholder="Enter tax identification number" type="text" />
        <FieldDescription>
          Your business tax identification number.
        </FieldDescription>
      </Field>
    </Fieldset>
  );
}
