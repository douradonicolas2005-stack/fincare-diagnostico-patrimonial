import { useLayoutEffect, useRef } from "react"
import type { ChangeEvent } from "react"

type PhoneInputProps = {
  label: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  valid?: boolean
}

function onlyDigits(value: string) {
  let digits = value.replace(/\D/g, "")
  // Autopreenchimento do sistema às vezes inclui o código do país (+55).
  // Um número brasileiro sozinho nunca passa de 11 dígitos, então nesse
  // caso o "55" extra é o DDI, não parte do DDD/número — removê-lo antes
  // de cortar evita que os 2 últimos dígitos reais sejam descartados.
  if (digits.length > 11 && digits.startsWith("55")) {
    digits = digits.slice(2)
  }
  return digits.slice(0, 11)
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
  onChange,
  onBlur,
  error,
  valid
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
        className={`field${error ? " field-error" : valid ? " field-valid" : ""}`}
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
      />
      {error && <div className="field-error-msg">⚠ {error}</div>}
      {!error && valid && <div className="field-valid-check">✓</div>}
    </label>
  )
}
