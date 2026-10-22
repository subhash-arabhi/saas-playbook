// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-dialog-2.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
"use client";

import { useState } from "react";
import { Button } from "@/registry/default/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@/registry/default/ui/dialog";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuTrigger,
} from "@/registry/default/ui/menu";

export default function Particle() {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <>
      <Menu>
        <MenuTrigger render={<Button variant="outline" />}>
          Open menu
        </MenuTrigger>
        <MenuPopup align="start">
          <MenuItem onClick={() => setDialogOpen(true)}>Open dialog</MenuItem>
        </MenuPopup>
      </Menu>
      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Change your preferences</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>Close</DialogClose>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </>
  );
}
