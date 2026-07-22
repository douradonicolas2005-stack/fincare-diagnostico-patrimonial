type ExecutiveMetricProps = {
  label: string
  value: string
}

export function ExecutiveMetric({ label, value }: ExecutiveMetricProps) {
  return (
    <div className="exec-card">
      <div className="e-label">{label}</div>
      <div className="e-value">{value}</div>
    </div>
  )
}
