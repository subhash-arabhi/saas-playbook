// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-kbd-1.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import { Kbd, KbdGroup } from "@/registry/default/ui/kbd";

export default function Particle() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-muted-foreground text-sm">Single keys:</p>
        <div className="flex gap-2">
          <Kbd>K</Kbd>
          <Kbd>⌘</Kbd>
          <Kbd>⌃</Kbd>
          <Kbd>⇧</Kbd>
        </div>
      </div>
      <div>
        <p className="mb-2 text-muted-foreground text-sm">Key combinations:</p>
        <div className="flex gap-2">
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>Shift</Kbd>
            <Kbd>P</Kbd>
          </KbdGroup>
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <Kbd>Alt</Kbd>
            <Kbd>Delete</Kbd>
          </KbdGroup>
        </div>
      </div>
    </div>
  );
}
