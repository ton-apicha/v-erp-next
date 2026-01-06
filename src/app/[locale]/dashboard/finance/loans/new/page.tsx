'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { createLoan } from '@/actions/finance'

interface Worker {
    id: string
    workerId: string
    firstNameTH: string
    lastNameTH: string
}

export default function NewLoanPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [workers, setWorkers] = useState<Worker[]>([])
    const [searchTerm, setSearchTerm] = useState('')

    // Form state
    const [workerId, setWorkerId] = useState('')
    const [totalAmount, setTotalAmount] = useState('')
    const [installments, setInstallments] = useState('')
    const [monthlyDeduction, setMonthlyDeduction] = useState('')
    const [interestRate, setInterestRate] = useState('0')
    const [description, setDescription] = useState('')

    // Fetch workers
    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const res = await fetch(`/api/workers?limit=100`)
                const data = await res.json()
                setWorkers(data.data || [])
            } catch (error) {
                console.error('Failed to fetch workers:', error)
            }
        }
        fetchWorkers()
    }, [])

    const filteredWorkers = workers.filter(
        (w) =>
            w.firstNameTH.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.lastNameTH.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.workerId.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!workerId || !totalAmount) {
            alert('กรุณาเลือกแรงงานและกรอกยอดสินเชื่อ')
            return
        }

        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append('workerId', workerId)
            formData.append('totalAmount', totalAmount)
            if (installments) formData.append('installments', installments)
            if (monthlyDeduction) formData.append('monthlyDeduction', monthlyDeduction)
            formData.append('interestRate', interestRate)
            if (description) formData.append('description', description)

            const loan = await createLoan(formData)
            router.push(`/dashboard/finance/loans/${loan.id}`)
        } catch (error) {
            console.error('Create loan failed:', error)
            alert('สร้างสินเชื่อไม่สำเร็จ')
        } finally {
            setIsLoading(false)
        }
    }

    // Auto-calculate monthly deduction
    useEffect(() => {
        if (totalAmount && installments) {
            const total = parseFloat(totalAmount)
            const inst = parseInt(installments)
            if (total > 0 && inst > 0) {
                setMonthlyDeduction((total / inst).toFixed(2))
            }
        }
    }, [totalAmount, installments])

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/finance/loans">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">สร้างสินเชื่อใหม่</h1>
                    <p className="text-muted-foreground">กรอกข้อมูลสินเชื่อสำหรับแรงงาน</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>ข้อมูลสินเชื่อ</CardTitle>
                        <CardDescription>กรอกรายละเอียดสินเชื่อ</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Worker Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">แรงงาน *</label>
                            <Input
                                type="text"
                                placeholder="ค้นหาแรงงาน..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="mb-2"
                            />
                            <Select value={workerId} onValueChange={setWorkerId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกแรงงาน" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredWorkers.map((worker) => (
                                        <SelectItem key={worker.id} value={worker.id}>
                                            {worker.workerId} - {worker.firstNameTH} {worker.lastNameTH}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Amount */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">ยอดสินเชื่อ (บาท) *</label>
                            <Input
                                type="number"
                                placeholder="10000"
                                value={totalAmount}
                                onChange={(e) => setTotalAmount(e.target.value)}
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Installments */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">จำนวนงวด</label>
                                <Input
                                    type="number"
                                    placeholder="12"
                                    value={installments}
                                    onChange={(e) => setInstallments(e.target.value)}
                                    min="1"
                                />
                            </div>

                            {/* Monthly Deduction */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">หักต่อเดือน (บาท)</label>
                                <Input
                                    type="number"
                                    placeholder="Auto-calculate"
                                    value={monthlyDeduction}
                                    onChange={(e) => setMonthlyDeduction(e.target.value)}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        {/* Interest Rate */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">อัตราดอกเบี้ย (%)</label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={interestRate}
                                onChange={(e) => setInterestRate(e.target.value)}
                                min="0"
                                max="100"
                                step="0.01"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">หมายเหตุ</label>
                            <Input
                                type="text"
                                placeholder="รายละเอียดเพิ่มเติม..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4 mt-6">
                    <Link href="/dashboard/finance/loans">
                        <Button variant="outline" type="button">ยกเลิก</Button>
                    </Link>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                กำลังสร้าง...
                            </>
                        ) : (
                            'สร้างสินเชื่อ'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
