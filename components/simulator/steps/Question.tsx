import type { ReactNode } from "react"

type QuestionProps = {
  eyebrow?: string
  title: string
  sub: string
  children: ReactNode
}

export function Question({
  eyebrow = "Diagnóstico patrimonial Fincare",
  title,
  sub,
  children
}: QuestionProps) {
  return (
    <div>
      <span className="q-eyebrow">{eyebrow}</span>
      <h2 className="q-title">{title}</h2>
      <p className="q-sub">{sub}</p>
      {children}
    </div>
  )
}
