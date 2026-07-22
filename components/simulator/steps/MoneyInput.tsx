type MoneyInputProps = {
  label: string
  value: number
  onChange: (value: string) => void
}

export function MoneyInput({ label, value, onChange }: MoneyInputProps) {
  return (
    <label className="field-block">
      <span className="field-label">{label}</span>
      <div className="prefix-input">
        <span className="prefix">R$</span>
        <input
          className="field field-money"
          type="number"
          value={value}
          onChange={event => onChange(event.target.value)}
        />
      </div>
    </label>
  )
}
