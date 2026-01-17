'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Plus,
    Search,
    Users,
    Phone,
    MapPin,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// =========================================
// Types
// =========================================

interface Partner {
    id: string
    partnerId: string
    name: string
    nickname: string | null
    phoneNumber: string
    province: string | null
    status: 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED'
    _count: {
        workers: number
    }
    createdAt: string
}

// =========================================
// Status Badge Component
// =========================================

function StatusBadge({ status }: { status: Partner['status'] }) {
    const locale = useLocale()

    const statusConfig = {
        ACTIVE: {
            labelTH: 'ใช้งาน',
            labelLA: 'ໃຊ້ງານ',
            className: 'bg-green-100 text-green-700 border-green-200',
        },
        INACTIVE: {
            labelTH: 'หยุดใช้งาน',
            labelLA: 'ຢຸດໃຊ້ງານ',
            className: 'bg-gray-100 text-gray-700 border-gray-200',
        },
        BLACKLISTED: {
            labelTH: 'ขึ้นบัญชีดำ',
            labelLA: 'ຂຶ້ນບັນຊີດຳ',
            className: 'bg-red-100 text-red-700 border-red-200',
        },
    }

    const config = statusConfig[status]
    const label = locale === 'la' ? config.labelLA : config.labelTH

    return (
        <Badge variant="outline" className={config.className}>
            {label}
        </Badge>
    )
}

// =========================================
// Partners Page
// =========================================

export default function PartnersPage() {
    const locale = useLocale()
    const [partners, setPartners] = useState<Partner[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    // Labels
    const labels = {
        title: locale === 'la' ? 'ພາດເນີ' : 'พาร์ทเนอร์',
        subtitle: locale === 'la' ? 'ຜູ້ພາແຮງງານມາ' : 'ผู้พาแรงงานมา',
        addNew: locale === 'la' ? 'ເພີ່ມພາດເນີ' : 'เพิ่มพาร์ทเนอร์',
        search: locale === 'la' ? 'ຄົ້ນຫາ...' : 'ค้นหา...',
        id: locale === 'la' ? 'ລະຫັດ' : 'รหัส',
        name: locale === 'la' ? 'ຊື່' : 'ชื่อ',
        phone: locale === 'la' ? 'ເບີໂທ' : 'เบอร์โทร',
        province: locale === 'la' ? 'ແຂວງ' : 'จังหวัด',
        workers: locale === 'la' ? 'ແຮງງານ' : 'แรงงาน',
        status: locale === 'la' ? 'ສະຖານະ' : 'สถานะ',
        actions: locale === 'la' ? 'ຈັດການ' : 'จัดการ',
        view: locale === 'la' ? 'ເບິ່ງ' : 'ดู',
        edit: locale === 'la' ? 'ແກ້ໄຂ' : 'แก้ไข',
        delete: locale === 'la' ? 'ລຶບ' : 'ลบ',
        noData: locale === 'la' ? 'ບໍ່ມີຂໍ້ມູນ' : 'ไม่มีข้อมูล',
        loading: locale === 'la' ? 'ກຳລັງໂຫຼດ...' : 'กำลังโหลด...',
        totalPartners: locale === 'la' ? 'ພາດເນີທັງໝົດ' : 'พาร์ทเนอร์ทั้งหมด',
        totalWorkers: locale === 'la' ? 'ແຮງງານທັງໝົດ' : 'แรงงานทั้งหมด',
    }

    // Fetch partners
    useEffect(() => {
        fetchPartners()
    }, [])

    async function fetchPartners() {
        try {
            setLoading(true)
            const res = await fetch('/api/partners')
            if (res.ok) {
                const data = await res.json()
                setPartners(data.partners || [])
            }
        } catch (error) {
            console.error('Error fetching partners:', error)
        } finally {
            setLoading(false)
        }
    }

    // Filter partners by search
    const filteredPartners = partners.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.partnerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phoneNumber.includes(searchQuery)
    )

    // Calculate stats
    const totalWorkers = partners.reduce((sum, p) => sum + p._count.workers, 0)

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{labels.title}</h1>
                    <p className="text-gray-500">{labels.subtitle}</p>
                </div>
                <Link href="/dashboard/partners/new">
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        {labels.addNew}
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            {labels.totalPartners}
                        </CardTitle>
                        <Users className="w-4 h-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{partners.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            {labels.totalWorkers}
                        </CardTitle>
                        <Users className="w-4 h-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalWorkers}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder={labels.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{labels.id}</TableHead>
                                <TableHead>{labels.name}</TableHead>
                                <TableHead>{labels.phone}</TableHead>
                                <TableHead>{labels.province}</TableHead>
                                <TableHead className="text-center">{labels.workers}</TableHead>
                                <TableHead>{labels.status}</TableHead>
                                <TableHead className="text-right">{labels.actions}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                        {labels.loading}
                                    </TableCell>
                                </TableRow>
                            ) : filteredPartners.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                        {labels.noData}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPartners.map((partner) => (
                                    <TableRow key={partner.id}>
                                        <TableCell className="font-mono text-sm">
                                            {partner.partnerId}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{partner.name}</div>
                                                {partner.nickname && (
                                                    <div className="text-sm text-gray-500">
                                                        ({partner.nickname})
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                {partner.phoneNumber}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {partner.province && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    {partner.province}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary">
                                                {partner._count.workers}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={partner.status} />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <Link href={`/dashboard/partners/${partner.id}`}>
                                                        <DropdownMenuItem>
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            {labels.view}
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <Link href={`/dashboard/partners/${partner.id}/edit`}>
                                                        <DropdownMenuItem>
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            {labels.edit}
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <DropdownMenuItem className="text-red-600">
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        {labels.delete}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
