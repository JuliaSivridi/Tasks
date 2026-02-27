export interface Folder {
  id: string
  name: string
  color: string   // hex '#3B82F6' or ''
  sort_order: number
}

export type FolderInput = Omit<Folder, 'id'>
