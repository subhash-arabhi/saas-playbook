// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-context-menu-3.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuPopup,
  ContextMenuSub,
  ContextMenuSubPopup,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/registry/default/ui/context-menu";

export default function Particle() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-32 w-full max-w-sm items-center justify-center rounded-lg border border-dashed text-muted-foreground text-sm">
        Right click here
      </ContextMenuTrigger>
      <ContextMenuPopup>
        <ContextMenuItem>Cut</ContextMenuItem>
        <ContextMenuItem>Copy</ContextMenuItem>
        <ContextMenuItem>Paste</ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
          <ContextMenuSubPopup>
            <ContextMenuItem>Email link</ContextMenuItem>
            <ContextMenuItem>Messages</ContextMenuItem>
            <ContextMenuItem>Notes</ContextMenuItem>
          </ContextMenuSubPopup>
        </ContextMenuSub>
      </ContextMenuPopup>
    </ContextMenu>
  );
}
