'use client'

// =====================================================
// Contract Template Generate/Preview Page
// Generate contract from template with worker selection
// =====================================================

import { useState, useEffect } from 'react'
import { useRouter, Link } from '@/i18n/routing'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    FileSignature,
    ArrowLeft,
    Loader2,
    AlertCircle,
    Printer,
    User,
    Building2,
    Eye,
    RefreshCcw,
} from 'lucide-react'

interface Template {
    id: string
    name: string
    nameLA: string | null
    category: string
    variables: string[]
}

interface Worker {
    id: string
    workerId: string
    firstNameTH: string
    lastNameTH: string
    nickname: string | null
}

interface Client {
    id: string
    companyNameTH: string | null
}

interface GeneratedContract {
    generatedContentTH: string
    generatedContentLA: string
    unfilledVariables: string[]
}

export default function ContractGeneratePage() {
    const router = useRouter()
    const params = useParams()
    const templateId = params?.id as string

    const [template, setTemplate] = useState<Template | null>(null)
    const [workers, setWorkers] = useState<Worker[]>([])
    const [clients, setClients] = useState<Client[]>([])
    const [selectedWorkerId, setSelectedWorkerId] = useState('')
    const [selectedClientId, setSelectedClientId] = useState('')
    const [generated, setGenerated] = useState<GeneratedContract | null>(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [error, setError] = useState('')
    const [showLA, setShowLA] = useState(false)

    // Fetch template, workers, clients
    useEffect(() => {
        async function fetchData() {
            try {
                const [templateRes, workersRes, clientsRes] = await Promise.all([
                    fetch(`/api/contract-templates/${templateId}`),
                    fetch('/api/workers?limit=100'),
                    fetch('/api/clients?limit=100'),
                ])

                if (templateRes.ok) {
                    setTemplate(await templateRes.json())
                }
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
                setError('ไม่สามารถโหลดข้อมูลได้')
            } finally {
                setLoading(false)
            }
        }
        if (templateId) fetchData()
    }, [templateId])

    const handleGenerate = async () => {
        if (!selectedWorkerId) {
            setError('กรุณาเลือกแรงงาน')
            return
        }

        setGenerating(true)
        setError('')

        try {
            const res = await fetch(`/api/contract-templates/${templateId}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workerId: selectedWorkerId,
                    clientId: selectedClientId,
                }),
            })

            if (!res.ok) {
                throw new Error('Failed to generate')
            }

            const data = await res.json()
            setGenerated(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setGenerating(false)
        }
    }

    const handlePrint = () => {
        const content = showLA ? generated?.generatedContentLA : generated?.generatedContentTH
        const printWindow = window.open('', '_blank')
        if (printWindow && content) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${template?.name}</title>
                    <style>
                        body { font-family: 'TH Sarabun New', sans-serif; font-size: 16pt; line-height: 1.6; padding: 40px; }
                        @media print { body { padding: 0; } }
                    </style>
                </head>
                <body>
                    <div style="white-space: pre-wrap;">${content}</div>
                </body>
                </html>
            `)
            printWindow.document.close()
            printWindow.print()
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!template) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto text-orange-500 mb-4" />
                <h1 className="text-xl font-bold">ไม่พบ Template</h1>
                <Link href="/dashboard/contract-templates">
                    <Button className="mt-4">กลับไปหน้ารายการ</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/contract-templates">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileSignature className="h-6 w-6" />
                        สร้างสัญญา: {template.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge>{template.category}</Badge>
                        <span className="text-muted-foreground text-sm">
                            ใช้ตัวแปร {template.variables?.length || 0} รายการ
                        </span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            {/* Selection Form */}
            {!generated && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">เลือกข้อมูล</CardTitle>
                        <CardDescription>เลือกแรงงานและลูกค้าเพื่อสร้างสัญญา</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Worker Selection */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                เลือกแรงงาน <span className="text-red-500">*</span>
                            </Label>
                            <select
                                value={selectedWorkerId}
                                onChange={(e) => setSelectedWorkerId(e.target.value)}
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
                        </div>

                        {/* Client Selection */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                เลือกลูกค้า/โรงงาน (ถ้ามี)
                            </Label>
                            <select
                                value={selectedClientId}
                                onChange={(e) => setSelectedClientId(e.target.value)}
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">-- ไม่เลือก (ใช้จาก Worker) --</option>
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.companyNameTH}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Generate Button */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                onClick={handleGenerate}
                                disabled={generating || !selectedWorkerId}
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        กำลังสร้าง...
                                    </>
                                ) : (
                                    <>
                                        <Eye className="mr-2 h-4 w-4" />
                                        ดูตัวอย่างสัญญา
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Generated Preview */}
            {generated && (
                <>
                    {/* Controls */}
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant={!showLA ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setShowLA(false)}
                                >
                                    ภาษาไทย
                                </Button>
                                <Button
                                    variant={showLA ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setShowLA(true)}
                                >
                                    ภาษาลาว
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setGenerated(null)
                                        setSelectedWorkerId('')
                                        setSelectedClientId('')
                                    }}
                                >
                                    <RefreshCcw className="h-4 w-4 mr-2" />
                                    สร้างใหม่
                                </Button>
                                <Button onClick={handlePrint}>
                                    <Printer className="h-4 w-4 mr-2" />
                                    พิมพ์
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Unfilled Variables Warning */}
                    {generated.unfilledVariables.length > 0 && (
                        <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded">
                            <p className="font-medium mb-1">⚠️ มีตัวแปรที่ยังไม่ถูกแทนที่:</p>
                            <div className="flex flex-wrap gap-2">
                                {generated.unfilledVariables.map((v, i) => (
                                    <Badge key={i} variant="outline" className="font-mono">
                                        {v}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Contract Content */}
                    <Card>
                        <CardHeader>
                            <CardTitle>ตัวอย่างสัญญา</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="prose max-w-none whitespace-pre-wrap p-6 border rounded-lg bg-white"
                                style={{ fontFamily: "'TH Sarabun New', serif", fontSize: '14pt' }}
                            >
                                {showLA
                                    ? generated.generatedContentLA || 'ไม่มีเนื้อหาภาษาลาว'
                                    : generated.generatedContentTH || 'ไม่มีเนื้อหาภาษาไทย'
                                }
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
