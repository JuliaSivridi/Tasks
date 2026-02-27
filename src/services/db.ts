import Dexie, { type Table } from 'dexie'
import type { Task } from '@/types/task'
import type { Folder } from '@/types/folder'
import type { Label } from '@/types/label'
import type { QueueItem } from '@/types/sync'

export class TaskManagerDB extends Dexie {
  tasks!: Table<Task>
  folders!: Table<Folder>
  labels!: Table<Label>
  queue!: Table<QueueItem>

  constructor() {
    super('TaskManagerDB')
    this.version(1).stores({
      tasks:   '&id, parent_id, folder_id, status, updated_at',
      folders: '&id, parent_id',
      labels:  '&id',
      queue:   '++localId, entityType, operationType, status, createdAt',
    })
  }
}

export const db = new TaskManagerDB()
