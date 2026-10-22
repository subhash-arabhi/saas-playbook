// Source: cosscom/ui@3d8ca28 apps/ui/registry/default/particles/p-accordion-2.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/registry/default/ui/accordion";

export default function Particle() {
  return (
    <Accordion className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is Base UI?</AccordionTrigger>
        <AccordionPanel>
          Base UI is a library of high-quality unstyled React components for
          design systems and web apps.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How do I get started?</AccordionTrigger>
        <AccordionPanel>
          Head to the "Quick start" guide in the docs. If you've used unstyled
          libraries before, you'll feel at home.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Can I use it for my project?</AccordionTrigger>
        <AccordionPanel>
          Of course! Base UI is free and open source.
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
