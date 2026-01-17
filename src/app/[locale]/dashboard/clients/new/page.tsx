'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { ArrowLeft, Save, Loader2, Building2, User, Phone, Mail, FileText, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AddressSelector from '@/components/ui/address-selector'

export default function NewClientPage() {
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
            companyNameEN: formData.get('companyNameEN'),
            contactPerson: formData.get('contactPerson'),
            phoneNumber: formData.get('phoneNumber'),
            email: formData.get('email'),
            taxId: formData.get('taxId'),
            industry: formData.get('industry'),
            employeeCount: formData.get('employeeCount'), // Will be parsed in API
            address: address,
        }

        try {
            const res = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to create client')
            }

            router.push('/dashboard/clients')
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
                    href="/dashboard/clients"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    กลับไปหน้ารายการ
                </Link>
                <h1 className="text-3xl font-bold">เพิ่มนายจ้าง (New Client)</h1>
                <p className="text-muted-foreground mt-1">กรอกข้อมูลนายจ้าง/สถานประกอบการ</p>
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
                                ข้อมูลสถานประกอบการ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">ชื่อบริษัท (ไทย) <span className="text-red-500">*</span></Label>
                                <Input id="companyName" name="companyName" required placeholder="บริษัท กขค จำกัด" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="companyNameEN">ชื่อบริษัท (อังกฤษ)</Label>
                                <Input id="companyNameEN" name="companyNameEN" placeholder="ABC Co., Ltd." />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="taxId">เลขประจำตัวผู้เสียภาษี</Label>
                                <Input id="taxId" name="taxId" placeholder="13 หลัก" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="industry">ประเภทธุรกิจ</Label>
                                    <Select name="industry">
                                        <SelectTrigger>
                                            <SelectValue placeholder="เลือก..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Manufacturing">โรงงานอุตสาหกรรม</SelectItem>
                                            <SelectItem value="Construction">ก่อสร้าง</SelectItem>
                                            <SelectItem value="Agriculture">เกษตรกรรม</SelectItem>
                                            <SelectItem value="Service">บริการ</SelectItem>
                                            <SelectItem value="Other">อื่นๆ</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="employeeCount">จำนวนพนักงาน</Label>
                                    <Input id="employeeCount" name="employeeCount" type="number" placeholder="เช่น 100" />
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
                                <Input id="contactPerson" name="contactPerson" required placeholder="คุณสมหญิง" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">เบอร์โทรศัพท์ <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input id="phoneNumber" name="phoneNumber" required className="pl-9" placeholder="02-xxx-xxxx" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">อีเมล</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input id="email" name="email" type="email" className="pl-9" placeholder="hr@company.com" />
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
                            ที่อยู่บริษัท
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
