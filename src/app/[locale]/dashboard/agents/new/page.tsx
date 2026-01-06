'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Building2, User, Phone, Mail, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import AddressSelector from '@/components/ui/address-selector'


export default function NewAgentPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [address, setAddress] = useState('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            companyName: formData.get('companyName'),
            contactPerson: formData.get('contactPerson'),
            phoneNumber: formData.get('phoneNumber'),
            email: formData.get('email'),
            taxId: formData.get('taxId'),
            commissionRate: parseFloat(formData.get('commissionRate') as string) || 0,
            address: address, // From state
        }

        try {
            const res = await fetch('/api/agents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to create agent')
            }

            router.push('/dashboard/agents')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/dashboard/agents"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    กลับไปหน้ารายการ
                </Link>
                <h1 className="text-3xl font-bold">เพิ่มตัวแทน (New Agent)</h1>
                <p className="text-muted-foreground mt-1">กรอกข้อมูลตัวแทนจัดหาแรงงานรายใหม่</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Company Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Building2 className="w-5 h-5" />
                                ข้อมูลบริษัท
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">ชื่อบริษัท/ตัวแทน <span className="text-red-500">*</span></Label>
                                <Input id="companyName" name="companyName" required placeholder="บริษัท จัดหางาน จำกัด" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="taxId">เลขประจำตัวผู้เสียภาษี</Label>
                                <Input id="taxId" name="taxId" placeholder="เลข 13 หลัก" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="commissionRate">อัตราคอมมิชชั่น (%)</Label>
                                <div className="relative">
                                    <Input
                                        id="commissionRate"
                                        name="commissionRate"
                                        type="number"
                                        step="0.01"
                                        defaultValue="0"
                                        className="pr-8"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <User className="w-5 h-5" />
                                ข้อมูลติดต่อ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="contactPerson">ชื่อผู้ติดต่อ <span className="text-red-500">*</span></Label>
                                <Input id="contactPerson" name="contactPerson" required placeholder="คุณสมชาย ใจดี" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">เบอร์โทรศัพท์ <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input id="phoneNumber" name="phoneNumber" required className="pl-9" placeholder="08x-xxx-xxxx" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">อีเมล</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input id="email" name="email" type="email" className="pl-9" placeholder="example@email.com" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Address */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <FileText className="w-5 h-5" />
                            ที่อยู่
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AddressSelector
                            onAddressChange={setAddress}
                            defaultCountry="TH"
                        />
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        ยกเลิก
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                กำลังบันทึก...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                บันทึกข้อมูล
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
