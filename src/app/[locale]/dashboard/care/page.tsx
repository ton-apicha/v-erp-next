// =====================================================
// V-Care Page
// Domestic worker management (แม่บ้าน, ดูแลผู้สูงอายุ)
// =====================================================

import { prisma } from '@/lib/db'
import { Link } from '@/i18n/routing'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Home,
    Users,
    Heart,
    UserPlus,
    Phone,
    MapPin,
    Calendar,
    Star,
    Clock,
    CheckCircle,
    Search,
} from 'lucide-react'

export default async function VCarePage() {
    // Get individual clients (households)
    const households = await prisma.client.findMany({
        where: { type: 'INDIVIDUAL' },
        include: {
            workers: {
                where: { status: { in: ['DEPLOYED', 'WORKING'] } },
                select: {
                    id: true,
                    workerId: true,
                    firstNameTH: true,
                    lastNameTH: true,
                    nickname: true,
                    status: true,
                    position: true,
                    startDate: true,
                },
            },
            _count: { select: { workers: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
    })

    // Get available domestic workers (ready for placement)
    const availableWorkers = await prisma.worker.findMany({
        where: {
            status: 'READY',
            hasAcademyTraining: true,
        },
        take: 10,
        orderBy: { updatedAt: 'desc' },
    })

    // Stats
    const stats = {
        totalHouseholds: await prisma.client.count({ where: { type: 'INDIVIDUAL' } }),
        activeWorkers: await prisma.worker.count({
            where: {
                status: { in: ['DEPLOYED', 'WORKING'] },
                client: { type: 'INDIVIDUAL' },
            },
        }),
        availableWorkers: availableWorkers.length,
        newThisMonth: await prisma.client.count({
            where: {
                type: 'INDIVIDUAL',
                createdAt: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
            },
        }),
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <Home className="h-8 w-8" />
                        V-Care
                    </h1>
                    <p className="text-muted-foreground">บริการดูแลบ้านและผู้สูงอายุ</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/clients/new">
                        <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            เพิ่มลูกค้า
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <Home className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                        <p className="text-2xl font-bold text-blue-700">{stats.totalHouseholds}</p>
                        <p className="text-xs text-muted-foreground">ครัวเรือน</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <Users className="h-6 w-6 mx-auto text-green-500 mb-2" />
                        <p className="text-2xl font-bold text-green-700">{stats.activeWorkers}</p>
                        <p className="text-xs text-muted-foreground">แม่บ้านทำงาน</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <Clock className="h-6 w-6 mx-auto text-amber-500 mb-2" />
                        <p className="text-2xl font-bold text-amber-700">{stats.availableWorkers}</p>
                        <p className="text-xs text-muted-foreground">พร้อมจัดส่ง</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <Star className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                        <p className="text-2xl font-bold text-purple-700">{stats.newThisMonth}</p>
                        <p className="text-xs text-muted-foreground">ลูกค้าใหม่เดือนนี้</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Households List */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Home className="h-5 w-5" />
                                ครัวเรือนลูกค้า
                            </CardTitle>
                            <CardDescription>
                                รายการลูกค้าประเภทบุคคล/ครัวเรือน
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {households.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Home className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>ยังไม่มีลูกค้าครัวเรือน</p>
                                    <Link href="/dashboard/clients/new">
                                        <Button className="mt-4">
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            เพิ่มลูกค้าแรก
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {households.map((household) => (
                                        <div
                                            key={household.id}
                                            className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition"
                                        >
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                <Home className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">
                                                        {household.personName || household.companyName}
                                                    </p>
                                                    {household.workers.length > 0 && (
                                                        <Badge className="bg-green-100 text-green-800">
                                                            มีแม่บ้าน {household.workers.length}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                                    <Phone className="h-3 w-3" />
                                                    {household.phoneNumber || '-'}
                                                    {household.address && (
                                                        <>
                                                            <span className="mx-1">•</span>
                                                            <MapPin className="h-3 w-3" />
                                                            {household.address.slice(0, 30)}...
                                                        </>
                                                    )}
                                                </p>

                                                {/* Workers */}
                                                {household.workers.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        {household.workers.map((worker) => (
                                                            <div
                                                                key={worker.id}
                                                                className="flex items-center gap-2 text-sm bg-muted p-2 rounded"
                                                            >
                                                                <Heart className="h-4 w-4 text-pink-500" />
                                                                <span className="font-medium">
                                                                    {worker.firstNameTH} {worker.lastNameTH}
                                                                </span>
                                                                {worker.position && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {worker.position}
                                                                    </Badge>
                                                                )}
                                                                {worker.startDate && (
                                                                    <span className="text-muted-foreground ml-auto">
                                                                        เริ่ม: {format(new Date(worker.startDate), 'dd MMM yy', { locale: th })}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <Link href={`/dashboard/clients/${household.id}`}>
                                                <Button size="sm" variant="ghost">
                                                    ดู
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
                    {/* Available Workers */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                พร้อมจัดส่ง
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {availableWorkers.length === 0 ? (
                                <p className="text-sm text-muted-foreground">ไม่มีแม่บ้านพร้อมจัดส่ง</p>
                            ) : (
                                <div className="space-y-2">
                                    {availableWorkers.slice(0, 5).map((worker) => (
                                        <div
                                            key={worker.id}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <span>
                                                {worker.firstNameTH} {worker.lastNameTH?.[0]}.
                                            </span>
                                            <Link href={`/dashboard/deployment/new`}>
                                                <Button size="sm" variant="outline">
                                                    จัดส่ง
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                    {availableWorkers.length > 5 && (
                                        <Link href="/dashboard/deployment">
                                            <Button variant="ghost" size="sm" className="w-full">
                                                ดูทั้งหมด ({availableWorkers.length})
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Service Types */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">ประเภทบริการ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center gap-3 p-2 rounded hover:bg-muted">
                                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                                    <Home className="h-4 w-4 text-pink-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">แม่บ้าน</p>
                                    <p className="text-xs text-muted-foreground">ดูแลบ้าน ทำความสะอาด</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-2 rounded hover:bg-muted">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                    <Heart className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">ดูแลผู้สูงอายุ</p>
                                    <p className="text-xs text-muted-foreground">ดูแลผู้สูงอายุ ผู้ป่วย</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-2 rounded hover:bg-muted">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Users className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">เลี้ยงเด็ก</p>
                                    <p className="text-xs text-muted-foreground">ดูแลบุตรหลาน</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">ดำเนินการด่วน</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Link href="/dashboard/clients/new">
                                <Button variant="outline" className="w-full justify-start">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    เพิ่มลูกค้าใหม่
                                </Button>
                            </Link>
                            <Link href="/dashboard/deployment/new">
                                <Button variant="outline" className="w-full justify-start">
                                    <Home className="h-4 w-4 mr-2" />
                                    จัดส่งแม่บ้าน
                                </Button>
                            </Link>
                            <Link href="/dashboard/clients">
                                <Button variant="outline" className="w-full justify-start">
                                    <Search className="h-4 w-4 mr-2" />
                                    ค้นหาลูกค้า
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
