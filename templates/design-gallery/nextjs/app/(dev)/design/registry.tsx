import type { ReactNode } from 'react'
import { people, errors } from './fixtures'

export type Demo = {
  /** The item's name as it appears in the DESIGN.md Approvals table. */
  name: string
  kind: 'component' | 'pattern' | 'marketing' | 'motion'
  /** For components: the DESIGN.md group (Actions, Inputs & forms, Navigation, Data display, Feedback, Overlays, Layout & content). */
  group?: string
  states: { label: string; render: () => ReactNode }[]
}

// One entry per component, pattern, marketing section and motion moment in DESIGN.md.
// Render the project's real components (e.g. from '@/components/ui/button'), never copies.
// The example below uses plain elements so the gallery runs before any component exists; replace it.
const exampleButton = (label: string, extra = '') => (
  <button type="button" className={`h-9 rounded-md bg-primary px-md text-on-primary transition-transform duration-100 active:scale-97 disabled:bg-neutral-3 disabled:text-neutral-11 ${extra}`}>
    {label}
  </button>
)

export const demos: Demo[] = [
  {
    name: 'Button',
    kind: 'component',
    group: 'Actions',
    states: [
      { label: 'Default', render: () => exampleButton('Save changes') },
      { label: 'Focus-visible', render: () => exampleButton('Save changes', 'outline-2 outline-offset-2 outline-focus') },
      { label: 'Disabled', render: () => <button type="button" disabled className="h-9 rounded-md bg-neutral-3 px-md text-neutral-11">Save changes</button> },
      { label: 'Long label', render: () => exampleButton(`Invite ${people[1].name}`) },
    ],
  },
  {
    name: 'Text input',
    kind: 'component',
    group: 'Inputs & forms',
    states: [
      { label: 'Default', render: () => <input name="email" autoComplete="email" aria-label="Email" placeholder="name@example.com" className="h-9 rounded-md border border-border bg-surface-raised px-sm text-ink" /> },
      {
        label: 'Error',
        render: () => (
          <div className="flex flex-col gap-xs">
            <input name="email-error" autoComplete="email" aria-label="Email" aria-invalid defaultValue="ana@" className="h-9 rounded-md border border-error bg-surface-raised px-sm text-ink" />
            <p className="text-error">{errors.field}</p>
          </div>
        ),
      },
    ],
  },
]
