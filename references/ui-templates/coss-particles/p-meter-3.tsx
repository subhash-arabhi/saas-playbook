// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-meter-3.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
"use client";

import {
  Meter,
  MeterIndicator,
  MeterLabel,
  MeterTrack,
  MeterValue,
} from "@/registry/default/ui/meter";

export default function Particle() {
  return (
    <Meter max={5} value={3}>
      <div className="flex items-center justify-between gap-2">
        <MeterLabel>Rating</MeterLabel>
        <MeterValue>{(_formatted, value) => `${value} / 5`}</MeterValue>
      </div>
      <MeterTrack>
        <MeterIndicator />
      </MeterTrack>
    </Meter>
  );
}
