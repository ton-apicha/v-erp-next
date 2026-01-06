'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { createClient } from '@/actions/partners'

const industries = [
    'การผลิต',
    'ก่อสร้าง',
    'เกษตรกรรม',
    'ประมง',
    'บริการ',
    'ร้านอาหาร',
    'โรงแรม',
    'ค้าปลีก',
    'อื่นๆ',
]

export default function NewClientPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const formData = new FormData(e.currentTarget)
            const client = await createClient(formData)
            router.push(`/dashboard/clients/${client.id}`)
        } catch (error) {
            console.error('Create client failed:', error)
            alert('สร้างนายจ้างไม่สำเร็จ')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/clients">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">เพิ่มนายจ้างใหม่</h1>
                    <p className="text-muted-foreground">กรอกข้อมูลนายจ้าง/บริษัทจ้างแรงงาน</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Company Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>ข้อมูลบริษัท</CardTitle>
                            <CardDescription>ข้อมูลบริษัทนายจ้าง</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">ชื่อบริษัท (ไทย) *</label>
                                <Input
                                    name="companyName"
                                    placeholder="บริษัท นายจ้าง จำกัด"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">ชื่อบริษัท (อังกฤษ)</label>
                                <Input
                                    name="companyNameEN"
                                    placeholder="Company Name Co., Ltd."
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">ประเภทธุรกิจ</label>
                                    <select
                                        name="industry"
                                        className="w-full h-10 px-3 border rounded-md text-sm"
                                    >
                                        <option value="">เลือกประเภท</option>
                                        {industries.map((ind) => (
                                            <option key={ind} value={ind}>
                                                {ind}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">เลขประจำตัวผู้เสียภาษี</label>
                                    <Input name="taxId" placeholder="0-0000-00000-00-0" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">ที่อยู่</label>
                                <Input name="address" placeholder="ที่อยู่บริษัท" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">เบอร์โทรศัพท์ *</label>
                                    <Input name="phone" type="tel" placeholder="02-xxx-xxxx" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">อีเมล</label>
                                    <Input name="email" type="email" placeholder="contact@company.com" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Person */}
                    <Card>
                        <CardHeader>
                            <CardTitle>ผู้ติดต่อ</CardTitle>
                            <CardDescription>ข้อมูลผู้ติดต่อหลัก</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">ชื่อผู้ติดต่อ *</label>
                                <Input name="contactName" placeholder="ชื่อ-นามสกุล" required />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>หมายเหตุ</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Input name="notes" placeholder="หมายเหตุเพิ่มเติม..." />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 mt-6">
                    <Link href="/dashboard/clients">
                        <Button variant="outline" type="button">ยกเลิก</Button>
                    </Link>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                กำลังบันทึก...
                            </>
                        ) : (
                            'บันทึก'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
