type GaugeProps = { percentage: number }

export function Gauge({ percentage }: GaugeProps) {
  const angle = 180 - (Math.max(0, Math.min(100, percentage)) / 100) * 180
  const point = (radius: number, degrees: number) => ({
    x: 110 + radius * Math.cos((degrees * Math.PI) / 180),
    y: 110 - radius * Math.sin((degrees * Math.PI) / 180)
  })
  const end = point(90, angle)

  return (
    <svg viewBox="0 0 220 130" className="mx-auto w-full max-w-[220px]">
      <defs>
        <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--verde-escuro)" />
          <stop offset="55%" stopColor="var(--gold)" />
          <stop offset="100%" stopColor="var(--verde-claro)" />
        </linearGradient>
      </defs>
      <path
        d="M20 110 A90 90 0 0 1 200 110"
        fill="none"
        stroke="var(--surface-alt)"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d={`M20 110 A90 90 0 0 1 ${end.x} ${end.y}`}
        fill="none"
        stroke="url(#gauge-gradient)"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <line
        x1="110"
        y1="110"
        x2={end.x}
        y2={end.y}
        stroke="var(--text)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="110" cy="110" r="5" fill="var(--text)" />
      <text x="20" y="130" fontSize="10" textAnchor="middle">
        0%
      </text>
      <text x="200" y="130" fontSize="10" textAnchor="middle">
        100%
      </text>
    </svg>
  )
}
