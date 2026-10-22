// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-tabs-1.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/registry/default/ui/tabs";

export default function Particle() {
  return (
    <Tabs defaultValue="tab-1">
      <TabsList>
        <TabsTab value="tab-1">Tab 1</TabsTab>
        <TabsTab value="tab-2">Tab 2</TabsTab>
        <TabsTab value="tab-3">Tab 3</TabsTab>
      </TabsList>
      <TabsPanel value="tab-1">
        <p className="p-4 text-center text-muted-foreground text-xs">
          Tab 1 content
        </p>
      </TabsPanel>
      <TabsPanel value="tab-2">
        <p className="p-4 text-center text-muted-foreground text-xs">
          Tab 2 content
        </p>
      </TabsPanel>
      <TabsPanel value="tab-3">
        <p className="p-4 text-center text-muted-foreground text-xs">
          Tab 3 content
        </p>
      </TabsPanel>
    </Tabs>
  );
}
