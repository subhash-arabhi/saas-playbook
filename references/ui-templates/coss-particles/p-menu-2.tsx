// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-menu-2.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import { Button } from "@/registry/default/ui/button";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuTrigger,
} from "@/registry/default/ui/menu";

export default function Particle() {
  return (
    <Menu>
      <MenuTrigger openOnHover render={<Button variant="outline" />}>
        Hover me
      </MenuTrigger>
      <MenuPopup>
        <MenuItem>Item one</MenuItem>
        <MenuItem>Item two</MenuItem>
      </MenuPopup>
    </Menu>
  );
}
