import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import PipelineKanban from '@/components/workers/PipelineKanban'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Filter, LayoutGrid, List } from 'lucide-react'
import Link from 'next/link'

async function updateWorkerStatus(workerId: string, newStatus: string) {
    'use server'

    await prisma.worker.update({
        where: { id: workerId },
        data: { status: newStatus as any },
    })

    revalidatePath('/dashboard/workers/pipeline')
}

export default async function PipelinePage() {
    const session = await getServerSession(authOptions)

    const workers = await prisma.worker.findMany({
        where: {
            isArchived: false,
            status: {
                notIn: ['CONTRACT_END', 'TERMINATED'],
            },
        },
        include: {
            agent: { select: { companyName: true } },
            client: { select: { companyName: true } },
        },
        orderBy: { updatedAt: 'desc' },
    })

    const stats = {
        total: workers.length,
        newLead: workers.filter((w) => w.status === 'NEW_LEAD').length,
        processing: workers.filter((w) => ['SCREENING', 'PROCESSING', 'ACADEMY'].includes(w.status)).length,
        ready: workers.filter((w) => w.status === 'READY').length,
        working: workers.filter((w) => ['DEPLOYED', 'WORKING'].includes(w.status)).length,
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Pipeline แรงงาน</h1>
                    <p className="text-muted-foreground">ติดตามและจัดการสถานะแรงงานแบบ Kanban</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/dashboard/workers">
                        <Button variant="outline" size="icon">
                            <List className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href="/dashboard/workers/new">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            เพิ่มแรงงาน
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            ทั้งหมดใน Pipeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            รายชื่อใหม่
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-600">{stats.newLead}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            กำลังดำเนินการ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            กำลังทำงาน
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{stats.working}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Bar */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="ค้นหาแรงงาน..." className="pl-9" />
                        </div>
                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Kanban Board */}
            <PipelineKanban
                workers={workers}
                onStatusChange={updateWorkerStatus}
            />
        </div>
    )
}
