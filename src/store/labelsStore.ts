import { create } from 'zustand'
import { db } from '@/services/db'
import { enqueue } from '@/services/offlineQueue'
import type { Label, LabelInput } from '@/types/label'
import { generateId } from '@/utils/uuid'

interface LabelsState {
  labels: Label[]
  loadFromDb: () => Promise<void>
  addLabel: (input: LabelInput) => Promise<Label>
  renameLabel: (id: string, name: string) => Promise<void>
  deleteLabel: (id: string) => Promise<void>
  upsertMany: (labels: Label[]) => Promise<void>
}

export const useLabelsStore = create<LabelsState>((set, get) => ({
  labels: [],

  loadFromDb: async () => {
    const labels = await db.labels.toArray()
    set({ labels })
  },

  addLabel: async (input) => {
    const label: Label = { id: generateId('lbl'), ...input }
    await db.labels.put(label)
    await enqueue('label', 'create', label.id, label as unknown as Record<string, unknown>)
    set((s) => ({ labels: [...s.labels, label] }))
    return label
  },

  renameLabel: async (id, name) => {
    const existing = get().labels.find(l => l.id === id)
    if (!existing) return
    const updated = { ...existing, name }
    await db.labels.put(updated)
    await enqueue('label', 'update', id, updated as unknown as Record<string, unknown>)
    set((s) => ({ labels: s.labels.map(l => l.id === id ? updated : l) }))
  },

  deleteLabel: async (id) => {
    await db.labels.delete(id)
    await enqueue('label', 'delete', id, { id })
    set((s) => ({ labels: s.labels.filter(l => l.id !== id) }))
  },

  upsertMany: async (labels) => {
    await db.labels.bulkPut(labels)
    set({ labels })
  },
}))
