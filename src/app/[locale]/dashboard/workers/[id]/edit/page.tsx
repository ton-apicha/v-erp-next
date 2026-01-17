'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { Link } from '@/i18n/routing'
import { ArrowLeft, Save, Loader2, User, Phone, MapPin, FileText, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AddressSelector from '@/components/ui/address-selector'
import { format } from 'date-fns'

interface ShortList {
    id: string
    name: string
}

export default function EditWorkerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()

    // States
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [data, setData] = useState<any>(null)
    const [address, setAddress] = useState('')

    // Lists
    const [agents, setAgents] = useState<ShortList[]>([])
    const [clients, setClients] = useState<ShortList[]>([])

    // Load Data & Lists
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel fetch
                const [workerRes, agentsRes, clientsRes] = await Promise.all([
                    fetch(`/api/workers/${id}`),
                    fetch('/api/agents?minimal=true'),
                    fetch('/api/clients?minimal=true')
                ])

                if (!workerRes.ok) throw new Error('Failed to fetch worker')

                const workerData = await workerRes.json()
                setData(workerData)
                setAddress(workerData.address || '')

                if (agentsRes.ok) {
                    const agentData = await agentsRes.json()
                    setAgents(agentData.map((i: any) => ({ id: i.id, name: i.companyName })))
                }
                if (clientsRes.ok) {
                    const clientData = await clientsRes.json()
                    setClients(clientData.map((i: any) => ({ id: i.id, name: i.companyName })))
                }

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
            firstNameTH: formData.get('firstNameTH'),
            lastNameTH: formData.get('lastNameTH'),
            firstNameEN: formData.get('firstNameEN'),
            lastNameEN: formData.get('lastNameEN'),
            nickname: formData.get('nickname'),
            gender: formData.get('gender'),
            dateOfBirth: formData.get('dateOfBirth'), // Ensure YYYY-MM-DD
            nationality: formData.get('nationality'),
            religion: formData.get('religion'),
            phoneNumber: formData.get('phoneNumber'),
            email: formData.get('email'),
            lineId: formData.get('lineId'),
            address: address,
            passportNo: formData.get('passportNo'),
            visaNo: formData.get('visaNo'),
            workPermitNo: formData.get('workPermitNo'),
            agentId: formData.get('agentId') === 'none' ? null : formData.get('agentId'),
            clientId: formData.get('clientId') === 'none' ? null : formData.get('clientId'),
            position: formData.get('position'),
            salary: formData.get('salary') ? parseFloat(formData.get('salary') as string) : null,
            status: formData.get('status'), // Status handling
        }

        try {
            const res = await fetch(`/api/workers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Update failed')
            }

            router.push(`/dashboard/workers/${id}`)
            router.refresh()
        } catch (err: any) {
            setError(err.message)
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
    if (!data) return <div className="p-8 text-center text-red-500">Worker not found</div>

    // Helper for date input (YYYY-MM-DD)
    const formatDateForInput = (dateString: string) => {
        if (!dateString) return ''
        return dateString.split('T')[0]
    }

    return (
        <div className="max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href={`/dashboard/workers/${id}`}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    กลับไปหน้าเช็ครายละเอียด
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">แก้ไขข้อมูลแรงงาน</h1>
                        <p className="text-muted-foreground mt-1">{data.workerId} - {data.firstNameTH} {data.lastNameTH}</p>
                    </div>
                    <div>
                        {/* Status Batch */}
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
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
                                    <Input id="firstNameTH" name="firstNameTH" required defaultValue={data.firstNameTH} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastNameTH">นามสกุล (ไทย) <span className="text-red-500">*</span></Label>
                                    <Input id="lastNameTH" name="lastNameTH" required defaultValue={data.lastNameTH} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="firstNameEN">ชื่อ (อังกฤษ)</Label>
                                    <Input id="firstNameEN" name="firstNameEN" defaultValue={data.firstNameEN || ''} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastNameEN">นามสกุล (อังกฤษ)</Label>
                                    <Input id="lastNameEN" name="lastNameEN" defaultValue={data.lastNameEN || ''} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nickname">ชื่อเล่น</Label>
                                    <Input id="nickname" name="nickname" defaultValue={data.nickname || ''} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gender">เพศ <span className="text-red-500">*</span></Label>
                                    <Select name="gender" required defaultValue={data.gender}>
                                        <SelectTrigger>
                                            <SelectValue />
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
                                    <Input
                                        id="dateOfBirth"
                                        name="dateOfBirth"
                                        type="date"
                                        required
                                        defaultValue={formatDateForInput(data.dateOfBirth)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nationality">สัญชาติ</Label>
                                    <Select name="nationality" defaultValue={data.nationality || 'LAO'}>
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
                                <div className="space-y-2">
                                    <Label htmlFor="religion">ศาสนา</Label>
                                    <Input id="religion" name="religion" defaultValue={data.religion || ''} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">สถานะปัจจุบัน</Label>
                                    <Select name="status" defaultValue={data.status}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NEW_LEAD">New Lead</SelectItem>
                                            <SelectItem value="SCREENING">Screening</SelectItem>
                                            <SelectItem value="PROCESSING">Processing</SelectItem>
                                            <SelectItem value="RDY">Ready</SelectItem>
                                            <SelectItem value="DEPLOYED">Deployed</SelectItem>
                                            <SelectItem value="WORKING">Working</SelectItem>
                                            <SelectItem value="RESIGNED">Resigned</SelectItem>
                                            <SelectItem value="TERMINATED">Terminated</SelectItem>
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
                                            <Input id="phoneNumber" name="phoneNumber" className="pl-9" defaultValue={data.phoneNumber || ''} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lineId">LINE ID</Label>
                                        <Input id="lineId" name="lineId" defaultValue={data.lineId || ''} />
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t">
                                    <Label>ที่อยู่</Label>
                                    <AddressSelector
                                        onAddressChange={setAddress}
                                        defaultCountry={data.nationality === 'THAI' ? 'TH' : 'LA'}
                                        initialAddress={data.address}
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        ที่อยู่เดิม: {data.address}
                                    </p>
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
                                    <Label htmlFor="agentId">นายหน้า/ตัวแทน (Agent)</Label>
                                    <Select name="agentId" defaultValue={data.agentId || 'none'}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="เลือกตัวแทน..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {agents.map((agent) => (
                                                <SelectItem key={agent.id} value={agent.id}>
                                                    {agent.name}
                                                </SelectItem>
                                            ))}
                                            <SelectItem value="none">ไม่ระบุ</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="clientId">นายจ้าง (Client)</Label>
                                    <Select name="clientId" defaultValue={data.clientId || 'none'}>
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
                                    <Input id="position" name="position" defaultValue={data.position || ''} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="salary">เงินเดือนคาดหวัง</Label>
                                    <Input id="salary" name="salary" type="number" defaultValue={data.salary || ''} />
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
                                    <Input id="passportNo" name="passportNo" defaultValue={data.passportNo || ''} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="visaNo">เลขที่ Visa</Label>
                                    <Input id="visaNo" name="visaNo" defaultValue={data.visaNo || ''} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="workPermitNo">เลขที่ Work Permit</Label>
                                    <Input id="workPermitNo" name="workPermitNo" defaultValue={data.workPermitNo || ''} />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col gap-3">
                            <Button type="submit" size="lg" disabled={saving} className="w-full">
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
