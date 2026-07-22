import type { Allocation } from "@/lib/types"

type AllocationDonutProps = { allocation: Allocation[] }

export function AllocationDonut({ allocation }: AllocationDonutProps) {
  const total =
    allocation.reduce((sum, item) => sum + (item.valor || 0), 0) || 1
  let angle = -90
  const point = (radius: number, degrees: number) => ({
    x: 60 + radius * Math.cos((degrees * Math.PI) / 180),
    y: 60 + radius * Math.sin((degrees * Math.PI) / 180)
  })

  return (
    <svg viewBox="0 0 120 120" className="h-[120px] w-[120px]">
      {allocation.map(item => {
        const span = ((item.valor || 0) / total) * 360
        const start = point(48, angle)
        const end = point(48, angle + span)
        const innerEnd = point(30, angle + span)
        const innerStart = point(30, angle)
        const path = `M ${start.x} ${start.y} A 48 48 0 ${span > 180 ? 1 : 0} 1 ${end.x} ${end.y} L ${innerEnd.x} ${innerEnd.y} A 30 30 0 ${span > 180 ? 1 : 0} 0 ${innerStart.x} ${innerStart.y} Z`
        angle += span
        return <path key={item.nome} d={path} fill={item.cor} />
      })}
    </svg>
  )
}
