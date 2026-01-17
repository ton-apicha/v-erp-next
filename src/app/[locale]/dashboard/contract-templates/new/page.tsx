'use client'

// =====================================================
// New Contract Template Form
// =====================================================

import { useState } from 'react'
import { useRouter, Link } from '@/i18n/routing'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    FileText,
    ArrowLeft,
    Save,
    Loader2,
    Plus,
    X,
    AlertCircle,
    Briefcase,
    FileSignature,
    Handshake,
} from 'lucide-react'

// Available variables
const availableVariables = [
    { group: 'worker', vars: ['worker.name', 'worker.nickname', 'worker.nationality', 'worker.passportNo'] },
    { group: 'client', vars: ['client.companyName', 'client.contactPerson', 'client.address'] },
    { group: 'contract', vars: ['contract.startDate', 'contract.endDate', 'contract.salary', 'contract.position'] },
]

export default function NewContractTemplatePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [variables, setVariables] = useState<string[]>([])
    const [customVar, setCustomVar] = useState('')

    const addVariable = (v: string) => {
        if (!variables.includes(v)) {
            setVariables([...variables, v])
        }
    }

    const removeVariable = (v: string) => {
        setVariables(variables.filter(x => x !== v))
    }

    const addCustomVariable = () => {
        if (customVar && !variables.includes(customVar)) {
            setVariables([...variables, customVar])
            setCustomVar('')
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name'),
            nameLA: formData.get('nameLA') || null,
            category: formData.get('category'),
            contentTH: formData.get('contentTH') || null,
            contentLA: formData.get('contentLA') || null,
            variables: variables,
            isActive: formData.get('isActive') === 'true',
        }

        try {
            const res = await fetch('/api/contract-templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'เกิดข้อผิดพลาด')
            }

            router.push('/dashboard/contract-templates')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/contract-templates">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <FileText className="h-6 w-6" />
                        เพิ่ม Template สัญญา
                    </h1>
                    <p className="text-muted-foreground">สร้าง Template สัญญาใหม่</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">ข้อมูลพื้นฐาน</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">ชื่อ Template <span className="text-red-500">*</span></Label>
                            <Input id="name" name="name" required placeholder="สัญญาจ้างแรงงานมาตรฐาน" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nameLA">ชื่อ (ลาว)</Label>
                            <Input id="nameLA" name="nameLA" placeholder="ສັນຍາຈ້າງແຮງງານມາດຕະຖານ" />
                        </div>
                        <div className="space-y-2">
                            <Label>ประเภท <span className="text-red-500">*</span></Label>
                            <Select name="category" required defaultValue="">
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกประเภท" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="employment">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4" />
                                            สัญญาจ้าง
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="service">
                                        <div className="flex items-center gap-2">
                                            <FileSignature className="h-4 w-4" />
                                            สัญญาบริการ
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="mou">
                                        <div className="flex items-center gap-2">
                                            <Handshake className="h-4 w-4" />
                                            บันทึกข้อตกลง (MOU)
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>สถานะ</Label>
                            <Select name="isActive" defaultValue="true">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">ใช้งาน</SelectItem>
                                    <SelectItem value="false">ไม่ใช้งาน</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Variables */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">ตัวแปร (Variables)</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            ตัวแปรที่ใช้ในเนื้อหา เช่น {`{{worker.name}}`}
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Quick add */}
                        {availableVariables.map((group) => (
                            <div key={group.group}>
                                <p className="text-xs text-muted-foreground mb-2 capitalize">{group.group}</p>
                                <div className="flex flex-wrap gap-2">
                                    {group.vars.map((v) => (
                                        <Button
                                            key={v}
                                            type="button"
                                            variant={variables.includes(v) ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => variables.includes(v) ? removeVariable(v) : addVariable(v)}
                                        >
                                            {v}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Custom variable */}
                        <div className="flex gap-2">
                            <Input
                                placeholder="เพิ่มตัวแปรเอง เช่น custom.field"
                                value={customVar}
                                onChange={(e) => setCustomVar(e.target.value)}
                            />
                            <Button type="button" variant="outline" onClick={addCustomVariable}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Selected variables */}
                        {variables.length > 0 && (
                            <div className="pt-4 border-t">
                                <p className="text-sm font-medium mb-2">ตัวแปรที่เลือก ({variables.length}):</p>
                                <div className="flex flex-wrap gap-2">
                                    {variables.map((v) => (
                                        <Badge key={v} variant="secondary" className="font-mono">
                                            {`{{${v}}}`}
                                            <button
                                                type="button"
                                                className="ml-2 hover:text-red-500"
                                                onClick={() => removeVariable(v)}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Content */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">เนื้อหา</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="contentTH">เนื้อหา (ไทย)</Label>
                            <Textarea
                                id="contentTH"
                                name="contentTH"
                                placeholder={`สัญญาฉบับนี้ทำขึ้นระหว่าง {{client.companyName}} และ {{worker.name}}...`}
                                rows={8}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contentLA">เนื้อหา (ลาว)</Label>
                            <Textarea
                                id="contentLA"
                                name="contentLA"
                                placeholder="ສັນຍາສະບັບນີ້ເຮັດຂຶ້ນລະຫວ່າງ..."
                                rows={8}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex gap-4 justify-end">
                    <Link href="/dashboard/contract-templates">
                        <Button type="button" variant="outline">ยกเลิก</Button>
                    </Link>
                    <Button type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                กำลังบันทึก...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                บันทึก Template
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
