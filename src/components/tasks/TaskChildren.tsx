import { useState, useCallback, useEffect } from 'react'
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import type { Task } from '@/types/task'
import { TaskItem } from './TaskItem'
import { useTasksStore } from '@/store/tasksStore'
import { scheduleFlush } from '@/services/syncService'

function SortableChildRow({ task, depth, showFolder }: { task: Task; depth: number; showFolder: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="flex items-stretch"
    >
      <button
        {...attributes}
        {...listeners}
        className="flex items-center px-1 text-muted-foreground/30 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
        tabIndex={-1}
      >
        <GripVertical size={14} />
      </button>
      <div className="flex-1 min-w-0">
        <TaskItem task={task} depth={depth} showFolder={showFolder} />
      </div>
    </div>
  )
}

interface Props {
  tasks: Task[]
  depth: number
  showFolder?: boolean
}

export function TaskChildren({ tasks, depth, showFolder = false }: Props) {
  const { updateTask } = useTasksStore()
  const [localTasks, setLocalTasks] = useState<Task[]>(() =>
    [...tasks].sort((a, b) => a.sort_order - b.sort_order)
  )

  useEffect(() => {
    setLocalTasks([...tasks].sort((a, b) => a.sort_order - b.sort_order))
  }, [tasks])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over, delta } = event
    if (!over || active.id === over.id) return

    const draggedId = active.id as string
    const overId = over.id as string
    const oldIndex = localTasks.findIndex(t => t.id === draggedId)
    const newIndex = localTasks.findIndex(t => t.id === overId)

    // Drag right (>50px) → reparent dragged task under the "over" task
    if (delta.x > 50) {
      const targetTask = localTasks[newIndex]
      if (targetTask && targetTask.id !== draggedId) {
        await updateTask(draggedId, { parent_id: targetTask.id })
        scheduleFlush()
      }
      return
    }

    // Normal vertical reorder
    if (oldIndex === newIndex) return
    const reordered = arrayMove(localTasks, oldIndex, newIndex)
    setLocalTasks(reordered)
    for (let i = 0; i < reordered.length; i++) {
      await updateTask(reordered[i].id, { sort_order: i * 10 })
    }
    scheduleFlush()
  }, [localTasks, updateTask])

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => void handleDragEnd(e)}>
      <SortableContext items={localTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div>
          {localTasks.map(task => (
            <SortableChildRow key={task.id} task={task} depth={depth} showFolder={showFolder} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
