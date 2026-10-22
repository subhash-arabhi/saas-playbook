// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-input-group-2.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import { MailIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/default/ui/input-group";

export default function Particle() {
  return (
    <InputGroup>
      <InputGroupInput aria-label="Email" placeholder="Email" type="email" />
      <InputGroupAddon align="inline-end">
        <MailIcon aria-hidden="true" />
      </InputGroupAddon>
    </InputGroup>
  );
}
