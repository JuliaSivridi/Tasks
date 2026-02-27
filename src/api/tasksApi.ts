import { sheetsRequest, findRowIndex } from './sheetsClient'
import { SHEET_TASKS, TASK_RANGE } from '@/utils/constants'
import { taskToRow, parseTaskRows } from '@/utils/sheetsMapper'
import type { Task } from '@/types/task'
import type { SheetsGetResponse } from '@/types/sheets'

const HEADER = ['id','parent_id','folder_id','title','status','priority',
  'deadline_date','deadline_time','is_recurring','recur_type','recur_value',
  'labels','sort_order','created_at','updated_at','completed_at']

export async function fetchAllTasks(): Promise<Task[]> {
  const data = await sheetsRequest<SheetsGetResponse>('GET', `values/${TASK_RANGE}`)
  if (!data.values || data.values.length === 0) return []
  return parseTaskRows(data.values)
}

export async function appendTask(task: Task): Promise<void> {
  await sheetsRequest('POST', `values/${TASK_RANGE}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    values: [taskToRow(task)],
  })
}

export async function updateTask(task: Task): Promise<void> {
  const rowNum = await findRowIndex(SHEET_TASKS, task.id)
  if (!rowNum) {
    // Row not found: append instead
    await appendTask(task)
    return
  }
  // Range A:P covers all 16 columns including completed_at (column P)
  const range = `${SHEET_TASKS}!A${rowNum}:P${rowNum}`
  await sheetsRequest('PUT', `values/${range}?valueInputOption=RAW`, {
    range,
    majorDimension: 'ROWS',
    values: [taskToRow(task)],
  })
}

export async function ensureHeader(): Promise<void> {
  const data = await sheetsRequest<SheetsGetResponse>('GET', `values/${SHEET_TASKS}!A1:P1`)
  const row = data.values?.[0] ?? []
  if (row.length === 0) {
    // Fresh sheet: write full 16-column header
    await sheetsRequest('PUT', `values/${SHEET_TASKS}!A1:P1?valueInputOption=RAW`, {
      range: `${SHEET_TASKS}!A1:P1`,
      majorDimension: 'ROWS',
      values: [HEADER],
    })
  } else if (row.length < 16) {
    // Existing sheet missing completed_at column: add header to P1 only
    await sheetsRequest('PUT', `values/${SHEET_TASKS}!P1?valueInputOption=RAW`, {
      range: `${SHEET_TASKS}!P1`,
      majorDimension: 'ROWS',
      values: [['completed_at']],
    })
  }
}
