// =====================================================
// Contract Templates Page
// List and manage contract templates
// =====================================================

import { prisma } from '@/lib/db'
import { Link } from '@/i18n/routing'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    FileText,
    Plus,
    FileSignature,
    Briefcase,
    Handshake,
    Settings,
    CheckCircle,
    XCircle,
    Play,
} from 'lucide-react'

// Category config
const categoryConfig: Record<string, { label: string; icon: any; color: string }> = {
    employment: { label: 'สัญญาจ้าง', icon: Briefcase, color: 'bg-blue-100 text-blue-800' },
    service: { label: 'สัญญาบริการ', icon: FileSignature, color: 'bg-green-100 text-green-800' },
    mou: { label: 'บันทึกข้อตกลง', icon: Handshake, color: 'bg-purple-100 text-purple-800' },
}

export default async function ContractTemplatesPage(props: {
    searchParams: Promise<{
        category?: string
    }>
}) {
    const searchParams = await props.searchParams

    // Build where clause
    const where: any = {}
    if (searchParams.category) {
        where.category = searchParams.category
    }

    // Fetch templates
    const templates = await prisma.contractTemplate.findMany({
        where,
        orderBy: [
            { category: 'asc' },
            { name: 'asc' },
        ],
    })

    // Group by category
    const groupedTemplates = templates.reduce((acc: Record<string, typeof templates>, template) => {
        if (!acc[template.category]) {
            acc[template.category] = []
        }
        acc[template.category].push(template)
        return acc
    }, {})

    // Stats
    const stats = {
        total: await prisma.contractTemplate.count(),
        active: await prisma.contractTemplate.count({ where: { isActive: true } }),
        employment: await prisma.contractTemplate.count({ where: { category: 'employment' } }),
        service: await prisma.contractTemplate.count({ where: { category: 'service' } }),
        mou: await prisma.contractTemplate.count({ where: { category: 'mou' } }),
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <FileText className="h-8 w-8" />
                        แม่แบบสัญญา
                    </h1>
                    <p className="text-muted-foreground">จัดการ Template สัญญาสำหรับใช้กับแรงงานและลูกค้า</p>
                </div>
                <Link href="/dashboard/contract-templates/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        เพิ่ม Template
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <FileText className="h-6 w-6 mx-auto text-primary mb-2" />
                        <p className="text-2xl font-bold">{stats.total}</p>
                        <p className="text-xs text-muted-foreground">ทั้งหมด</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <CheckCircle className="h-6 w-6 mx-auto text-green-500 mb-2" />
                        <p className="text-2xl font-bold text-green-700">{stats.active}</p>
                        <p className="text-xs text-muted-foreground">ใช้งาน</p>
                    </CardContent>
                </Card>
                <Link href="?category=employment">
                    <Card className={`cursor-pointer hover:shadow-md transition ${searchParams.category === 'employment' ? 'ring-2 ring-blue-500' : ''}`}>
                        <CardContent className="p-4 text-center">
                            <Briefcase className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                            <p className="text-2xl font-bold text-blue-700">{stats.employment}</p>
                            <p className="text-xs text-muted-foreground">สัญญาจ้าง</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="?category=service">
                    <Card className={`cursor-pointer hover:shadow-md transition ${searchParams.category === 'service' ? 'ring-2 ring-green-500' : ''}`}>
                        <CardContent className="p-4 text-center">
                            <FileSignature className="h-6 w-6 mx-auto text-green-500 mb-2" />
                            <p className="text-2xl font-bold text-green-700">{stats.service}</p>
                            <p className="text-xs text-muted-foreground">สัญญาบริการ</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="?category=mou">
                    <Card className={`cursor-pointer hover:shadow-md transition ${searchParams.category === 'mou' ? 'ring-2 ring-purple-500' : ''}`}>
                        <CardContent className="p-4 text-center">
                            <Handshake className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                            <p className="text-2xl font-bold text-purple-700">{stats.mou}</p>
                            <p className="text-xs text-muted-foreground">MOU</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Filter Reset */}
            {searchParams.category && (
                <div className="flex items-center gap-2">
                    <Badge className={categoryConfig[searchParams.category]?.color || 'bg-gray-100'}>
                        {categoryConfig[searchParams.category]?.label || searchParams.category}
                    </Badge>
                    <Link href="/dashboard/contract-templates">
                        <Button variant="ghost" size="sm">ล้างตัวกรอง</Button>
                    </Link>
                </div>
            )}

            {/* Templates List */}
            {templates.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>ไม่พบ Template</p>
                        <Link href="/dashboard/contract-templates/new">
                            <Button className="mt-4">
                                <Plus className="h-4 w-4 mr-2" />
                                สร้าง Template แรก
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => {
                        const config = categoryConfig[category] || { label: category, color: 'bg-gray-100' }
                        const Icon = config.icon || FileText

                        return (
                            <div key={category}>
                                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <Icon className="h-5 w-5" />
                                    {config.label}
                                    <Badge variant="secondary">{categoryTemplates.length}</Badge>
                                </h2>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {categoryTemplates.map((template) => (
                                        <Card key={template.id} className="hover:shadow-md transition">
                                            <CardHeader className="pb-2">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <CardTitle className="text-base flex items-center gap-2">
                                                            {template.name}
                                                            {template.isActive ? (
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <XCircle className="h-4 w-4 text-red-500" />
                                                            )}
                                                        </CardTitle>
                                                        {template.nameLA && (
                                                            <CardDescription>{template.nameLA}</CardDescription>
                                                        )}
                                                    </div>
                                                    <Link href={`/dashboard/contract-templates/${template.id}/edit`}>
                                                        <Button variant="ghost" size="icon">
                                                            <Settings className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {/* Variables */}
                                                {template.variables.length > 0 && (
                                                    <div>
                                                        <p className="text-xs text-muted-foreground mb-1">ตัวแปร:</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {template.variables.slice(0, 4).map((v) => (
                                                                <Badge key={v} variant="outline" className="text-xs font-mono">
                                                                    {`{{${v}}}`}
                                                                </Badge>
                                                            ))}
                                                            {template.variables.length > 4 && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    +{template.variables.length - 4}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Content languages */}
                                                <div className="flex gap-2">
                                                    {template.contentTH && (
                                                        <Badge variant="secondary" className="text-xs">TH</Badge>
                                                    )}
                                                    {template.contentLA && (
                                                        <Badge variant="secondary" className="text-xs">LA</Badge>
                                                    )}
                                                    {!template.contentTH && !template.contentLA && (
                                                        <span className="text-xs text-muted-foreground">ยังไม่มีเนื้อหา</span>
                                                    )}
                                                </div>

                                                {/* Updated date */}
                                                <p className="text-xs text-muted-foreground">
                                                    อัปเดต: {format(new Date(template.updatedAt), 'dd MMM yy', { locale: th })}
                                                </p>

                                                {/* Generate Button */}
                                                {template.isActive && (template.contentTH || template.contentLA) && (
                                                    <Link href={`/dashboard/contract-templates/${template.id}/generate`}>
                                                        <Button size="sm" className="w-full mt-2">
                                                            <Play className="h-4 w-4 mr-2" />
                                                            สร้างสัญญา
                                                        </Button>
                                                    </Link>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
