// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-input-group-3.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/registry/default/ui/input-group";

export default function Particle() {
  return (
    <InputGroup>
      <InputGroupInput
        aria-label="Set your URL"
        className="*:[input]:ps-0!"
        placeholder="coss"
        type="search"
      />
      <InputGroupAddon>
        <InputGroupText>i.cal.com/</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  );
}
