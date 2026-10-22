'use client'

import { useState, type ReactNode } from 'react'

export function ThemeSwitch() {
  const [dark, setDark] = useState(false)
  return (
    <button
      type="button"
      aria-pressed={dark}
      onClick={() => {
        document.documentElement.classList.toggle('dark', !dark)
        setDark(!dark)
      }}
      className="rounded-md border border-border px-md py-sm text-ink active:scale-97 dark:border-border-dark dark:text-ink-dark"
    >
      {dark ? 'Light' : 'Dark'}
    </button>
  )
}

/** Remounts its children on click, so enter animations play again. */
export function Replay({ children }: { children: ReactNode }) {
  const [run, setRun] = useState(0)
  return (
    <div className="flex flex-col gap-sm">
      <div key={run}>{children}</div>
      <button type="button" onClick={() => setRun(run + 1)} className="self-start text-ink-muted underline dark:text-ink-muted-dark">
        Replay
      </button>
    </div>
  )
}
