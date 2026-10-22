// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-alert-1.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/registry/default/ui/alert";

export default function Particle() {
  return (
    <Alert>
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        <p>Describe what can be done about it here.</p>
      </AlertDescription>
    </Alert>
  );
}
