'use client'

import { Worker } from '@prisma/client'
import { Edit, Trash2, Eye } from 'lucide-react'

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
            <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">ยังไม่มีข้อมูลแรงงาน</p>
                <p className="text-sm">กรุณาเพิ่มแรงงานคนแรก</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">รหัส</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ชื่อ-สกุล</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">เพศ</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">เบอร์โทร</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">สถานะ</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ตัวแทน</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">นายจ้าง</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {workers.map((worker) => (
                        <tr key={worker.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                                <span className="font-mono text-sm text-gray-900">{worker.workerId}</span>
                            </td>
                            <td className="py-3 px-4">
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {worker.firstNameTH} {worker.lastNameTH}
                                    </p>
                                    {worker.nickname && (
                                        <p className="text-sm text-gray-500">({worker.nickname})</p>
                                    )}
                                </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                                {worker.gender === 'MALE' ? 'ชาย' : worker.gender === 'FEMALE' ? 'หญิง' : 'อื่นๆ'}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                                {worker.phoneNumber || '-'}
                            </td>
                            <td className="py-3 px-4">
                                <StatusBadge status={worker.status} />
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                                {worker.agent?.companyName || '-'}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                                {worker.client?.companyName || '-'}
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex items-center justify-end gap-2">
                                    <a
                                        href={`/dashboard/workers/${worker.id}`}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="ดูรายละเอียด"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </a>
                                    <a
                                        href={`/dashboard/workers/${worker.id}/edit`}
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="แก้ไข"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </a>
                                    <button
                                        onClick={() => handleDelete(worker.id, `${worker.firstNameTH} ${worker.lastNameTH}`)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="ลบ"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        NEW_LEAD: 'bg-gray-100 text-gray-800',
        SCREENING: 'bg-yellow-100 text-yellow-800',
        PROCESSING: 'bg-blue-100 text-blue-800',
        ACADEMY: 'bg-indigo-100 text-indigo-800',
        READY: 'bg-green-100 text-green-800',
        DEPLOYED: 'bg-teal-100 text-teal-800',
        WORKING: 'bg-purple-100 text-purple-800',
        COMPLETED: 'bg-slate-100 text-slate-800',
        TERMINATED: 'bg-red-100 text-red-800',
        REJECTED: 'bg-red-100 text-red-800',
    }

    const labels: Record<string, string> = {
        NEW_LEAD: 'รายชื่อใหม่',
        SCREENING: 'รอตรวจสอบ',
        PROCESSING: 'กำลังดำเนินการ',
        ACADEMY: 'ฝึกอบรม',
        READY: 'พร้อมส่งตัว',
        DEPLOYED: 'ส่งตัวแล้ว',
        WORKING: 'กำลังทำงาน',
        COMPLETED: 'สิ้นสุดสัญญา',
        TERMINATED: 'เลิกจ้าง',
        REJECTED: 'ปฏิเสธ',
    }

    return (
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
            {labels[status] || status}
        </span>
    )
}
