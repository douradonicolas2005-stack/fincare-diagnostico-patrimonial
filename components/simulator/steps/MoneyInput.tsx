type MoneyInputProps = {
  label: string
  value: number
  onChange: (value: string) => void
  emptyWhenZero?: boolean
}

export function MoneyInput({
  label,
  value,
  onChange,
  emptyWhenZero = false
}: MoneyInputProps) {
  return (
    <label className="field-block">
      <span className="field-label">{label}</span>
      <div className="prefix-input">
        <span className="prefix">R$</span>
        <input
          className="field field-money"
          type="number"
          value={emptyWhenZero && value === 0 ? "" : value}
          placeholder={emptyWhenZero ? "0" : undefined}
          inputMode="numeric"
          step="10000"
          onChange={event => onChange(event.target.value)}
        />
      </div>
    </label>
  )
}
