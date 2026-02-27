export type EntityType = 'task' | 'folder' | 'label'
export type OperationType = 'create' | 'update' | 'delete'
export type QueueItemStatus = 'pending' | 'processing' | 'failed'

export interface QueueItem {
  localId?: number          // Dexie auto-increment PK
  entityType: EntityType
  operationType: OperationType
  entityId: string
  payload: Record<string, unknown>
  createdAt: string
  status: QueueItemStatus
  retryCount: number
}
