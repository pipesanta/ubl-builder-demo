import { useState, type ReactNode } from 'react'

interface SectionProps {
  title: string
  description?: string
  defaultOpen?: boolean
  children: ReactNode
}

export function Section({ title, description, defaultOpen = false, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="section">
      <div className="section__header" onClick={() => setOpen(!open)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="section__title">{title}</span>
          {description && <span className="section__description">{description}</span>}
        </div>
        <span className={`section__chevron ${open ? 'section__chevron--open' : ''}`}>
          ▼
        </span>
      </div>
      {open && <div className="section__body">{children}</div>}
    </div>
  )
}
