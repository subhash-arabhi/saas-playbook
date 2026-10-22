import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { readDesignMd, statusOf, type DesignMd } from './design-md'
import { demos, type Demo } from './registry'
import { ThemeSwitch, Replay } from './gallery-client'

export const metadata = { title: 'Design gallery', robots: { index: false } }

const GROUPS = ['Actions', 'Inputs & forms', 'Navigation', 'Data display', 'Feedback', 'Overlays', 'Layout & content']

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="flex flex-col gap-lg border-t border-border py-xl dark:border-border-dark">
      <h2 className="text-headline-md">{title}</h2>
      {children}
    </section>
  )
}

function Status({ status }: { status: string }) {
  const tone = status === 'approved' ? 'bg-success text-on-primary' : status === 'proposed' ? 'bg-warning text-on-primary' : 'bg-error text-on-primary'
  return <span className={`rounded-full px-sm py-xs text-label-sm ${tone}`}>{status}</span>
}

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-xs">
      <div className="h-12 rounded-md border border-border dark:border-border-dark" style={{ background: value }} title={value} />
      <code className="truncate text-label-sm text-ink-muted dark:text-ink-muted-dark">{name}</code>
    </div>
  )
}

function Colors({ design }: { design: DesignMd }) {
  const names = Object.keys(design.colors)
  const step = (n: string) => n.match(/^(neutral|accent)-\d+(-dark)?(?:-option-(\w+))?$/)
  const pick = (prefix: string, dark: boolean, o?: string) =>
    names.filter((n) => {
      const m = step(n)
      return m !== null && m[1] === prefix && Boolean(m[2]) === dark && m[3] === o
    })
  const scale = (prefix: string, dark: boolean) => pick(prefix, dark)
  const options = [...new Set(names.map((n) => step(n)?.[3]).filter(Boolean))] as string[]
  const option = (o: string, dark: boolean) => pick('accent', dark, o)
  const semantic = names.filter((n) => !step(n))
  const row = (key: string, label: string, swatches: string[]) => (
    <div key={key} className="flex flex-col gap-sm">
      <h3 className="text-label-md">{label}</h3>
      <div className="grid grid-cols-6 gap-sm md:grid-cols-12">{swatches.map((n) => <Swatch key={n} name={n} value={design.colors[n]} />)}</div>
    </div>
  )
  return (
    <Section id="colors" title="Colours">
      {['neutral', 'accent'].flatMap((prefix) => [false, true].map((dark) => row(`${prefix}${dark}`, `${prefix}, ${dark ? 'dark' : 'light'}`, scale(prefix, dark))))}
      {options.flatMap((o) => [false, true].map((dark) => row(`option-${o}${dark}`, `accent option ${o}, ${dark ? 'dark' : 'light'}`, option(o, dark))))}
      <h3 className="text-label-md">Semantic and charts</h3>
      <div className="grid grid-cols-3 gap-sm md:grid-cols-6">{semantic.map((n) => <Swatch key={n} name={n} value={design.colors[n]} />)}</div>
    </Section>
  )
}

function Typography({ design }: { design: DesignMd }) {
  return (
    <Section id="typography" title="Typography">
      {Object.entries(design.typography).map(([name, t]) => (
        <div key={name} className="flex flex-col gap-xs">
          <p
            className="truncate"
            style={{ fontFamily: t.fontFamily, fontSize: t.fontSize, fontWeight: Number(t.fontWeight) || undefined, letterSpacing: t.letterSpacing, lineHeight: t.lineHeight, fontFeatureSettings: t.fontFeature }}
          >
            {name === 'numeric' ? '1,284,093.50 −42.75 12.34%' : 'Invoices are sent on the first working day'}
          </p>
          <code className="text-label-sm text-ink-muted dark:text-ink-muted-dark">{`${name} · ${Object.values(t).join(' · ')}`}</code>
        </div>
      ))}
    </Section>
  )
}

