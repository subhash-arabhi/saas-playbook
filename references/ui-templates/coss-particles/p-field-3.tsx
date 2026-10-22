// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-field-3.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/registry/default/ui/field";
import { Input } from "@/registry/default/ui/input";

export default function Particle() {
  return (
    <Field disabled>
      <FieldLabel>Email</FieldLabel>
      <Input disabled placeholder="Enter your email" type="email" />
      <FieldDescription>This field is currently disabled.</FieldDescription>
    </Field>
  );
}
