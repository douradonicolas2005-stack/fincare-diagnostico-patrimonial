type DialogProps = { message: string | null; onClose: () => void }

export function Dialog({ message, onClose }: DialogProps) {
  if (!message) return null
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onMouseDown={event => event.stopPropagation()}
      >
        <span className="q-eyebrow">Atenção</span>
        <h2 id="dialog-title" className="q-title">
          Confira seus dados
        </h2>
        <p className="q-sub">{message}</p>
        <button
          type="button"
          className="btn btn-primary w-full"
          onClick={onClose}
        >
          Entendi
        </button>
      </div>
    </div>
  )
}
