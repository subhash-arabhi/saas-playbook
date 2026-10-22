// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-meter-1.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import {
  Meter,
  MeterIndicator,
  MeterLabel,
  MeterTrack,
  MeterValue,
} from "@/registry/default/ui/meter";

export default function Particle() {
  return (
    <Meter value={75}>
      <div className="flex items-center justify-between gap-2">
        <MeterLabel>Storage usage</MeterLabel>
        <MeterValue />
      </div>
      <MeterTrack>
        <MeterIndicator />
      </MeterTrack>
    </Meter>
  );
}
