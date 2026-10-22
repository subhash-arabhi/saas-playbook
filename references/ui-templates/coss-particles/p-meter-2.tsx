// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-meter-2.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import { Meter } from "@/registry/default/ui/meter";

export default function Particle() {
  return <Meter aria-label="Storage usage" value={50} />;
}
