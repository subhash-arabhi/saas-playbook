// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-frame-3.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/registry/default/ui/frame";

export default function Particle() {
  return (
    <Frame className="w-full">
      <FrameHeader>
        <FrameTitle>Section header</FrameTitle>
        <FrameDescription>Brief description about the section</FrameDescription>
      </FrameHeader>
      <FramePanel>
        <h2 className="font-semibold text-sm">Separated panel</h2>
        <p className="text-muted-foreground text-sm">Section description</p>
      </FramePanel>
      <FramePanel>
        <h2 className="font-semibold text-sm">Separated panel</h2>
        <p className="text-muted-foreground text-sm">Section description</p>
      </FramePanel>
    </Frame>
  );
}
