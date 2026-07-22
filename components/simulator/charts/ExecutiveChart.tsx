type ExecutiveChartProps = {
  trajectory: number[]
  target: number
  turningPoint?: number | null
}

export function ExecutiveChart({
  trajectory,
  target,
  turningPoint = null
}: ExecutiveChartProps) {
  const width = 560
  const height = 200
  const padLeft = 44
  const padRight = 18
  const padTop = 20
  const padBottom = 24
  const max = Math.max(target, ...trajectory) * 1.08 || 1
  const x = (index: number) =>
    padLeft +
    (index / Math.max(1, trajectory.length - 1)) *
      (width - padLeft - padRight)
  const y = (value: number) =>
    height -
    padBottom -
    (value / max) * (height - padTop - padBottom)
  const targetY = y(target)
  const path = trajectory
    .map((value, index) => `${index ? "L" : "M"} ${x(index)} ${y(value)}`)
    .join(" ")
  const point =
    turningPoint !== null && turningPoint !== undefined && turningPoint < trajectory.length
      ? turningPoint
      : null
  const pointX = point === null ? null : x(point)
  const pointY = point === null ? null : y(trajectory[point])
  const axisStep = Math.max(1, Math.floor(trajectory.length / 6))

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="executive-chart" role="img" aria-label="Trajetória patrimonial projetada">
      <line
        x1={padLeft}
        y1={targetY}
        x2={width - padRight}
        y2={targetY}
        stroke="var(--text-muted)"
        strokeWidth="1.2"
        strokeDasharray="4 4"
      />
      <text x={width - padRight - 2} y={Math.max(padTop + 8, targetY - 8)} textAnchor="end" fontSize="8.5" fontWeight="600">
        Ponto de Virada
      </text>
      <text x={width - padRight - 2} y={Math.max(padTop + 19, targetY + 3)} textAnchor="end" fontSize="8.5">
        Necessário
      </text>
      <path d={path} fill="none" stroke="var(--verde-medio)" strokeWidth="2.8" />
      <circle cx={x(0)} cy={y(trajectory[0])} r="3.5" fill="var(--verde-medio)" />
      <text x={x(0)} y={height - 7} textAnchor="middle" fontSize="9">
        Hoje
      </text>
      {pointX !== null && pointY !== null && (
        <circle cx={pointX} cy={pointY} r="4.5" fill="var(--verde-medio)" stroke="var(--surface)" strokeWidth="1.5" />
      )}
      {trajectory.map((_, index) =>
        index % axisStep === 0 ? (
          <text key={index} x={x(index)} y={height - 7} textAnchor="middle" fontSize="9">
            {index}a
          </text>
        ) : null
      )}
    </svg>
  )
}
