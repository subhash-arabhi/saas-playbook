// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-slider-1.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
"use client";

import { Slider } from "@/registry/default/ui/slider";

export default function Particle() {
  return <Slider getAriaLabel={() => "Value"} defaultValue={50} />;
}
