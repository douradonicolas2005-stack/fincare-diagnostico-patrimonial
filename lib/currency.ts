const integerFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0,
  useGrouping: true
})

function splitCurrencyInput(value: string) {
  const cleaned = value.replace(/[^\d,]/g, "")
  const commaIndex = cleaned.indexOf(",")
  const hasDecimalSeparator = commaIndex >= 0
  const integerPart = (commaIndex >= 0 ? cleaned.slice(0, commaIndex) : cleaned) || "0"
  const decimalPart = commaIndex >= 0 ? cleaned.slice(commaIndex + 1).slice(0, 2) : ""
  const integerDigits = integerPart.replace(/^0+(?=\d)/, "")

  return {
    integerDigits,
    decimalPart,
    hasDecimalSeparator
  }
}

export function formatCurrencyInput(value: number | string) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return ""
    return value.toLocaleString("pt-BR", {
      maximumFractionDigits: 2,
      minimumFractionDigits: Number.isInteger(value) ? 0 : 2
    })
  }

  const { integerDigits, decimalPart, hasDecimalSeparator } = splitCurrencyInput(value)
  const formattedInteger = integerFormatter.format(Number(integerDigits))
  return `${formattedInteger}${hasDecimalSeparator ? `,${decimalPart}` : ""}`
}

export function parseCurrencyInput(value: string) {
  const { integerDigits, decimalPart } = splitCurrencyInput(value)
  const parsed = Number(`${integerDigits}.${decimalPart || "0"}`)
  return Number.isFinite(parsed) ? parsed : 0
}

export function digitsBeforeCaret(value: string, caret: number) {
  return value.slice(0, caret).replace(/\D/g, "").length
}

export function caretAfterCurrencyInput(value: string, digitCount: number, hasComma: boolean) {
  if (digitCount <= 0 && !hasComma) return 0
  let digitsSeen = 0
  let commaSeen = false

  for (let index = 0; index < value.length; index += 1) {
    if (/\d/.test(value[index])) digitsSeen += 1
    if (value[index] === ",") commaSeen = true
    if (digitsSeen >= digitCount && (!hasComma || commaSeen)) return index + 1
  }

  return value.length
}
