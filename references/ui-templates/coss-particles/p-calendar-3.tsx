// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-calendar-3.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
"use client";

import type { DateRange } from "@daypicker/react";
import * as React from "react";
import { Calendar } from "@/registry/default/ui/calendar";

export default function Particle() {
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 7)),
  });

  return <Calendar mode="range" onSelect={setRange} selected={range} />;
}
