// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-menu-3.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import { Button } from "@/registry/default/ui/button";
import {
  Menu,
  MenuCheckboxItem,
  MenuPopup,
  MenuTrigger,
} from "@/registry/default/ui/menu";

export default function Particle() {
  return (
    <Menu>
      <MenuTrigger render={<Button variant="outline" />}>Open menu</MenuTrigger>
      <MenuPopup>
        <MenuCheckboxItem defaultChecked>Auto save</MenuCheckboxItem>
        <MenuCheckboxItem>Notifications</MenuCheckboxItem>
      </MenuPopup>
    </Menu>
  );
}
