// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-avatar-1.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/registry/default/ui/avatar";

export default function Particle() {
  return (
    <Avatar>
      <AvatarImage
        alt="Luke Tracy"
        src="https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=128&h=128&dpr=2&q=80"
      />
      <AvatarFallback>LT</AvatarFallback>
    </Avatar>
  );
}
