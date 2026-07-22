import { useLayoutEffect, useRef } from "react"
import type { ChangeEvent } from "react"

type PhoneInputProps = {
  label: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 11)
}

function formatPhone(value: string) {
  const digits = onlyDigits(value)
  if (!digits) return ""
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function caretForDigitCount(formatted: string, digitCount: number) {
  if (digitCount <= 0) return 0
  let seen = 0
  for (let index = 0; index < formatted.length; index += 1) {
    if (/\d/.test(formatted[index])) {
      seen += 1
      if (seen === digitCount) return index + 1
    }
  }
  return formatted.length
}

export function PhoneInput({
  label,
  value,
  placeholder,
  onChange
}: PhoneInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const nextCaretRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    const input = inputRef.current
    const nextCaret = nextCaretRef.current
    if (!input || nextCaret === null) return
    input.setSelectionRange(nextCaret, nextCaret)
    nextCaretRef.current = null
  }, [value])

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const rawValue = event.target.value
    const caret = event.target.selectionStart ?? rawValue.length
    const digitsBeforeCaret = onlyDigits(rawValue.slice(0, caret)).length
    const formatted = formatPhone(rawValue)
    nextCaretRef.current = caretForDigitCount(formatted, digitsBeforeCaret)
    onChange(formatted)
  }

  return (
    <label className="field-block">
      <span className="field-label">{label}</span>
      <input
        ref={inputRef}
        className="field"
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
      />
    </label>
  )
}
