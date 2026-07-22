import type { ReactNode } from "react"

type SelectProps = {
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
  placeholder?: string | null
}

export function Select({
  label,
  value,
  onChange,
  children,
  placeholder = "Selecione..."
}: SelectProps) {
  return (
    <label className="field-block">
      <span className="field-label">{label}</span>
      <span className="select-wrap">
        <select
          className="field field-select"
          value={value}
          onChange={event => onChange(event.target.value)}
        >
          {placeholder !== null && <option value="">{placeholder}</option>}
          {children}
        </select>
      </span>
    </label>
  )
}
