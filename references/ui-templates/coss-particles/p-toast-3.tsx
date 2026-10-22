// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-toast-3.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
"use client";

import { Button } from "@/registry/default/ui/button";
import { toastManager } from "@/registry/default/ui/toast";

export default function Particle() {
  return (
    <Button
      onClick={() => {
        toastManager.add({
          description: "Please wait while we process your request.",
          title: "Loading…",
          type: "loading",
        });
      }}
      variant="outline"
    >
      Loading Toast
    </Button>
  );
}