function Scales({ design }: { design: DesignMd }) {
  const durations = Object.entries(design.motion).filter(([k]) => k.startsWith('duration-'))
  const easings = Object.entries(design.motion).filter(([k]) => k.startsWith('ease-'))
  return (
    <Section id="scales" title="Spacing, radius and motion">
      <div className="flex flex-col gap-sm">
        {Object.entries(design.spacing).map(([name, value]) => (
          <div key={name} className="flex items-center gap-md">
            <code className="w-40 shrink-0 text-label-sm">{`${name} ${value}`}</code>
            <div className="h-3 max-w-full rounded-sm bg-accent-9" style={{ width: value }} />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-md">
        {Object.entries(design.rounded).map(([name, value]) => (
          <div key={name} className="flex flex-col items-center gap-xs">
            <div className="size-16 border border-border bg-surface-raised dark:border-border-dark dark:bg-surface-raised-dark" style={{ borderRadius: value }} />
            <code className="text-label-sm">{`${name} ${value}`}</code>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-sm">
        {[
          ...durations.map(([d, dv]) => [`${d} ${dv}`, dv, easings[0]?.[1] ?? 'ease-out'] as const),
          ...easings.map(([e, ev]) => [`${e} ${ev}`, durations.at(-1)?.[1] ?? '400ms', ev] as const),
        ].map(([label, duration, easing]) => (
          <Replay key={label}>
            <div className="flex flex-col gap-xs md:flex-row md:items-center md:gap-md">
              <code className="shrink-0 text-label-sm md:w-80">{label}</code>
              <div className="relative h-3 w-full overflow-hidden rounded-full md:flex-1 bg-neutral-3 dark:bg-neutral-3-dark" style={{ containerType: 'inline-size' }}>
                <div className="gallery-slide absolute inset-y-0 left-0 w-3 rounded-full bg-accent-9" style={{ animationDuration: duration, animationTimingFunction: easing }} />
              </div>
            </div>
          </Replay>
        ))}
      </div>
    </Section>
  )
}

function DemoCard({ demo, design }: { demo: Demo; design: DesignMd }) {
  const states = demo.states.map((s) => (
    <div key={s.label} className="flex min-w-0 flex-col gap-sm">
      <span className="text-label-sm text-ink-muted dark:text-ink-muted-dark">{s.label}</span>
      {s.render()}
    </div>
  ))
  return (
    <article className="flex flex-col gap-md rounded-lg border border-border bg-surface p-lg dark:border-border-dark dark:bg-surface-dark">
      <header className="flex items-center justify-between gap-md">
        <h3 className="text-headline-sm">{demo.name}</h3>
        <Status status={statusOf(design, demo.name)} />
      </header>
      <div className={demo.kind === 'component' ? 'flex flex-wrap items-start gap-lg' : 'flex flex-col gap-lg'}>
        {demo.kind === 'motion' ? <Replay>{states}</Replay> : states}
      </div>
    </article>
  )
}

export default function DesignGallery() {
  if (process.env.NODE_ENV === 'production') notFound()
  const design = readDesignMd()
  const counts = { approved: design.approvals.filter((a) => a.status === 'approved').length, proposed: design.approvals.filter((a) => a.status === 'proposed').length }
  const kinds: [Demo['kind'], string][] = [['pattern', 'Patterns'], ['marketing', 'Marketing sections'], ['motion', 'Motion inventory']]
  return (
    <main className="min-h-screen bg-background px-page-x-mobile text-ink md:px-page-x-desktop dark:bg-background-dark dark:text-ink-dark">
      <style>{'@keyframes gallery-slide{from{transform:translateX(0)}to{transform:translateX(calc(100cqw - 100%))}}.gallery-slide{animation-name:gallery-slide;animation-fill-mode:both}@media (prefers-reduced-motion:reduce){.gallery-slide{animation:none}}'}</style>
      <div className="mx-auto flex max-w-content-max flex-col">
        <header className="flex flex-wrap items-center justify-between gap-md py-lg">
          <div className="flex flex-col gap-xs">
            <h1 className="text-headline-lg">{design.name || 'Design gallery'}</h1>
            <p className="text-body-sm text-ink-muted dark:text-ink-muted-dark">{`${counts.approved} approved · ${counts.proposed} proposed · from DESIGN.md`}</p>
          </div>
          <ThemeSwitch />
        </header>
        <Colors design={design} />
        <Typography design={design} />
        <Scales design={design} />
        <Section id="components" title="Components">
          {GROUPS.map((group) => {
            const items = demos.filter((d) => d.kind === 'component' && d.group === group)
            return items.length ? (
              <div key={group} className="flex flex-col gap-md">
                <h3 className="text-label-md text-ink-muted dark:text-ink-muted-dark">{group}</h3>
                {items.map((d) => <DemoCard key={d.name} demo={d} design={design} />)}
              </div>
            ) : null
          })}
        </Section>
        {kinds.map(([kind, title]) => {
          const items = demos.filter((d) => d.kind === kind)
          return items.length ? (
            <Section key={kind} id={kind} title={title}>
              {items.map((d) => <DemoCard key={d.name} demo={d} design={design} />)}
            </Section>
          ) : null
        })}
      </div>
    </main>
  )
}
