// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-toast-1.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
"use client";

import { Button } from "@/registry/default/ui/button";
import { toastManager } from "@/registry/default/ui/toast";

export default function Particle() {
  return (
    <Button
      onClick={() => {
        toastManager.add({
          description: "Monday, January 3rd at 6:00pm",
          title: "Event has been created",
        });
      }}
      variant="outline"
    >
      Default Toast
    </Button>
  );
}
