'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { recordPayment } from '@/actions/finance'

interface PaymentFormProps {
    loanId: string
    remainingBalance: number
}

const paymentMethods = [
    { value: 'CASH', label: 'เงินสด' },
    { value: 'TRANSFER', label: 'โอนเงิน' },
    { value: 'DEDUCTION', label: 'หักเงินเดือน' },
    { value: 'CHECK', label: 'เช็ค' },
]

export default function PaymentForm({ loanId, remainingBalance }: PaymentFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [amount, setAmount] = useState('')
    const [method, setMethod] = useState('')
    const [reference, setReference] = useState('')
    const [note, setNote] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!amount || !method) {
            alert('กรุณากรอกจำนวนเงินและวิธีการชำระ')
            return
        }

        const amountNum = parseFloat(amount)
        if (amountNum <= 0) {
            alert('จำนวนเงินต้องมากกว่า 0')
            return
        }

        if (amountNum > remainingBalance) {
            alert(`จำนวนเงินไม่สามารถมากกว่ายอดคงเหลือ (฿${remainingBalance.toLocaleString()})`)
            return
        }

        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append('loanId', loanId)
            formData.append('amount', amount)
            formData.append('method', method)
            formData.append('reference', reference)
            formData.append('note', note)

            await recordPayment(formData)

            setAmount('')
            setMethod('')
            setReference('')
            setNote('')
            router.refresh()
        } catch (error) {
            console.error('Payment failed:', error)
            alert('บันทึกการชำระเงินไม่สำเร็จ')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">จำนวนเงิน *</label>
                <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    max={remainingBalance}
                    step="0.01"
                />
                <p className="text-xs text-muted-foreground">
                    คงเหลือ: ฿{remainingBalance.toLocaleString()}
                </p>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">วิธีการชำระ *</label>
                <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger>
                        <SelectValue placeholder="เลือกวิธีการ" />
                    </SelectTrigger>
                    <SelectContent>
                        {paymentMethods.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                                {m.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">เลขอ้างอิง</label>
                <Input
                    type="text"
                    placeholder="เลขที่ slip / เช็ค"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">หมายเหตุ</label>
                <Input
                    type="text"
                    placeholder="หมายเหตุเพิ่มเติม"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        กำลังบันทึก...
                    </>
                ) : (
                    'บันทึกการชำระเงิน'
                )}
            </Button>
        </form>
    )
}
