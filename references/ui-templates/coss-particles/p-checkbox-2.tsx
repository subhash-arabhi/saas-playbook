// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-checkbox-2.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import { Checkbox } from "@/registry/default/ui/checkbox";
import { Label } from "@/registry/default/ui/label";

export default function Particle() {
  return (
    <Label>
      <Checkbox defaultChecked disabled />
      Accept terms and conditions
    </Label>
  );
}
