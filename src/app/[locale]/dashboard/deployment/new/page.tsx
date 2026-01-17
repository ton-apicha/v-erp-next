'use client'

// =====================================================
// Deploy Worker Form Page
// Assign worker to client
// =====================================================

import { useState, useEffect } from 'react'
import { useRouter, Link } from '@/i18n/routing'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
    Truck,
    ArrowLeft,
    Save,
    Loader2,
    AlertCircle,
    User,
    Building2,
    Calendar,
    Briefcase,
    DollarSign,
    CheckCircle,
} from 'lucide-react'

interface Worker {
    id: string
    workerId: string
    firstNameTH: string
    lastNameTH: string
    nickname: string | null
    status: string
}

interface Client {
    id: string
    clientId: string
    companyNameTH: string | null
    personName: string | null
    type: string
}

export default function DeployWorkerPage() {
    const router = useRouter()

    const [workers, setWorkers] = useState<Worker[]>([])
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [selectedWorkerId, setSelectedWorkerId] = useState('')
    const [selectedClientId, setSelectedClientId] = useState('')
    const [deploymentDate, setDeploymentDate] = useState(
        new Date().toISOString().split('T')[0]
    )
    const [position, setPosition] = useState('')
    const [salary, setSalary] = useState('')
    const [notes, setNotes] = useState('')

    // Fetch workers and clients
    useEffect(() => {
        async function fetchData() {
            try {
                const [workersRes, clientsRes] = await Promise.all([
                    fetch('/api/workers?status=READY&limit=100'),
                    fetch('/api/clients?limit=100'),
                ])

                if (workersRes.ok) {
                    const wData = await workersRes.json()
                    setWorkers(wData.workers || wData || [])
                }
                if (clientsRes.ok) {
                    const cData = await clientsRes.json()
                    setClients(cData.clients || cData || [])
                }
            } catch (err) {
                console.error('Error fetching data:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const selectedWorker = workers.find(w => w.id === selectedWorkerId)
    const selectedClient = clients.find(c => c.id === selectedClientId)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setSubmitting(true)

        try {
            const res = await fetch('/api/deployment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workerId: selectedWorkerId,
                    clientId: selectedClientId,
                    deploymentDate,
                    position,
                    salary,
                    notes,
                }),
            })

            const result = await res.json()

            if (!res.ok) {
                throw new Error(result.error || 'เกิดข้อผิดพลาด')
            }

            setSuccess(result.message)

            // Reset form
            setSelectedWorkerId('')
            setPosition('')
            setSalary('')
            setNotes('')

            // Remove deployed worker from list
            setWorkers(prev => prev.filter(w => w.id !== selectedWorkerId))

            // Redirect after 2 seconds
            setTimeout(() => {
                router.push('/dashboard/deployment')
            }, 2000)

        } catch (err: any) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/deployment">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Truck className="h-6 w-6" />
                        ส่งตัวแรงงาน
                    </h1>
                    <p className="text-muted-foreground">มอบหมายแรงงานไปยังนายจ้าง</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Worker Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5" />
                            เลือกแรงงาน
                        </CardTitle>
                        <CardDescription>
                            เลือกแรงงานที่พร้อมส่งตัว ({workers.length} คน)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {workers.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>ไม่มีแรงงานพร้อมส่งตัว</p>
                            </div>
                        ) : (
                            <select
                                value={selectedWorkerId}
                                onChange={(e) => setSelectedWorkerId(e.target.value)}
                                required
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">-- เลือกแรงงาน --</option>
                                {workers.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.workerId} - {w.firstNameTH} {w.lastNameTH}
                                        {w.nickname && ` (${w.nickname})`}
                                    </option>
                                ))}
                            </select>
                        )}

                        {selectedWorker && (
                            <div className="mt-4 p-4 bg-muted rounded-lg">
                                <p className="font-medium">
                                    {selectedWorker.firstNameTH} {selectedWorker.lastNameTH}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {selectedWorker.workerId}
                                </p>
                                <Badge className="mt-2 bg-green-100 text-green-800">
                                    พร้อมส่งตัว
                                </Badge>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Client Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            เลือกนายจ้าง
                        </CardTitle>
                        <CardDescription>
                            เลือกลูกค้า/โรงงานที่จะรับแรงงาน
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <select
                            value={selectedClientId}
                            onChange={(e) => setSelectedClientId(e.target.value)}
                            required
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="">-- เลือกนายจ้าง --</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.clientId} - {c.companyNameTH || c.personName}
                                    {c.type === 'FACTORY' ? ' 🏭' : ' 👤'}
                                </option>
                            ))}
                        </select>

                        {selectedClient && (
                            <div className="mt-4 p-4 bg-muted rounded-lg">
                                <p className="font-medium">
                                    {selectedClient.companyNameTH || selectedClient.personName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {selectedClient.clientId}
                                </p>
                                <Badge className="mt-2">
                                    {selectedClient.type === 'FACTORY' ? '🏭 โรงงาน' : '👤 บุคคล'}
                                </Badge>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Deployment Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            รายละเอียดการส่งตัว
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                วันที่ส่งตัว <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="date"
                                value={deploymentDate}
                                onChange={(e) => setDeploymentDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                ตำแหน่ง
                            </Label>
                            <Input
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                placeholder="เช่น พนักงานผลิต, แม่บ้าน"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                เงินเดือน (บาท)
                            </Label>
                            <Input
                                type="number"
                                value={salary}
                                onChange={(e) => setSalary(e.target.value)}
                                placeholder="เช่น 15000"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label>หมายเหตุ</Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="บันทึกเพิ่มเติม..."
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex gap-4 justify-end">
                    <Link href="/dashboard/deployment">
                        <Button type="button" variant="outline">ยกเลิก</Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={submitting || !selectedWorkerId || !selectedClientId}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                กำลังบันทึก...
                            </>
                        ) : (
                            <>
                                <Truck className="mr-2 h-4 w-4" />
                                ยืนยันการส่งตัว
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
