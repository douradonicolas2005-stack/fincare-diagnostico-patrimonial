import { useEffect, useRef, useState } from "react"
import {
  caretAfterCurrencyInput,
  digitsBeforeCaret,
  formatCurrencyInput,
  parseCurrencyInput
} from "@/lib/currency"

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
  const [displayValue, setDisplayValue] = useState(
    value === 0 ? "" : formatCurrencyInput(value)
  )
  const inputRef = useRef<HTMLInputElement>(null)
  const nextCaretRef = useRef<number | null>(null)
  const lastEmittedValueRef = useRef(value)

  useEffect(() => {
    if (value === lastEmittedValueRef.current) return
    lastEmittedValueRef.current = value
    setDisplayValue(value === 0 ? "" : formatCurrencyInput(value))
  }, [emptyWhenZero, value])

  useEffect(() => {
    if (nextCaretRef.current === null || !inputRef.current) return
    const caret = nextCaretRef.current
    inputRef.current.setSelectionRange(caret, caret)
    nextCaretRef.current = null
  }, [displayValue])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value
    const caret = event.target.selectionStart ?? rawValue.length
    const formattedValue = formatCurrencyInput(rawValue)
    const numericValue = parseCurrencyInput(formattedValue)
    const hasCommaBeforeCaret = rawValue.slice(0, caret).includes(",")
    const numericDigitsBeforeCaret = digitsBeforeCaret(rawValue, caret)

    nextCaretRef.current = caretAfterCurrencyInput(
      formattedValue,
      numericDigitsBeforeCaret,
      hasCommaBeforeCaret
    )
    lastEmittedValueRef.current = numericValue
    setDisplayValue(formattedValue)
    onChange(String(numericValue))
  }

  const handleBlur = () => {
    const numericValue = parseCurrencyInput(displayValue)
    setDisplayValue(numericValue === 0 ? "" : formatCurrencyInput(numericValue))
  }

  return (
    <label className="field-block">
      <span className="field-label">{label}</span>
      <div className="prefix-input">
        <span className="prefix">R$</span>
        <input
          ref={inputRef}
          className="field field-money"
          type="text"
          value={displayValue}
          placeholder="0,00"
          inputMode="decimal"
          autoComplete="off"
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </div>
    </label>
  )
}
