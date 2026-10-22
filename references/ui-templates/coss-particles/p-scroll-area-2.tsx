// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-scroll-area-2.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import { ScrollArea } from "@/registry/default/ui/scroll-area";

export default function Particle() {
  return (
    <ScrollArea className="max-w-96 rounded-lg border">
      <div className="flex w-max gap-4 p-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            className="flex h-20 w-32 shrink-0 items-center justify-center rounded-md bg-muted"
            key={String(i)}
          >
            <span className="font-medium text-sm">Item {i + 1}</span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
