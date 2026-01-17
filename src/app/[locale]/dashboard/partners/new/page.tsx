'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

// =========================================
// Partner Form Page (Create)
// =========================================

export default function NewPartnerPage() {
    const router = useRouter()
    const locale = useLocale()
    const [loading, setLoading] = useState(false)

    // Labels
    const labels = {
        title: locale === 'la' ? 'ເພີ່ມພາດເນີໃໝ່' : 'เพิ่มพาร์ทเนอร์ใหม่',
        back: locale === 'la' ? 'ກັບຄືນ' : 'กลับ',
        save: locale === 'la' ? 'ບັນທຶກ' : 'บันทึก',
        saving: locale === 'la' ? 'ກຳລັງບັນທຶກ...' : 'กำลังบันทึก...',

        // Form fields
        personalInfo: locale === 'la' ? 'ຂໍ້ມູນສ່ວນຕົວ' : 'ข้อมูลส่วนตัว',
        name: locale === 'la' ? 'ຊື່' : 'ชื่อ',
        namePlaceholder: locale === 'la' ? 'ປ້ອນຊື່ພາດເນີ' : 'กรอกชื่อพาร์ทเนอร์',
        nickname: locale === 'la' ? 'ຊື່ຫຼິ້ນ' : 'ชื่อเล่น',
        nicknamePlaceholder: locale === 'la' ? 'ປ້ອນຊື່ຫຼິ້ນ (ຖ້າມີ)' : 'กรอกชื่อเล่น (ถ้ามี)',
        phone: locale === 'la' ? 'ເບີໂທ' : 'เบอร์โทร',
        phonePlaceholder: locale === 'la' ? 'ປ້ອນເບີໂທ' : 'กรอกเบอร์โทร',

        addressInfo: locale === 'la' ? 'ທີ່ຢູ່' : 'ที่อยู่',
        address: locale === 'la' ? 'ທີ່ຢູ່' : 'ที่อยู่',
        addressPlaceholder: locale === 'la' ? 'ປ້ອນທີ່ຢູ່' : 'กรอกที่อยู่',
        village: locale === 'la' ? 'ບ້ານ' : 'หมู่บ้าน',
        villagePlaceholder: locale === 'la' ? 'ປ້ອນບ້ານ' : 'กรอกหมู่บ้าน',
        district: locale === 'la' ? 'ເມືອງ' : 'อำเภอ',
        districtPlaceholder: locale === 'la' ? 'ປ້ອນເມືອງ' : 'กรอกอำเภอ',
        province: locale === 'la' ? 'ແຂວງ' : 'จังหวัด',
        provincePlaceholder: locale === 'la' ? 'ເລືອກແຂວງ' : 'เลือกจังหวัด',

        otherInfo: locale === 'la' ? 'ຂໍ້ມູນອື່ນໆ' : 'ข้อมูลอื่นๆ',
        status: locale === 'la' ? 'ສະຖານະ' : 'สถานะ',
        statusActive: locale === 'la' ? 'ໃຊ້ງານ' : 'ใช้งาน',
        statusInactive: locale === 'la' ? 'ຢຸດໃຊ້ງານ' : 'หยุดใช้งาน',
        notes: locale === 'la' ? 'ໝາຍເຫດ' : 'หมายเหตุ',
        notesPlaceholder: locale === 'la' ? 'ປ້ອນໝາຍເຫດ (ຖ້າມີ)' : 'กรอกหมายเหตุ (ถ้ามี)',

        // Messages
        success: locale === 'la' ? 'ເພີ່ມພາດເນີສຳເລັດ' : 'เพิ่มพาร์ทเนอร์สำเร็จ',
        error: locale === 'la' ? 'ເກີດຂໍ້ຜິດພາດ' : 'เกิดข้อผิดพลาด',
        required: locale === 'la' ? 'ກະລຸນາກວດສອບຂໍ້ມູນ' : 'กรุณาตรวจสอบข้อมูล',
    }

    // Lao provinces
    const laoProvinces = [
        'ນະຄອນຫຼວງວຽງຈັນ',
        'ຜົ້ງສາລີ',
        'ຫຼວງນ້ຳທາ',
        'ອຸດົມໄຊ',
        'ບໍ່ແກ້ວ',
        'ຫຼວງພະບາງ',
        'ຫົວພັນ',
        'ໄຊຍະບູລີ',
        'ຊຽງຂວາງ',
        'ວຽງຈັນ',
        'ບໍລິຄຳໄຊ',
        'ຄຳມ່ວນ',
        'ສະຫວັນນະເຂດ',
        'ສາລະວັນ',
        'ເຊກອງ',
        'ຈຳປາສັກ',
        'ອັດຕະປື',
        'ໄຊສົມບູນ',
    ]

    // Form state
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

    // Handle form change
    function handleChange(field: string, value: string) {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    // Handle submit
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        // Validate
        if (!formData.name || !formData.phoneNumber) {
            toast.error(labels.required)
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/partners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                toast.success(labels.success)
                router.push('/dashboard/partners')
            } else {
                const data = await res.json()
                toast.error(data.error || labels.error)
            }
        } catch (error) {
            console.error('Error creating partner:', error)
            toast.error(labels.error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/partners">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{labels.title}</h1>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>{labels.personalInfo}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">{labels.name} *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder={labels.namePlaceholder}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nickname">{labels.nickname}</Label>
                                <Input
                                    id="nickname"
                                    value={formData.nickname}
                                    onChange={(e) => handleChange('nickname', e.target.value)}
                                    placeholder={labels.nicknamePlaceholder}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">{labels.phone} *</Label>
                            <Input
                                id="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                                placeholder={labels.phonePlaceholder}
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Address */}
                <Card>
                    <CardHeader>
                        <CardTitle>{labels.addressInfo}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="address">{labels.address}</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                placeholder={labels.addressPlaceholder}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="village">{labels.village}</Label>
                                <Input
                                    id="village"
                                    value={formData.village}
                                    onChange={(e) => handleChange('village', e.target.value)}
                                    placeholder={labels.villagePlaceholder}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="district">{labels.district}</Label>
                                <Input
                                    id="district"
                                    value={formData.district}
                                    onChange={(e) => handleChange('district', e.target.value)}
                                    placeholder={labels.districtPlaceholder}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="province">{labels.province}</Label>
                                <Select
                                    value={formData.province}
                                    onValueChange={(value) => handleChange('province', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={labels.provincePlaceholder} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {laoProvinces.map((province) => (
                                            <SelectItem key={province} value={province}>
                                                {province}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Other Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>{labels.otherInfo}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">{labels.status}</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleChange('status', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">{labels.statusActive}</SelectItem>
                                    <SelectItem value="INACTIVE">{labels.statusInactive}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">{labels.notes}</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                placeholder={labels.notesPlaceholder}
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Link href="/dashboard/partners">
                        <Button type="button" variant="outline">
                            {labels.back}
                        </Button>
                    </Link>
                    <Button type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {labels.saving}
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                {labels.save}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
