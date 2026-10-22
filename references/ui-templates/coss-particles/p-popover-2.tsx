// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-popover-2.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
"use client";

import { XIcon } from "lucide-react";
import { Button } from "@/registry/default/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverDescription,
  PopoverPopup,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/default/ui/popover";

export default function Particle() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        Open Popover
      </PopoverTrigger>
      <PopoverPopup className="w-80">
        <PopoverClose
          aria-label="Close"
          className="absolute end-2 top-2"
          render={<Button size="icon" variant="ghost" />}
        >
          <XIcon />
        </PopoverClose>
        <div className="mb-2">
          <PopoverTitle className="text-base">Notifications</PopoverTitle>
          <PopoverDescription>
            You are all caught up. Good job!
          </PopoverDescription>
        </div>
        <PopoverClose render={<Button variant="outline" />}>Close</PopoverClose>
      </PopoverPopup>
    </Popover>
  );
}
