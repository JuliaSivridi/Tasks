import { formatDeadline, isOverdue, isDueToday } from '@/utils/dateUtils'
import { cn } from '@/lib/utils'

interface Props {
  deadlineDate: string
  deadlineTime: string
}

export function DeadlineBadge({ deadlineDate, deadlineTime }: Props) {
  if (!deadlineDate) return null
  const label = formatDeadline(deadlineDate, deadlineTime)
  const overdue = isOverdue(deadlineDate)
  const today = isDueToday(deadlineDate)

  return (
    <span className={cn(
      'text-xs px-1.5 py-0.5 rounded font-medium',
      overdue && 'text-red-600 bg-red-50',
      today && !overdue && 'text-blue-600 bg-blue-50',
      !overdue && !today && 'text-slate-500',
    )}>
      {label}
    </span>
  )
}
