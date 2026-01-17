// =====================================================
// V-Academy Page (Functional Version)
// Training management dashboard
// =====================================================

import { prisma } from '@/lib/db'
import { Link } from '@/i18n/routing'
import { format, addDays, differenceInDays } from 'date-fns'
import { th } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    GraduationCap,
    Users,
    Calendar,
    Clock,
    CheckCircle,
    UserPlus,
    ArrowRight,
    BarChart3,
    BookOpen,
} from 'lucide-react'

// Status colors
const statusColors: Record<string, string> = {
    TRAINING: 'bg-amber-100 text-amber-800',
    READY: 'bg-green-100 text-green-800',
    NEW: 'bg-blue-100 text-blue-800',
}

export default async function AcademyPage() {
    // Get workers in training or ready
    const [trainingWorkers, readyWorkers, newWorkers] = await Promise.all([
        prisma.worker.findMany({
            where: { status: 'TRAINING' },
            include: {
                partner: { select: { name: true, partnerId: true } },
            },
            orderBy: { academyStartDate: 'desc' },
        }),
        prisma.worker.findMany({
            where: { status: 'READY' },
            take: 10,
            orderBy: { updatedAt: 'desc' },
        }),
        prisma.worker.findMany({
            where: { status: { in: ['NEW', 'DOCUMENTING'] } },
            take: 10,
            orderBy: { createdAt: 'desc' },
        }),
    ])

    // Stats
    const stats = {
        training: trainingWorkers.length,
        ready: readyWorkers.length,
        new: newWorkers.length,
        completedThisMonth: await prisma.worker.count({
            where: {
                hasAcademyTraining: true,
                academyEndDate: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
            },
        }),
    }

    // Calculate training progress for each worker
    const workersWithProgress = trainingWorkers.map((worker) => {
        let progress = 0
        let daysRemaining = 0
        const defaultTrainingDays = 14

        if (worker.academyStartDate && worker.academyEndDate) {
            const totalDays = differenceInDays(
                new Date(worker.academyEndDate),
                new Date(worker.academyStartDate)
            )
            const daysPassed = differenceInDays(
                new Date(),
                new Date(worker.academyStartDate)
            )
            progress = Math.min(Math.round((daysPassed / totalDays) * 100), 100)
            daysRemaining = Math.max(
                differenceInDays(new Date(worker.academyEndDate), new Date()),
                0
            )
        } else if (worker.academyStartDate) {
            const daysPassed = differenceInDays(new Date(), new Date(worker.academyStartDate))
            progress = Math.min(Math.round((daysPassed / defaultTrainingDays) * 100), 100)
            daysRemaining = Math.max(defaultTrainingDays - daysPassed, 0)
        }

        return { ...worker, progress, daysRemaining }
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <GraduationCap className="h-8 w-8" />
                        V-Academy
                    </h1>
                    <p className="text-muted-foreground">ศูนย์ฝึกอบรมแรงงาน</p>
                </div>
                <Link href="/dashboard/workers?status=TRAINING">
                    <Button>
                        <Users className="h-4 w-4 mr-2" />
                        ดูทั้งหมด
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <Clock className="h-6 w-6 mx-auto text-amber-500 mb-2" />
                        <p className="text-2xl font-bold text-amber-700">{stats.training}</p>
                        <p className="text-xs text-muted-foreground">กำลังฝึกอบรม</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <CheckCircle className="h-6 w-6 mx-auto text-green-500 mb-2" />
                        <p className="text-2xl font-bold text-green-700">{stats.ready}</p>
                        <p className="text-xs text-muted-foreground">พร้อมส่งตัว</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <UserPlus className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                        <p className="text-2xl font-bold text-blue-700">{stats.new}</p>
                        <p className="text-xs text-muted-foreground">รอเข้าฝึก</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <BarChart3 className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                        <p className="text-2xl font-bold text-purple-700">{stats.completedThisMonth}</p>
                        <p className="text-xs text-muted-foreground">จบเดือนนี้</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Training Workers */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                กำลังฝึกอบรม
                            </CardTitle>
                            <CardDescription>
                                แรงงานที่อยู่ระหว่างการฝึกอบรม
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {workersWithProgress.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <GraduationCap className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>ไม่มีแรงงานกำลังฝึกอบรม</p>
                                    <Link href="/dashboard/workers?status=NEW">
                                        <Button className="mt-4" variant="outline">
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            เพิ่มแรงงานเข้าฝึก
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {workersWithProgress.map((worker) => (
                                        <div
                                            key={worker.id}
                                            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition"
                                        >
                                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                                <GraduationCap className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">
                                                    {worker.firstNameTH} {worker.lastNameTH}
                                                    {worker.nickname && (
                                                        <span className="text-muted-foreground">
                                                            {' '}({worker.nickname})
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {worker.workerId}
                                                    {worker.partner && ` • จาก ${worker.partner.name}`}
                                                </p>
                                                <div className="mt-2 flex items-center gap-3">
                                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary transition-all"
                                                            style={{ width: `${worker.progress}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-medium w-12">
                                                        {worker.progress}%
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {worker.academyStartDate && (
                                                        <>
                                                            เริ่ม: {format(new Date(worker.academyStartDate), 'dd MMM', { locale: th })}
                                                            {' • '}
                                                        </>
                                                    )}
                                                    เหลือ {worker.daysRemaining} วัน
                                                </p>
                                            </div>
                                            <Link href={`/dashboard/workers/${worker.id}`}>
                                                <Button size="sm" variant="ghost">
                                                    <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Ready Workers */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                พร้อมส่งตัว
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {readyWorkers.length === 0 ? (
                                <p className="text-sm text-muted-foreground">ไม่มี</p>
                            ) : (
                                <div className="space-y-2">
                                    {readyWorkers.slice(0, 5).map((worker) => (
                                        <div
                                            key={worker.id}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <span>
                                                {worker.firstNameTH} {worker.lastNameTH?.[0]}.
                                            </span>
                                            <Badge className="bg-green-100 text-green-800">
                                                พร้อม
                                            </Badge>
                                        </div>
                                    ))}
                                    {readyWorkers.length > 5 && (
                                        <Link href="/dashboard/deployment">
                                            <Button variant="ghost" size="sm" className="w-full">
                                                ดูทั้งหมด ({readyWorkers.length})
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* New Workers */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <UserPlus className="h-4 w-4 text-blue-500" />
                                รอเข้าฝึกอบรม
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {newWorkers.length === 0 ? (
                                <p className="text-sm text-muted-foreground">ไม่มี</p>
                            ) : (
                                <div className="space-y-2">
                                    {newWorkers.slice(0, 5).map((worker) => (
                                        <div
                                            key={worker.id}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <span>
                                                {worker.firstNameTH} {worker.lastNameTH?.[0]}.
                                            </span>
                                            <Badge className="bg-blue-100 text-blue-800">
                                                {worker.status === 'NEW' ? 'ใหม่' : 'เอกสาร'}
                                            </Badge>
                                        </div>
                                    ))}
                                    {newWorkers.length > 5 && (
                                        <Link href="/dashboard/workers?status=NEW">
                                            <Button variant="ghost" size="sm" className="w-full">
                                                ดูทั้งหมด ({newWorkers.length})
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">ดำเนินการด่วน</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Link href="/dashboard/academy/enroll">
                                <Button variant="outline" className="w-full justify-start">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    รับแรงงานเข้าฝึก
                                </Button>
                            </Link>
                            <Link href="/dashboard/academy/graduate">
                                <Button variant="outline" className="w-full justify-start">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    จบการฝึกอบรม
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
