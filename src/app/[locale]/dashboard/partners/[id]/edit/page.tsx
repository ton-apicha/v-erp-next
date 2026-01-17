// =====================================================
// Partner Edit Page
// Edit partner information
// =====================================================

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

// Lao provinces
const laoProvinces = [
    'ນະຄອນຫຼວງວຽງຈັນ', 'ຜົ້ງສາລີ', 'ຫຼວງນ້ຳທາ', 'ອຸດົມໄຊ', 'ບໍ່ແກ້ວ',
    'ຫຼວງພະບາງ', 'ຫົວພັນ', 'ໄຊຍະບູລີ', 'ຊຽງຂວາງ', 'ວຽງຈັນ',
    'ບໍລິຄຳໄຊ', 'ຄຳມ່ວນ', 'ສະຫວັນນະເຂດ', 'ສາລະວັນ', 'ເຊກອງ',
    'ຈຳປາສັກ', 'ອັດຕະປື', 'ໄຊສົມບູນ'
]

interface PartnerData {
    id: string
    partnerId: string
    name: string
    nickname: string | null
    phoneNumber: string
    address: string | null
    village: string | null
    district: string | null
    province: string | null
    status: string
    notes: string | null
}

export default function PartnerEditPage() {
    const router = useRouter()
    const params = useParams()
    const partnerId = params.id as string

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [partner, setPartner] = useState<PartnerData | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        nickname: '',
        phoneNumber: '',
        address: '',
        village: '',
        district: '',
        province: '',
        status: 'ACTIVE',
        notes: '',
    })

    // Load partner data
    useEffect(() => {
        const fetchPartner = async () => {
            try {
                const res = await fetch(`/api/partners/${partnerId}`)
                if (!res.ok) throw new Error('Failed to fetch partner')
                const data = await res.json()
                setPartner(data)
                setFormData({
                    name: data.name || '',
                    nickname: data.nickname || '',
                    phoneNumber: data.phoneNumber || '',
                    address: data.address || '',
                    village: data.village || '',
                    district: data.district || '',
                    province: data.province || '',
                    status: data.status || 'ACTIVE',
                    notes: data.notes || '',
                })
            } catch (error) {
                toast.error('ไม่สามารถโหลดข้อมูลพาร์ทเนอร์ได้')
                router.push('/dashboard/partners')
            } finally {
                setLoading(false)
            }
        }
        fetchPartner()
    }, [partnerId, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const res = await fetch(`/api/partners/${partnerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Failed to update partner')
            }

            toast.success('บันทึกข้อมูลสำเร็จ')
            router.push(`/dashboard/partners/${partnerId}`)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/partners/${partnerId}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">แก้ไขพาร์ทเนอร์</h1>
                    <p className="text-muted-foreground font-mono text-sm">{partner?.partnerId}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>ข้อมูลพาร์ทเนอร์</CardTitle>
                        <CardDescription>แก้ไขข้อมูลพาร์ทเนอร์ผู้พาแรงงานมา</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Name */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">ชื่อ-นามสกุล <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="ชื่อ-นามสกุล"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nickname">ชื่อเล่น</Label>
                                <Input
                                    id="nickname"
                                    value={formData.nickname}
                                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                                    placeholder="ชื่อเล่น"
                                />
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">เบอร์โทรศัพท์ <span className="text-red-500">*</span></Label>
                                <Input
                                    id="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    placeholder="020-XXXXXXXX"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">สถานะ</Label>
                                <select
                                    id="status"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="ACTIVE">ใช้งาน</option>
                                    <option value="INACTIVE">หยุดชั่วคราว</option>
                                    <option value="BLACKLISTED">บัญชีดำ</option>
                                </select>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                            <Label htmlFor="address">ที่อยู่</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="บ้านเลขที่, ถนน"
                            />
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="village">ບ້ານ (บ้าน)</Label>
                                <Input
                                    id="village"
                                    value={formData.village}
                                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                                    placeholder="ບ້ານ"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="district">ເມືອງ (เมือง)</Label>
                                <Input
                                    id="district"
                                    value={formData.district}
                                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                    placeholder="ເມືອງ"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="province">ແຂວງ (แขวง)</Label>
                                <select
                                    id="province"
                                    value={formData.province}
                                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">เลือกแขวง</option>
                                    {laoProvinces.map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">หมายเหตุ</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="หมายเหตุเพิ่มเติม..."
                                rows={4}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-4">
                    <Link href={`/dashboard/partners/${partnerId}`}>
                        <Button type="button" variant="outline">ยกเลิก</Button>
                    </Link>
                    <Button type="submit" disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                กำลังบันทึก...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                บันทึก
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
