// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-input-3.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import { Input } from "@/registry/default/ui/input";

export default function Particle() {
  return (
    <Input
      aria-label="Enter text"
      placeholder="Enter text"
      size="lg"
      type="text"
    />
  );
}
