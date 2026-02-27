export interface Label {
  id: string
  name: string
  color: string   // hex '#EF4444'
}

export type LabelInput = Omit<Label, 'id'>
