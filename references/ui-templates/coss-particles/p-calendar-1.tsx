// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-calendar-1.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
"use client";

import * as React from "react";
import { Calendar } from "@/registry/default/ui/calendar";

export default function Particle() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return <Calendar mode="single" onSelect={setDate} selected={date} />;
}
