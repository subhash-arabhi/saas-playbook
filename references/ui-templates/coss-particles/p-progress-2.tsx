// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-progress-2.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@/registry/default/ui/progress";

export default function Particle() {
  return (
    <Progress value={60}>
      <div className="flex items-center justify-between gap-2">
        <ProgressLabel>Export data</ProgressLabel>
        <ProgressValue />
      </div>
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </Progress>
  );
}
