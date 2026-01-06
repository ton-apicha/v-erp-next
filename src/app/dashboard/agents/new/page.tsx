'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { createAgent } from '@/actions/partners'

export default function NewAgentPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const formData = new FormData(e.currentTarget)
            const agent = await createAgent(formData)
            router.push(`/dashboard/agents/${agent.id}`)
        } catch (error) {
            console.error('Create agent failed:', error)
            alert('สร้างตัวแทนไม่สำเร็จ')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/agents">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">เพิ่มตัวแทนใหม่</h1>
                    <p className="text-muted-foreground">กรอกข้อมูลตัวแทนจัดหาแรงงาน</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Company Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>ข้อมูลบริษัท</CardTitle>
                            <CardDescription>ข้อมูลบริษัทตัวแทน</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">ชื่อบริษัท *</label>
                                <Input
                                    name="companyName"
                                    placeholder="บริษัท ตัวแทนจัดหาแรงงาน จำกัด"
                                    required
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">เลขทะเบียนบริษัท</label>
                                    <Input name="registrationNo" placeholder="0-0000-00000-00-0" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">อัตราค่าคอมมิชชั่น (%)</label>
                                    <Input
                                        name="commissionRate"
                                        type="number"
                                        placeholder="5"
                                        defaultValue="5"
                                        min="0"
                                        max="100"
                                        step="0.5"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">ที่อยู่</label>
                                <Input name="address" placeholder="ที่อยู่บริษัท" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">เบอร์โทรศัพท์</label>
                                    <Input name="phone" type="tel" placeholder="02-xxx-xxxx" />
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
                                <label className="text-sm font-medium">ชื่อผู้ติดต่อ</label>
                                <Input name="contactName" placeholder="ชื่อ-นามสกุล" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">เบอร์โทรผู้ติดต่อ</label>
                                    <Input name="contactPhone" type="tel" placeholder="08x-xxx-xxxx" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Line ID</label>
                                    <Input name="lineId" placeholder="@lineid" />
                                </div>
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
                    <Link href="/dashboard/agents">
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
