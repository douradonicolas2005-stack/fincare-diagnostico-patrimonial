import type { ReactNode } from "react"

type WizardProps = {
  eyebrow?: string
  title: string
  sub?: string
  topContent?: ReactNode
  children: ReactNode
}

export function Wizard({
  eyebrow = "Diagnóstico patrimonial Fincare",
  title,
  sub,
  topContent,
  children
}: WizardProps) {
  return (
    <div>
      {topContent}
      <span className="q-eyebrow">{eyebrow}</span>
      <h2 className="q-title">{title}</h2>
      {sub && <p className="q-sub">{sub}</p>}
      {children}
    </div>
  )
}
