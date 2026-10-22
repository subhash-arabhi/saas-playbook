// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-scroll-area-1.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import { ScrollArea } from "@/registry/default/ui/scroll-area";

const tags = Array.from({ length: 50 }, (_, i) => `v1.0.0-alpha.${i}`);

export default function Particle() {
  return (
    <ScrollArea className="h-64 rounded-lg border">
      <div className="px-4 py-2">
        <h4 className="mb-2 font-medium text-sm">Tags</h4>
        <div className="flex flex-col gap-1">
          {tags.map((tag) => (
            <div className="text-sm" key={tag}>
              {tag}
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
