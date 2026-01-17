'use client'

// =====================================================
// Academy Graduate Page
// Complete training for workers
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
    Award,
} from 'lucide-react'

interface Worker {
    id: string
    workerId: string
    firstNameTH: string
    lastNameTH: string
    nickname: string | null
    academyStartDate: string | null
}

export default function AcademyGraduatePage() {
    const router = useRouter()

    const [workers, setWorkers] = useState<Worker[]>([])
    const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([])
    const [graduationDate, setGraduationDate] = useState(new Date().toISOString().split('T')[0])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Fetch workers in training
    useEffect(() => {
        async function fetchWorkers() {
            try {
                const res = await fetch('/api/workers?status=TRAINING&limit=100')
                if (res.ok) {
                    const data = await res.json()
                    setWorkers(data.workers || data || [])
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
            const res = await fetch('/api/academy/graduate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workerIds: selectedWorkerIds,
                    graduationDate,
                }),
            })

            const result = await res.json()

            if (!res.ok) {
                throw new Error(result.error || 'เกิดข้อผิดพลาด')
            }

            setSuccess(`🎓 จบการฝึกอบรม ${selectedWorkerIds.length} คน เรียบร้อย!`)

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
                        <Award className="h-6 w-6" />
                        จบการฝึกอบรม
                    </h1>
                    <p className="text-muted-foreground">เลือกแรงงานที่ผ่านการฝึกและพร้อมส่งตัว</p>
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
                {/* Graduation Date */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            วันที่จบการฝึก
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="w-48">
                            <Input
                                type="date"
                                value={graduationDate}
                                onChange={(e) => setGraduationDate(e.target.value)}
                                required
                            />
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
                                    แรงงานที่กำลังฝึกอบรม
                                </CardTitle>
                                <CardDescription>
                                    เลือกแรงงานที่จบการฝึก ({selectedWorkerIds.length} / {workers.length})
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
                                <GraduationCap className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>ไม่มีแรงงานที่กำลังฝึกอบรม</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {workers.map((worker) => (
                                    <div
                                        key={worker.id}
                                        className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition ${selectedWorkerIds.includes(worker.id)
                                                ? 'bg-green-50 border-green-500'
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
                                                {worker.academyStartDate && (
                                                    <> • เริ่มฝึก: {new Date(worker.academyStartDate).toLocaleDateString('th-TH')}</>
                                                )}
                                            </p>
                                        </div>
                                        <Badge className="bg-amber-100 text-amber-800">
                                            กำลังฝึก
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
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                กำลังบันทึก...
                            </>
                        ) : (
                            <>
                                <Award className="mr-2 h-4 w-4" />
                                🎓 จบการฝึกอบรม ({selectedWorkerIds.length})
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
