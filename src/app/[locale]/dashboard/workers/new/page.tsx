'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, User, Phone, MapPin, FileText, Briefcase, Handshake } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AddressSelector from '@/components/ui/address-selector'


interface ShortList {
    id: string
    name: string
    code: string
}

export default function NewWorkerPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [address, setAddress] = useState('')

    // Lists
    const [partners, setPartners] = useState<ShortList[]>([])
    const [clients, setClients] = useState<ShortList[]>([])

    // Pre-selected partner from URL
    const preSelectedPartnerId = searchParams.get('partnerId')

    // Load Lists
    useEffect(() => {
        const fetchLists = async () => {
            try {
                const [partnersRes, clientsRes] = await Promise.all([
                    fetch('/api/partners?minimal=true'),
                    fetch('/api/clients?minimal=true')
                ])

                if (partnersRes.ok) {
                    const data = await partnersRes.json()
                    setPartners(data.map((i: any) => ({ id: i.id, name: i.name, code: i.partnerId })))
                }
                if (clientsRes.ok) {
                    const data = await clientsRes.json()
                    setClients(data.map((i: any) => ({ id: i.id, name: i.companyName, code: i.clientId })))
                }
            } catch (err) {
                console.error('Failed to load lists', err)
            }
        }
        fetchLists()
    }, [])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            firstNameTH: formData.get('firstNameTH'),
            lastNameTH: formData.get('lastNameTH'),
            nickname: formData.get('nickname'),
            gender: formData.get('gender'),
            dateOfBirth: formData.get('dateOfBirth'),
            nationality: formData.get('nationality'),
            phoneNumber: formData.get('phoneNumber'),
            address: address, // Standardized address
            passportNo: formData.get('passportNo'),
            visaNo: formData.get('visaNo'),
            workPermitNo: formData.get('workPermitNo'),
            // Document Tags
            hasPassport: formData.get('hasPassport') === 'true',
            hasVisa: formData.get('hasVisa') === 'true',
            hasWorkPermit: formData.get('hasWorkPermit') === 'true',
            hasMedicalCert: formData.get('hasMedicalCert') === 'true',
            hasAcademyTraining: formData.get('hasAcademyTraining') === 'true',
            // Relations
            partnerId: formData.get('partnerId') || null,
            clientId: formData.get('clientId') || null,
            position: formData.get('position'),
            salary: formData.get('salary') ? parseFloat(formData.get('salary') as string) : null,
        }

        try {
            const res = await fetch('/api/workers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.message || 'Failed to create worker')
            }

            router.push('/dashboard/workers')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/dashboard/workers"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    กลับไปหน้ารายการ
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">เพิ่มแรงงานใหม่</h1>
                        <p className="text-muted-foreground mt-1">ลงทะเบียนแรงงานเพื่อเข้าสู่ระบบ</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Column 1 & 2: Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <User className="w-5 h-5" />
                                    ข้อมูลส่วนตัว
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstNameTH">ชื่อ (ไทย) <span className="text-red-500">*</span></Label>
                                    <Input id="firstNameTH" name="firstNameTH" required placeholder="สมชาย" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastNameTH">นามสกุล (ไทย) <span className="text-red-500">*</span></Label>
                                    <Input id="lastNameTH" name="lastNameTH" required placeholder="ใจดี" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nickname">ชื่อเล่น</Label>
                                    <Input id="nickname" name="nickname" placeholder="ชาย" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gender">เพศ <span className="text-red-500">*</span></Label>
                                    <Select name="gender" required defaultValue="">
                                        <SelectTrigger>
                                            <SelectValue placeholder="เลือกเพศ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MALE">ชาย</SelectItem>
                                            <SelectItem value="FEMALE">หญิง</SelectItem>
                                            <SelectItem value="OTHER">อื่นๆ</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dateOfBirth">วันเกิด <span className="text-red-500">*</span></Label>
                                    <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nationality">สัญชาติ</Label>
                                    <Select name="nationality" defaultValue="LAO">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LAO">ลาว</SelectItem>
                                            <SelectItem value="THAI">ไทย</SelectItem>
                                            <SelectItem value="MYANMAR">พม่า</SelectItem>
                                            <SelectItem value="CAMBODIAN">กัมพูชา</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact & Address */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <MapPin className="w-5 h-5" />
                                    การติดต่อและที่อยู่
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phoneNumber">เบอร์โทรศัพท์</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input id="phoneNumber" name="phoneNumber" className="pl-9" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lineId">LINE ID</Label>
                                        <Input id="lineId" name="lineId" />
                                    </div>
                                </div>

                                {/* Address Selector for Worker (Probably Laos default?) */}
                                <div className="space-y-2 pt-2 border-t">
                                    <Label>ที่อยู่ตามทะเบียนบ้าน/บัตรประชาชน</Label>
                                    <AddressSelector
                                        onAddressChange={setAddress}
                                        defaultCountry="LA"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Column 3: Employment & Docs */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Employment */}
                        <Card className="border-blue-200 bg-blue-50/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
                                    <Briefcase className="w-5 h-5" />
                                    ข้อมูลการจ้างงาน
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="partnerId" className="flex items-center gap-1">
                                        <Handshake className="w-4 h-4" />
                                        พาร์ทเนอร์
                                    </Label>
                                    <Select name="partnerId" defaultValue={preSelectedPartnerId || ''}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="เลือกพาร์ทเนอร์..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">ไม่ระบุ</SelectItem>
                                            {partners.map((partner) => (
                                                <SelectItem key={partner.id} value={partner.id}>
                                                    {partner.name} ({partner.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="clientId">นายจ้าง (Client)</Label>
                                    <Select name="clientId">
                                        <SelectTrigger>
                                            <SelectValue placeholder="เลือกนายจ้าง..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clients.map((client) => (
                                                <SelectItem key={client.id} value={client.id}>
                                                    {client.name}
                                                </SelectItem>
                                            ))}
                                            <SelectItem value="none">ไม่ระบุ</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="position">ตำแหน่งงาน</Label>
                                    <Input id="position" name="position" placeholder="เช่น พนักงานฝ่ายผลิต" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="salary">เงินเดือนคาดหวัง</Label>
                                    <Input id="salary" name="salary" type="number" placeholder="0.00" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Documents IDs */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <FileText className="w-5 h-5" />
                                    เอกสารสำคัญ
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="passportNo">เลขที่ Passport</Label>
                                    <Input id="passportNo" name="passportNo" placeholder="Pxxxxxxxx" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="visaNo">เลขที่ Visa</Label>
                                    <Input id="visaNo" name="visaNo" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="workPermitNo">เลขที่ Work Permit</Label>
                                    <Input id="workPermitNo" name="workPermitNo" />
                                </div>

                                {/* Document Tags */}
                                <div className="pt-4 border-t">
                                    <Label className="mb-3 block">สถานะเอกสาร (Tags)</Label>
                                    <div className="grid grid-cols-1 gap-2">
                                        <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-2 rounded">
                                            <input type="checkbox" name="hasPassport" value="true" className="rounded" />
                                            มี Passport
                                        </label>
                                        <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-2 rounded">
                                            <input type="checkbox" name="hasVisa" value="true" className="rounded" />
                                            มี Visa
                                        </label>
                                        <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-2 rounded">
                                            <input type="checkbox" name="hasWorkPermit" value="true" className="rounded" />
                                            มีใบอนุญาตทำงาน
                                        </label>
                                        <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-2 rounded">
                                            <input type="checkbox" name="hasMedicalCert" value="true" className="rounded" />
                                            มีใบรับรองแพทย์
                                        </label>
                                        <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-2 rounded">
                                            <input type="checkbox" name="hasAcademyTraining" value="true" className="rounded" />
                                            ผ่านการฝึกอบรม
                                        </label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col gap-3">
                            <Button type="submit" size="lg" disabled={loading} className="w-full">
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        บันทึกข้อมูลแรงงาน
                                    </>
                                )}
                            </Button>
                            <Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>
                                ยกเลิก
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
