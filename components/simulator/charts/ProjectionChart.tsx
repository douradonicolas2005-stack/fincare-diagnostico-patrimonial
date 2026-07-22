type ProjectionChartProps = {
  trajectory: number[]
  target: number
  turningPoint?: number | null
}

export function ProjectionChart({
  trajectory,
  target,
  turningPoint = null
}: ProjectionChartProps) {
  const width = 560,
    height = 260,
    padLeft = 50,
    padRight = 16,
    padTop = 20,
    padBottom = 30
  const max = Math.max(target, ...trajectory) * 1.08 || 1
  const x = (index: number) =>
    padLeft +
    (index / Math.max(1, trajectory.length - 1)) * (width - padLeft - padRight)
  const y = (value: number) =>
    height - padBottom - (value / max) * (height - padTop - padBottom)
  const path = trajectory
    .map((value, index) => `${index ? "L" : "M"} ${x(index)} ${y(value)}`)
    .join(" ")
  const point =
    turningPoint !== null && turningPoint < trajectory.length
      ? turningPoint
      : null
  const beforePath = trajectory
    .slice(0, point === null ? trajectory.length : point + 1)
    .map((value, index) => `${index ? "L" : "M"} ${x(index)} ${y(value)}`)
    .join(" ")
  const afterPath =
    point !== null && point < trajectory.length - 1
      ? trajectory
          .slice(point)
          .map((value, index) => `${index ? "L" : "M"} ${x(point + index)} ${y(value)}`)
          .join(" ")
      : ""
  const axisStep = Math.max(1, Math.floor(trajectory.length / 6))
  const pointLabelX = point === null ? 0 : Math.min(width - padRight, Math.max(padLeft, x(point)))
  const pointLabelAnchor = point !== null && x(point) > width - padRight - 70 ? "end" : "middle"
  const pointLabelY = point === null ? 0 : Math.max(padTop, y(trajectory[point]) - 24)
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      <line
        x1={padLeft}
        y1={y(target)}
        x2={width - padRight}
        y2={y(target)}
        stroke="var(--text-muted)"
        strokeWidth="1.3"
        strokeDasharray="4 4"
      />
      <text
        x={width - padRight}
        y={y(target) - 7}
        textAnchor="end"
        fontSize="10"
      >
        Necessário
      </text>
      <circle cx={x(0)} cy={y(trajectory[0])} r="4" fill="var(--gold)" />
      <text x={x(0)} y={height - 23} textAnchor="middle" fontSize="10">
        Hoje
      </text>
      <path d={beforePath || path} fill="none" stroke="var(--gold)" strokeWidth="3" />
      {afterPath && (
        <path d={afterPath} fill="none" stroke="var(--verde-claro)" strokeWidth="3" />
      )}
      {point !== null && (
        <>
          <circle
            cx={x(point)}
            cy={y(trajectory[point])}
            r="5.5"
            fill="var(--verde-medio)"
            stroke="#fff"
            strokeWidth="2"
          />
          <text
            x={pointLabelX}
            y={pointLabelY}
            textAnchor={pointLabelAnchor}
            fontSize="10"
            fontWeight="600"
            fill="var(--verde-medio)"
          >
            Ponto de Virada
          </text>
        </>
      )}
      {trajectory.map((_, index) =>
        index % axisStep === 0 ? (
          <text key={index} x={x(index)} y={height - 8} textAnchor="middle" fontSize="10">
            {index}a
          </text>
        ) : null
      )}
    </svg>
  )
}
