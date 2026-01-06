'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react' // Next.js 15
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Building2, User, Phone, Mail, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import AddressSelector from '@/components/ui/address-selector'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function EditAgentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()

    // States
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [data, setData] = useState<any>(null)
    const [address, setAddress] = useState('')

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/agents/${id}`)
                if (!res.ok) throw new Error('Failed to fetch agent')
                const agent = await res.json()
                setData(agent)
                setAddress(agent.address || '')
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setSaving(true)

        const formData = new FormData(e.currentTarget)
        const updateData = {
            companyName: formData.get('companyName'),
            contactPerson: formData.get('contactPerson'),
            phoneNumber: formData.get('phoneNumber'),
            email: formData.get('email'),
            taxId: formData.get('taxId'),
            commissionRate: parseFloat(formData.get('commissionRate') as string) || 0,
            status: formData.get('status'),
            address: address,
        }

        try {
            const res = await fetch(`/api/agents/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Update failed')
            }

            router.push(`/dashboard/agents/${id}`)
            router.refresh()
        } catch (err: any) {
            setError(err.message)
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>

    if (!data) return <div className="p-8 text-center text-red-500">Agent not found</div>

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href={`/dashboard/agents/${id}`}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    กลับไปหน้าเช็ครายละเอียด
                </Link>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">แก้ไขข้อมูลตัวแทน</h1>
                        <p className="text-muted-foreground mt-1">ID: {data.agentId}</p>
                    </div>
                    <div>
                        {/* Status Batch */}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium
                            ${data.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                        `}>
                            {data.status}
                        </span>
                    </div>
                </div>
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
                                <Input id="companyName" name="companyName" required defaultValue={data.companyName} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="taxId">เลขประจำตัวผู้เสียภาษี</Label>
                                <Input id="taxId" name="taxId" defaultValue={data.taxId} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="commissionRate">อัตราคอมมิชชั่น (%)</Label>
                                <div className="relative">
                                    <Input
                                        id="commissionRate"
                                        name="commissionRate"
                                        type="number"
                                        step="0.01"
                                        defaultValue={data.commissionRate}
                                        className="pr-8"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">สถานะ</Label>
                                <Select name="status" defaultValue={data.status || 'ACTIVE'}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING">รอดำเนินการ</SelectItem>
                                        <SelectItem value="ACTIVE">ใช้งานปกติ</SelectItem>
                                        <SelectItem value="SUSPENDED">ระงับชั่วคราว</SelectItem>
                                        <SelectItem value="BANNED">แบนถาวร</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                <Input id="contactPerson" name="contactPerson" required defaultValue={data.contactPerson} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">เบอร์โทรศัพท์ <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input id="phoneNumber" name="phoneNumber" required className="pl-9" defaultValue={data.phoneNumber} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">อีเมล</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input id="email" name="email" type="email" className="pl-9" defaultValue={data.email} />
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
                            initialAddress={data.address} // Need to handle detail parsing in component ideally, but string is ok for now
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            ที่อยู่เดิม: {data.address}
                        </p>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        ยกเลิก
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                กำลังบันทึก...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                บันทึกการแก้ไข
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
