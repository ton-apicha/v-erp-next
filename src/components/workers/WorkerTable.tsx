'use client'

import { Worker } from '@prisma/client'
import { Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Link } from '@/i18n/routing'

type WorkerWithRelations = Worker & {
    createdBy: { name: string }
    agent: { companyName: string } | null
    client: { companyName: string } | null
}

export default function WorkerTable({ workers }: { workers: WorkerWithRelations[] }) {
    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`ต้องการลบ ${name} ใช่หรือไม่?`)) return

        try {
            const res = await fetch(`/api/workers/${id}`, { method: 'DELETE' })
            if (res.ok) {
                window.location.reload()
            } else {
                alert('เกิดข้อผิดพลาด')
            }
        } catch (error) {
            alert('เกิดข้อผิดพลาดในการลบข้อมูล')
        }
    }

    if (workers.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-2">ยังไม่มีข้อมูลแรงงาน</p>
                <p className="text-sm">กรุณาเพิ่มแรงงานคนแรก</p>
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>รหัส</TableHead>
                        <TableHead>ชื่อ-สกุล</TableHead>
                        <TableHead>เพศ</TableHead>
                        <TableHead>เบอร์โทร</TableHead>
                        <TableHead>สถานะ</TableHead>
                        <TableHead>ตัวแทน</TableHead>
                        <TableHead>นายจ้าง</TableHead>
                        <TableHead className="text-right">จัดการ</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {workers.map((worker) => (
                        <TableRow key={worker.id}>
                            <TableCell className="font-mono text-sm">{worker.workerId}</TableCell>
                            <TableCell>
                                <div>
                                    <p className="font-medium text-foreground">
                                        {worker.firstNameTH} {worker.lastNameTH}
                                    </p>
                                    {worker.nickname && (
                                        <p className="text-xs text-muted-foreground">({worker.nickname})</p>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>{worker.gender === 'MALE' ? 'ชาย' : worker.gender === 'FEMALE' ? 'หญิง' : 'อื่นๆ'}</TableCell>
                            <TableCell>{worker.phoneNumber || '-'}</TableCell>
                            <TableCell>
                                <StatusBadge status={worker.status} />
                            </TableCell>
                            <TableCell className="text-muted-foreground">{worker.agent?.companyName || '-'}</TableCell>
                            <TableCell className="text-muted-foreground">{worker.client?.companyName || '-'}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Link href={`/dashboard/workers/${worker.id}`}>
                                        <Button variant="ghost" size="icon" title="ดูรายละเอียด">
                                            <Eye className="w-4 h-4 text-blue-600" />
                                        </Button>
                                    </Link>
                                    <Link href={`/dashboard/workers/${worker.id}/edit`}>
                                        <Button variant="ghost" size="icon" title="แก้ไข">
                                            <Edit className="w-4 h-4 text-foreground" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(worker.id, `${worker.firstNameTH} ${worker.lastNameTH}`)}
                                        title="ลบ"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
        NEW_LEAD: { label: 'รายชื่อใหม่', variant: 'secondary' },
        SCREENING: { label: 'รอตรวจสอบ', variant: 'outline' },
        PROCESSING: { label: 'กำลังดำเนินการ', variant: 'outline' },
        ACADEMY: { label: 'ฝึกอบรม', variant: 'outline' },
        READY: { label: 'พร้อมส่งตัว', variant: 'secondary' },
        DEPLOYED: { label: 'ส่งตัวแล้ว', variant: 'secondary' },
        WORKING: { label: 'กำลังทำงาน', variant: 'default' },
        COMPLETED: { label: 'สิ้นสุดสัญญา', variant: 'outline' },
        TERMINATED: { label: 'เลิกจ้าง', variant: 'destructive' },
        REJECTED: { label: 'ปฏิเสธ', variant: 'destructive' },
    }

    const { label, variant } = config[status] || { label: status, variant: 'secondary' }

    return <Badge variant={variant}>{label}</Badge>
}
