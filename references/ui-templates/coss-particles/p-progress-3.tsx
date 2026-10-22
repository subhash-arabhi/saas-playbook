// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-progress-3.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
"use client";

import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@/registry/default/ui/progress";

export default function Particle() {
  return (
    <Progress max={512} value={502}>
      <div className="flex items-center justify-between gap-2">
        <ProgressLabel>Upload</ProgressLabel>
        <ProgressValue>{(_formatted, value) => `${value} / 512`}</ProgressValue>
      </div>
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </Progress>
  );
}
