import { useEffect, useMemo, useRef, useState } from "react"

export const states = [
  ["AC", "Acre"], ["AL", "Alagoas"], ["AP", "Amapá"], ["AM", "Amazonas"],
  ["BA", "Bahia"], ["CE", "Ceará"], ["DF", "Distrito Federal"], ["ES", "Espírito Santo"],
  ["GO", "Goiás"], ["MA", "Maranhão"], ["MT", "Mato Grosso"], ["MS", "Mato Grosso do Sul"],
  ["MG", "Minas Gerais"], ["PA", "Pará"], ["PB", "Paraíba"], ["PR", "Paraná"],
  ["PE", "Pernambuco"], ["PI", "Piauí"], ["RJ", "Rio de Janeiro"], ["RN", "Rio Grande do Norte"],
  ["RS", "Rio Grande do Sul"], ["RO", "Rondônia"], ["RR", "Roraima"], ["SC", "Santa Catarina"],
  ["SP", "São Paulo"], ["SE", "Sergipe"], ["TO", "Tocantins"]
] as const

type StateSelectProps = { value: string; onChange: (value: string) => void }

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

export function StateSelect({ value, onChange }: StateSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const selected = states.find(([code]) => code === value)
  const selectedName = selected?.[1] || "Selecione"
  const filteredStates = useMemo(() => {
    const search = normalize(query.trim())
    if (!search) return states
    const exactCode = states.filter(([code]) => normalize(code) === search)
    if (exactCode.length) return exactCode
    return states.filter(([, name]) => normalize(name).includes(search))
  }, [query])

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [])

  function openSearch() {
    if (!open) {
      setOpen(true)
      setQuery("")
      requestAnimationFrame(() => inputRef.current?.select())
    }
  }

  function selectState(code: string) {
    onChange(code)
    setQuery("")
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="field-block state-combobox">
      <span className="field-label">Estado</span>
      <div className="select-wrap">
        <input
          ref={inputRef}
          className="field field-select state-select-input"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls="state-options"
          value={open ? query : selectedName}
          placeholder="Selecione"
          onFocus={openSearch}
          onClick={openSearch}
          onChange={event => { setOpen(true); setQuery(event.target.value) }}
          onKeyDown={event => {
            if (event.key === "Escape") { setQuery(""); setOpen(false) }
            if (event.key === "Enter" && filteredStates[0]) {
              event.preventDefault()
              selectState(filteredStates[0][0])
            }
          }}
        />
        {open && (
          <div id="state-options" className="state-options" role="listbox">
            {filteredStates.length ? filteredStates.map(([code, name]) => (
              <button
                key={code}
                type="button"
                className={`state-option ${value === code ? "selected" : ""}`}
                role="option"
                aria-selected={value === code}
                onMouseDown={event => event.preventDefault()}
                onClick={() => selectState(code)}
              >
                {name}
              </button>
            )) : <span className="state-empty">Nenhum estado encontrado</span>}
          </div>
        )}
      </div>
    </div>
  )
}
