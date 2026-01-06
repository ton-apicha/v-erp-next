'use client'

import { useState } from 'react'
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core'
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'
import KanbanColumn from './KanbanColumn'
import KanbanCard from './KanbanCard'
import type { Worker } from '@prisma/client'

export type WorkerWithRelations = Worker & {
    agent?: { companyName: string } | null
    client?: { companyName: string } | null
}

export interface KanbanColumn {
    id: string
    title: string
    color: string
    bgColor: string
}

const columns: KanbanColumn[] = [
    { id: 'NEW_LEAD', title: 'รายชื่อใหม่', color: 'border-gray-400', bgColor: 'bg-gray-50' },
    { id: 'SCREENING', title: 'รอตรวจสอบ', color: 'border-yellow-400', bgColor: 'bg-yellow-50' },
    { id: 'PROCESSING', title: 'กำลังดำเนินการ', color: 'border-blue-400', bgColor: 'bg-blue-50' },
    { id: 'ACADEMY', title: 'ฝึกอบรม', color: 'border-indigo-400', bgColor: 'bg-indigo-50' },
    { id: 'READY', title: 'พร้อมส่งตัว', color: 'border-green-400', bgColor: 'bg-green-50' },
    { id: 'DEPLOYED', title: 'ส่งตัวแล้ว', color: 'border-teal-400', bgColor: 'bg-teal-50' },
    { id: 'WORKING', title: 'กำลังทำงาน', color: 'border-purple-400', bgColor: 'bg-purple-50' },
]

interface PipelineKanbanProps {
    workers: WorkerWithRelations[]
    onStatusChange: (workerId: string, newStatus: string) => Promise<void>
}

export default function PipelineKanban({ workers, onStatusChange }: PipelineKanbanProps) {
    const [activeWorker, setActiveWorker] = useState<WorkerWithRelations | null>(null)
    const [isUpdating, setIsUpdating] = useState(false)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        const worker = workers.find((w) => w.id === active.id)
        if (worker) {
            setActiveWorker(worker)
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveWorker(null)

        if (!over) return

        const workerId = active.id as string
        const newStatus = over.id as string

        // Check if dropped on a column
        const isColumn = columns.some((col) => col.id === newStatus)
        if (!isColumn) return

        const worker = workers.find((w) => w.id === workerId)
        if (!worker || worker.status === newStatus) return

        setIsUpdating(true)
        try {
            await onStatusChange(workerId, newStatus)
        } catch (error) {
            console.error('Failed to update status:', error)
        } finally {
            setIsUpdating(false)
        }
    }

    const getWorkersByStatus = (status: string) => {
        return workers.filter((w) => w.status === status)
    }

    return (
        <div className={cn('relative', isUpdating && 'opacity-70 pointer-events-none')}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {columns.map((column) => {
                        const columnWorkers = getWorkersByStatus(column.id)
                        return (
                            <KanbanColumn
                                key={column.id}
                                column={column}
                                workers={columnWorkers}
                            />
                        )
                    })}
                </div>

                <DragOverlay>
                    {activeWorker ? (
                        <KanbanCard worker={activeWorker} isDragging />
                    ) : null}
                </DragOverlay>
            </DndContext>

            {isUpdating && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                    <div className="text-sm text-muted-foreground">กำลังอัพเดท...</div>
                </div>
            )}
        </div>
    )
}
