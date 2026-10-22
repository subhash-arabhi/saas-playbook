// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-toggle-3.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import { BoldIcon } from "lucide-react";
import { Toggle } from "@/registry/default/ui/toggle";

export default function Particle() {
  return (
    <Toggle aria-label="Toggle bold" variant="outline">
      <BoldIcon />
    </Toggle>
  );
}
