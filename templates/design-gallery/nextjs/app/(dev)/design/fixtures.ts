// Messy on purpose: every demo must survive these.
export const people = [
  { name: 'Ana Silva', email: 'ana@example.com', image: null, role: 'Owner' },
  { name: 'Maximiliano Fernández-Oyarzábal de la Fuente', email: 'maximiliano.fernandez.oyarzabal@a-very-long-company-name.example', image: null, role: 'Billing administrator' },
  { name: 'Li', email: 'li@example.com', image: null, role: 'Viewer' },
]

export const numbers = { zero: 0, small: 7, large: 1284093.5, negative: -42.75, percent: 0.1234 }

export const emptyList: { name: string }[] = []

export const longText =
  'A description long enough to wrap onto several lines on a phone, with a word that is unusually long like internationalisation, to check wrapping, truncation and line length.'

export const errors = {
  field: 'Enter an email address, like name@example.com.',
  page: "We couldn't load your invoices. Check your connection and try again.",
}
