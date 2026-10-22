// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-alert-3.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import { InfoIcon } from "lucide-react";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/registry/default/ui/alert";
import { Button } from "@/registry/default/ui/button";

export default function Particle() {
  return (
    <Alert>
      <InfoIcon />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        Describe what can be done about it here.
      </AlertDescription>
      <AlertAction>
        <Button size="xs" variant="ghost">
          Dismiss
        </Button>
        <Button size="xs">Ok</Button>
      </AlertAction>
    </Alert>
  );
}
