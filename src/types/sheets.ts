export interface ValueRange {
  range: string
  majorDimension: string
  values?: string[][]
}

export interface SheetsGetResponse {
  range: string
  majorDimension: string
  values?: string[][]
}

export interface AppendValuesResponse {
  spreadsheetId: string
  tableRange: string
  updates: {
    updatedRows: number
    updatedCells: number
  }
}

export interface BatchUpdateValuesRequest {
  valueInputOption: 'RAW' | 'USER_ENTERED'
  data: ValueRange[]
}
