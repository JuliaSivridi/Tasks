export type TaskStatus = 'pending' | 'completed' | 'deleted'
export type Priority = 'urgent' | 'important' | 'normal'
export type RecurType = 'days' | 'weeks' | 'months'

export interface Task {
  id: string
  parent_id: string
  folder_id: string
  title: string
  status: TaskStatus
  priority: Priority
  deadline_date: string  // ISO date 'YYYY-MM-DD' or ''
  deadline_time: string  // 'HH:MM' or ''
  is_recurring: boolean
  recur_type: RecurType | ''
  recur_value: number
  labels: string         // comma-separated label IDs
  sort_order: number
  created_at: string     // ISO 8601
  updated_at: string     // ISO 8601
  completed_at: string   // ISO 8601 or ''
}

export type TaskInput = Omit<Task, 'id' | 'created_at' | 'updated_at' | 'completed_at'>
