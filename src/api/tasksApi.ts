import { sheetsRequest, findRowIndex } from './sheetsClient'
import { SHEET_TASKS, TASK_RANGE } from '@/utils/constants'
import { taskToRow, parseTaskRows } from '@/utils/sheetsMapper'
import type { Task } from '@/types/task'
import type { SheetsGetResponse } from '@/types/sheets'

const HEADER = ['id','parent_id','folder_id','title','status','priority',
  'deadline_date','deadline_time','is_recurring','recur_type','recur_value',
  'labels','sort_order','created_at','updated_at','completed_at','is_expanded']

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
  // Range A:Q covers all 17 columns including is_expanded (column Q)
  const range = `${SHEET_TASKS}!A${rowNum}:Q${rowNum}`
  await sheetsRequest('PUT', `values/${range}?valueInputOption=RAW`, {
    range,
    majorDimension: 'ROWS',
    values: [taskToRow(task)],
  })
}

export async function ensureHeader(): Promise<void> {
  const data = await sheetsRequest<SheetsGetResponse>('GET', `values/${SHEET_TASKS}!A1:Q1`)
  const row = data.values?.[0] ?? []
  if (row.length === 0) {
    // Fresh sheet: write full 17-column header
    await sheetsRequest('PUT', `values/${SHEET_TASKS}!A1:Q1?valueInputOption=RAW`, {
      range: `${SHEET_TASKS}!A1:Q1`,
      majorDimension: 'ROWS',
      values: [HEADER],
    })
  } else if (row.length < 16) {
    // Existing sheet missing completed_at: add from P1
    await sheetsRequest('PUT', `values/${SHEET_TASKS}!P1:Q1?valueInputOption=RAW`, {
      range: `${SHEET_TASKS}!P1:Q1`,
      majorDimension: 'ROWS',
      values: [['completed_at', 'is_expanded']],
    })
  } else if (row.length < 17) {
    // Existing sheet missing is_expanded column: add Q1
    await sheetsRequest('PUT', `values/${SHEET_TASKS}!Q1?valueInputOption=RAW`, {
      range: `${SHEET_TASKS}!Q1`,
      majorDimension: 'ROWS',
      values: [['is_expanded']],
    })
  }
}
