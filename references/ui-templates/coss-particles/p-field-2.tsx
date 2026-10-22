// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-field-2.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import { Field, FieldError, FieldLabel } from "@/registry/default/ui/field";
import { Input } from "@/registry/default/ui/input";

export default function Particle() {
  return (
    <Field>
      <FieldLabel>
        Password <span className="text-destructive-foreground">*</span>
      </FieldLabel>
      <Input placeholder="Enter password" required type="password" />
      <FieldError>Please fill out this field.</FieldError>
    </Field>
  );
}
