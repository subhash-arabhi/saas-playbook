// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-drawer-2.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import { Button } from "@/registry/default/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPopup,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/default/ui/drawer";

export default function Particle() {
  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline" />}>
        Open drawer
      </DrawerTrigger>
      <DrawerPopup>
        <DrawerHeader className="text-center">
          <DrawerTitle>Notifications</DrawerTitle>
          <DrawerDescription>
            This is the description of the drawer.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter
          className="justify-center sm:justify-center"
          variant="bare"
        >
          <DrawerClose render={<Button variant="outline" />}>Close</DrawerClose>
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  );
}
