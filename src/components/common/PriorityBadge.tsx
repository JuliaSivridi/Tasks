import type { Priority } from '@/types/task'
import { cn } from '@/lib/utils'

const MAP: Record<Priority, { label: string; cls: string }> = {
  urgent:    { label: 'Срочно',  cls: 'bg-red-100 text-red-700 border-red-200' },
  important: { label: 'Важно',   cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  normal:    { label: 'Обычная', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { label, cls } = MAP[priority] ?? MAP.normal
  if (priority === 'normal') return null // don't show badge for normal
  return (
    <span className={cn('text-xs px-1.5 py-0.5 rounded border font-medium', cls)}>
      {label}
    </span>
  )
}
