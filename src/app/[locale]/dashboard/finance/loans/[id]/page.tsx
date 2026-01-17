'use client'

import { useState, useEffect } from 'react'
import { useRouter, Link } from '@/i18n/routing'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    ArrowLeft,
    CreditCard,
    User,
    Calendar,
    Loader2,
    DollarSign,
    CheckCircle,
    AlertTriangle,
    Clock,
    Plus,
} from 'lucide-react'

interface Payment {
    id: string
    paymentId: string
    amount: number
    method: string
    paidAt: string
    recordedBy: { name: string }
}

interface Loan {
    id: string
    loanId: string
    principal: number
    balance: number
    interestRate: number
    status: string
    purpose: string | null
    notes: string | null
    disbursedAt: string | null
    dueDate: string | null
    createdAt: string
    worker: {
        id: string
        workerId: string
        firstNameTH: string
        lastNameTH: string
        phoneNumber: string | null
    }
    createdBy: { name: string }
    payments: Payment[]
}

export default function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const [loan, setLoan] = useState<Loan | null>(null)
    const [loading, setLoading] = useState(true)
    const [showPaymentForm, setShowPaymentForm] = useState(false)
    const [paymentLoading, setPaymentLoading] = useState(false)
    const [paymentData, setPaymentData] = useState({
        amount: '',
        method: 'CASH',
    })
    const [error, setError] = useState('')

    useEffect(() => {
        params.then(({ id }) => {
            fetch(`/api/loans/${id}`)
                .then((res) => res.json())
                .then((data) => {
                    setLoan(data)
                    setLoading(false)
                })
                .catch((err) => {
                    console.error(err)
                    setLoading(false)
                })
        })
    }, [params])

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!loan) return

        if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
            setError('กรุณาระบุจำนวนเงิน')
            return
        }

        setPaymentLoading(true)
        setError('')

        try {
            const res = await fetch(`/api/loans/${loan.id}/payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(paymentData.amount),
                    method: paymentData.method,
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error)
            }

            // Refresh loan data
            const loanRes = await fetch(`/api/loans/${loan.id}`)
            const updatedLoan = await loanRes.json()
            setLoan(updatedLoan)
            setShowPaymentForm(false)
            setPaymentData({ amount: '', method: 'CASH' })
        } catch (err: any) {
            setError(err.message)
        } finally {
            setPaymentLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <Badge variant="default" className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />กำลังผ่อน</Badge>
            case 'OVERDUE':
                return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />ค้างชำระ</Badge>
            case 'PAID_OFF':
                return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />ชำระแล้ว</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!loan) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">ไม่พบข้อมูลสินเชื่อ</p>
                <Link href="/dashboard/finance/loans">
                    <Button variant="link">กลับไปหน้ารายการ</Button>
                </Link>
            </div>
        )
    }

    const paidAmount = Number(loan.principal) - Number(loan.balance)
    const paidPercentage = (paidAmount / Number(loan.principal)) * 100

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/finance/loans">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold font-mono">{loan.loanId}</h1>
                            {getStatusBadge(loan.status)}
                        </div>
                        <p className="text-muted-foreground">
                            สร้างเมื่อ {format(new Date(loan.createdAt), 'dd MMMM yyyy', { locale: th })}
                        </p>
                    </div>
                </div>
                {loan.status !== 'PAID_OFF' && (
                    <Button onClick={() => setShowPaymentForm(!showPaymentForm)}>
                        <Plus className="h-4 w-4 mr-2" />
                        บันทึกการชำระ
                    </Button>
                )}
            </div>

            {/* Payment Form */}
            {showPaymentForm && (
                <Card className="border-primary">
                    <CardHeader>
                        <CardTitle className="text-lg">บันทึกการชำระเงิน</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePayment} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>จำนวนเงิน (บาท) <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={paymentData.amount}
                                        onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                        min="0"
                                        max={loan.balance}
                                        step="0.01"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        ยอดคงเหลือ: ฿{Number(loan.balance).toLocaleString()}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label>วิธีชำระ</Label>
                                    <Select
                                        value={paymentData.method}
                                        onValueChange={(value) => setPaymentData({ ...paymentData, method: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CASH">เงินสด</SelectItem>
                                            <SelectItem value="TRANSFER">โอนเงิน</SelectItem>
                                            <SelectItem value="DEDUCTION">หักจากเงินเดือน</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={paymentLoading}>
                                    {paymentLoading ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <DollarSign className="h-4 w-4 mr-2" />
                                    )}
                                    บันทึกการชำระ
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowPaymentForm(false)}
                                >
                                    ยกเลิก
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Loan Summary */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            ข้อมูลสินเชื่อ
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Progress */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>ชำระแล้ว ฿{paidAmount.toLocaleString()}</span>
                                <span>{paidPercentage.toFixed(1)}%</span>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 transition-all"
                                    style={{ width: `${paidPercentage}%` }}
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">เงินต้น</p>
                                <p className="text-2xl font-bold">฿{Number(loan.principal).toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">ยอดคงเหลือ</p>
                                <p className="text-2xl font-bold text-primary">฿{Number(loan.balance).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">วันครบกำหนด:</span>
                                <span>
                                    {loan.dueDate
                                        ? format(new Date(loan.dueDate), 'dd/MM/yyyy')
                                        : 'ไม่ระบุ'}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">อัตราดอกเบี้ย:</span>
                                <span className="ml-2">{Number(loan.interestRate)}%</span>
                            </div>
                            {loan.purpose && (
                                <div className="md:col-span-2">
                                    <span className="text-muted-foreground">วัตถุประสงค์:</span>
                                    <span className="ml-2">{loan.purpose}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Worker Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            แรงงาน
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="font-medium text-lg">
                                    {loan.worker.firstNameTH} {loan.worker.lastNameTH}
                                </p>
                                <p className="text-sm text-muted-foreground font-mono">
                                    {loan.worker.workerId}
                                </p>
                            </div>
                            {loan.worker.phoneNumber && (
                                <div className="text-sm">
                                    <span className="text-muted-foreground">โทร:</span>
                                    <span className="ml-2">{loan.worker.phoneNumber}</span>
                                </div>
                            )}
                            <Link href={`/dashboard/workers/${loan.worker.id}`}>
                                <Button variant="outline" size="sm" className="w-full">
                                    ดูโปรไฟล์แรงงาน
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payment History */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        ประวัติการชำระ ({loan.payments.length})
                    </CardTitle>
                    <CardDescription>รายการชำระเงินทั้งหมด</CardDescription>
                </CardHeader>
                <CardContent>
                    {loan.payments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>ยังไม่มีการชำระเงิน</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {loan.payments.map((payment, index) => (
                                <div
                                    key={payment.id}
                                    className="flex items-center justify-between p-4 border rounded-lg"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium font-mono text-sm">{payment.paymentId}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(payment.paidAt), 'dd/MM/yyyy HH:mm', { locale: th })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-green-600">
                                            +฿{Number(payment.amount).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {payment.method === 'CASH' ? 'เงินสด' :
                                                payment.method === 'TRANSFER' ? 'โอนเงิน' :
                                                    payment.method === 'DEDUCTION' ? 'หักเงินเดือน' : payment.method}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
