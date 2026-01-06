'use client'

import { useDroppable } from '@dnd-kit/core'
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'
import KanbanCard from './KanbanCard'
import type { KanbanColumn, WorkerWithRelations } from './PipelineKanban'

interface KanbanColumnProps {
    column: KanbanColumn
    workers: WorkerWithRelations[]
}

export default function KanbanColumn({ column, workers }: KanbanColumnProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: column.id,
    })

    return (
        <div
            ref={setNodeRef}
            className={cn(
                'flex-shrink-0 w-72 rounded-lg border-t-4 transition-colors',
                column.color,
                column.bgColor,
                isOver && 'ring-2 ring-primary ring-offset-2'
            )}
        >
            {/* Header */}
            <div className="p-3 border-b bg-white/50">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{column.title}</h3>
                    <span className="text-xs bg-white px-2 py-0.5 rounded-full font-medium">
                        {workers.length}
                    </span>
                </div>
            </div>

            {/* Cards */}
            <div className="p-2 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto">
                <SortableContext
                    items={workers.map((w) => w.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2">
                        {workers.length === 0 ? (
                            <div className="text-center py-8 text-xs text-muted-foreground">
                                ว่าง
                            </div>
                        ) : (
                            workers.map((worker) => (
                                <KanbanCard key={worker.id} worker={worker} />
                            ))
                        )}
                    </div>
                </SortableContext>
            </div>
        </div>
    )
}
