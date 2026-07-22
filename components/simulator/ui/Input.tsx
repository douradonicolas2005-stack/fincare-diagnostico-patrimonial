type InputProps = {
  label: string
  value: string | number
  onChange: (value: string) => void
  type?: string
  name?: string
  placeholder?: string
  required?: boolean
}

export function Input({
  label,
  value,
  onChange,
  type = "text",
  ...props
}: InputProps) {
  return (
    <label className="field-block">
      <span className="field-label">{label}</span>
      <input
        className="field"
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        {...props}
      />
    </label>
  )
}
