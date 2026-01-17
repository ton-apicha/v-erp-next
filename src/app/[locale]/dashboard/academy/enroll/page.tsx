'use client'

// =====================================================
// Academy Enroll Page
// Add workers to training
// =====================================================

import { useState, useEffect } from 'react'
import { useRouter, Link } from '@/i18n/routing'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
    GraduationCap,
    ArrowLeft,
    Loader2,
    AlertCircle,
    CheckCircle,
    Calendar,
    Users,
} from 'lucide-react'

interface Worker {
    id: string
    workerId: string
    firstNameTH: string
    lastNameTH: string
    nickname: string | null
    status: string
}

export default function AcademyEnrollPage() {
    const router = useRouter()

    const [workers, setWorkers] = useState<Worker[]>([])
    const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([])
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
    const [duration, setDuration] = useState('14')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Fetch workers not in training
    useEffect(() => {
        async function fetchWorkers() {
            try {
                const res = await fetch('/api/workers?limit=100')
                if (res.ok) {
                    const data = await res.json()
                    const availableWorkers = (data.workers || data || []).filter(
                        (w: Worker) => ['NEW', 'DOCUMENTING'].includes(w.status)
                    )
                    setWorkers(availableWorkers)
                }
            } catch (err) {
                console.error('Error:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchWorkers()
    }, [])

    const toggleWorker = (workerId: string) => {
        setSelectedWorkerIds((prev) =>
            prev.includes(workerId)
                ? prev.filter((id) => id !== workerId)
                : [...prev, workerId]
        )
    }

    const selectAll = () => {
        if (selectedWorkerIds.length === workers.length) {
            setSelectedWorkerIds([])
        } else {
            setSelectedWorkerIds(workers.map((w) => w.id))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedWorkerIds.length === 0) {
            setError('กรุณาเลือกแรงงานอย่างน้อย 1 คน')
            return
        }

        setSubmitting(true)
        setError('')

        try {
            const endDate = new Date(startDate)
            endDate.setDate(endDate.getDate() + parseInt(duration))

            const res = await fetch('/api/academy/enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workerIds: selectedWorkerIds,
                    startDate,
                    endDate: endDate.toISOString().split('T')[0],
                }),
            })

            const result = await res.json()

            if (!res.ok) {
                throw new Error(result.error || 'เกิดข้อผิดพลาด')
            }

            setSuccess(`รับแรงงานเข้าฝึกอบรม ${selectedWorkerIds.length} คน เรียบร้อย`)

            setTimeout(() => {
                router.push('/dashboard/academy')
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
                <Link href="/dashboard/academy">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <GraduationCap className="h-6 w-6" />
                        รับแรงงานเข้าฝึกอบรม
                    </h1>
                    <p className="text-muted-foreground">เลือกแรงงานและกำหนดระยะเวลาการฝึก</p>
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
                {/* Training Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            กำหนดการฝึกอบรม
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>วันที่เริ่มฝึก</Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>ระยะเวลา (วัน)</Label>
                            <select
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="7">7 วัน</option>
                                <option value="14">14 วัน</option>
                                <option value="21">21 วัน</option>
                                <option value="30">30 วัน</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Worker Selection */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    เลือกแรงงาน
                                </CardTitle>
                                <CardDescription>
                                    เลือกแรงงานที่จะเข้าฝึกอบรม ({selectedWorkerIds.length} / {workers.length})
                                </CardDescription>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={selectAll}>
                                {selectedWorkerIds.length === workers.length ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {workers.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>ไม่มีแรงงานที่พร้อมเข้าฝึกอบรม</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {workers.map((worker) => (
                                    <div
                                        key={worker.id}
                                        className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition ${selectedWorkerIds.includes(worker.id)
                                                ? 'bg-primary/5 border-primary'
                                                : ''
                                            }`}
                                        onClick={() => toggleWorker(worker.id)}
                                    >
                                        <Checkbox
                                            checked={selectedWorkerIds.includes(worker.id)}
                                            onCheckedChange={() => toggleWorker(worker.id)}
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">
                                                {worker.firstNameTH} {worker.lastNameTH}
                                                {worker.nickname && ` (${worker.nickname})`}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {worker.workerId}
                                            </p>
                                        </div>
                                        <Badge className="bg-blue-100 text-blue-800">
                                            {worker.status === 'NEW' ? 'ใหม่' : 'เอกสาร'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex gap-4 justify-end">
                    <Link href="/dashboard/academy">
                        <Button type="button" variant="outline">ยกเลิก</Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={submitting || selectedWorkerIds.length === 0}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                กำลังบันทึก...
                            </>
                        ) : (
                            <>
                                <GraduationCap className="mr-2 h-4 w-4" />
                                รับเข้าฝึกอบรม ({selectedWorkerIds.length})
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
