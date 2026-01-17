'use client'

import { useState, useEffect } from 'react'
import { useRouter, Link } from '@/i18n/routing'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Loader2, Save, CreditCard } from 'lucide-react'

interface Worker {
    id: string
    workerId: string
    firstNameTH: string
    lastNameTH: string
}

export default function NewLoanPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [workers, setWorkers] = useState<Worker[]>([])

    const [formData, setFormData] = useState({
        workerId: '',
        principal: '',
        interestRate: '0',
        dueDate: '',
        purpose: '',
        notes: '',
    })

    useEffect(() => {
        // Fetch workers for dropdown
        fetch('/api/workers')
            .then((res) => res.json())
            .then((data) => setWorkers(data))
            .catch(console.error)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!formData.workerId) {
            setError('กรุณาเลือกแรงงาน')
            return
        }

        if (!formData.principal || parseFloat(formData.principal) <= 0) {
            setError('กรุณาระบุจำนวนเงินกู้')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/loans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workerId: formData.workerId,
                    principal: parseFloat(formData.principal),
                    interestRate: parseFloat(formData.interestRate) || 0,
                    dueDate: formData.dueDate || null,
                    purpose: formData.purpose,
                    notes: formData.notes,
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'เกิดข้อผิดพลาด')
            }

            router.push('/dashboard/finance/loans')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/finance/loans">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CreditCard className="h-6 w-6" />
                        สร้างสินเชื่อใหม่
                    </h1>
                    <p className="text-muted-foreground">บันทึกเงินกู้ให้แรงงาน</p>
                </div>
            </div>

            {/* Form */}
            <Card>
                <CardHeader>
                    <CardTitle>ข้อมูลสินเชื่อ</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Worker */}
                        <div className="space-y-2">
                            <Label>แรงงาน <span className="text-red-500">*</span></Label>
                            <Select
                                value={formData.workerId}
                                onValueChange={(value) => setFormData({ ...formData, workerId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกแรงงาน" />
                                </SelectTrigger>
                                <SelectContent>
                                    {workers.map((worker) => (
                                        <SelectItem key={worker.id} value={worker.id}>
                                            {worker.workerId} - {worker.firstNameTH} {worker.lastNameTH}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Principal */}
                        <div className="space-y-2">
                            <Label>จำนวนเงินกู้ (บาท) <span className="text-red-500">*</span></Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={formData.principal}
                                onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                                min="0"
                                step="0.01"
                            />
                        </div>

                        {/* Interest Rate */}
                        <div className="space-y-2">
                            <Label>อัตราดอกเบี้ย (%)</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={formData.interestRate}
                                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                                min="0"
                                max="100"
                                step="0.01"
                            />
                        </div>

                        {/* Due Date */}
                        <div className="space-y-2">
                            <Label>วันครบกำหนดชำระ</Label>
                            <Input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>

                        {/* Purpose */}
                        <div className="space-y-2">
                            <Label>วัตถุประสงค์</Label>
                            <Input
                                placeholder="เช่น ค่าใช้จ่ายส่วนตัว, ค่าเดินทาง"
                                value={formData.purpose}
                                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label>หมายเหตุ</Label>
                            <Textarea
                                placeholder="รายละเอียดเพิ่มเติม..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            <Button type="submit" disabled={loading} className="flex-1">
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        บันทึกสินเชื่อ
                                    </>
                                )}
                            </Button>
                            <Link href="/dashboard/finance/loans">
                                <Button type="button" variant="outline" disabled={loading}>
                                    ยกเลิก
                                </Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
