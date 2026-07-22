import type { ReactNode } from "react"

type ButtonVariant = "primary" | "gold" | "ghost"

type ButtonProps = {
  children: ReactNode
  onClick?: () => void
  variant?: ButtonVariant
  className?: string
  disabled?: boolean
}

export function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false
}: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} ${className}`}
    >
      {children}
    </button>
  )
}
