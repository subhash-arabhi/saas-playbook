// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-calendar-2.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
"use client";
import * as React from "react";
import { Calendar } from "@/registry/default/ui/calendar";

export default function Particle() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  return (
    <Calendar
      className="[--cell-size:--spacing(11)] sm:[--cell-size:--spacing(10)]"
      mode="single"
      onSelect={setDate}
      selected={date}
    />
  );
}
