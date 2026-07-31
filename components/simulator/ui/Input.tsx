type InputProps = {
  label: string
  value: string | number
  onChange: (value: string) => void
  type?: string
  name?: string
  placeholder?: string
  required?: boolean
  onBlur?: () => void
  error?: string
  valid?: boolean
}

export function Input({
  label,
  value,
  onChange,
  type = "text",
  onBlur,
  error,
  valid,
  ...props
}: InputProps) {
  return (
    <label className="field-block">
      <span className="field-label">{label}</span>
      <input
        className={`field${error ? " field-error" : valid ? " field-valid" : ""}`}
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error && <div className="field-error-msg">⚠ {error}</div>}
      {!error && valid && <div className="field-valid-check">✓</div>}
    </label>
  )
}
