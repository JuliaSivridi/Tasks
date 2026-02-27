import { useLabelsStore } from '@/store/labelsStore'

interface Props {
  labelId: string
}

export function LabelBadge({ labelId }: Props) {
  const label = useLabelsStore((s) => s.labels.find(l => l.id === labelId))
  if (!label) return null
  return (
    <span
      className="text-xs px-1.5 py-0.5 rounded-full font-medium text-white"
      style={{ backgroundColor: label.color }}
    >
      {label.name}
    </span>
  )
}
