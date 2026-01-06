'use client'

import Link from 'next/link'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { GripVertical, Phone, MapPin, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import type { WorkerWithRelations } from './PipelineKanban'

interface KanbanCardProps {
    worker: WorkerWithRelations
    isDragging?: boolean
}

export default function KanbanCard({ worker, isDragging }: KanbanCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({ id: worker.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const initials = `${worker.firstNameTH?.[0] || ''}${worker.lastNameTH?.[0] || ''}`

    const daysInStatus = Math.floor(
        (Date.now() - new Date(worker.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    )

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={cn(
                'p-3 cursor-grab active:cursor-grabbing bg-white hover:shadow-md transition-shadow',
                (isDragging || isSortableDragging) && 'opacity-50 shadow-lg rotate-2'
            )}
        >
            <div className="flex items-start gap-2">
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="mt-1 text-muted-foreground hover:text-foreground"
                >
                    <GripVertical className="w-4 h-4" />
                </div>

                {/* Avatar */}
                <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={undefined} alt={worker.firstNameTH} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {initials}
                    </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <Link
                        href={`/dashboard/workers/${worker.id}`}
                        className="font-medium text-sm hover:text-primary truncate block"
                    >
                        {worker.firstNameTH} {worker.lastNameTH}
                    </Link>

                    <p className="text-xs text-muted-foreground font-mono">
                        {worker.workerId}
                    </p>

                    <div className="flex flex-wrap gap-1 mt-2">
                        {worker.phoneNumber && (
                            <Badge variant="outline" className="text-xs py-0 gap-1">
                                <Phone className="w-3 h-3" />
                                {worker.phoneNumber}
                            </Badge>
                        )}
                        {worker.agent && (
                            <Badge variant="secondary" className="text-xs py-0">
                                {worker.agent.companyName}
                            </Badge>
                        )}
                    </div>

                    {/* Days in status */}
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>
                            {daysInStatus === 0
                                ? 'วันนี้'
                                : `${daysInStatus} วันที่แล้ว`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Actions could go here */}
        </Card>
    )
}
