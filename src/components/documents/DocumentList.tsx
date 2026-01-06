'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    FileText,
    Download,
    Trash2,
    MoreVertical,
    Clock,
    AlertTriangle,
    Eye,
    History,
    RotateCcw,
} from 'lucide-react'
import { getDocumentUrl, deleteDocument } from '@/actions/documents'
import type { Document } from '@prisma/client'

interface DocumentListProps {
    documents: Document[]
    showVersionHistory?: boolean
}

const categoryLabels: Record<string, string> = {
    PASSPORT: 'Passport',
    VISA: 'Visa',
    WORK_PERMIT: 'Work Permit',
    MEDICAL_CERT: 'ใบรับรองแพทย์',
    CRIMINAL_CHECK: 'ตรวจประวัติ',
    CONTRACT: 'สัญญาจ้าง',
    ID_CARD: 'บัตรประชาชน',
    PHOTO: 'รูปถ่าย',
    OTHER: 'อื่นๆ',
}

const categoryColors: Record<string, string> = {
    PASSPORT: 'bg-blue-100 text-blue-800',
    VISA: 'bg-green-100 text-green-800',
    WORK_PERMIT: 'bg-purple-100 text-purple-800',
    MEDICAL_CERT: 'bg-yellow-100 text-yellow-800',
    CRIMINAL_CHECK: 'bg-red-100 text-red-800',
    CONTRACT: 'bg-indigo-100 text-indigo-800',
    ID_CARD: 'bg-gray-100 text-gray-800',
    PHOTO: 'bg-pink-100 text-pink-800',
    OTHER: 'bg-slate-100 text-slate-800',
}

export default function DocumentList({ documents, showVersionHistory = true }: DocumentListProps) {
    const [isLoading, setIsLoading] = useState<string | null>(null)
    const [versions, setVersions] = useState<Document[]>([])
    const [versionDialogOpen, setVersionDialogOpen] = useState(false)
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)

    const handleView = async (doc: Document) => {
        setIsLoading(doc.id)
        try {
            const url = await getDocumentUrl(doc.id)
            window.open(url, '_blank')
        } catch (error) {
            console.error('Failed to get document URL:', error)
            alert('ไม่สามารถเปิดเอกสารได้')
        } finally {
            setIsLoading(null)
        }
    }

    const handleDownload = async (doc: Document) => {
        setIsLoading(doc.id)
        try {
            const url = await getDocumentUrl(doc.id)
            const link = document.createElement('a')
            link.href = url
            link.download = doc.title
            link.click()
        } catch (error) {
            console.error('Failed to download:', error)
            alert('ไม่สามารถดาวน์โหลดได้')
        } finally {
            setIsLoading(null)
        }
    }

    const handleDelete = async (doc: Document) => {
        if (!confirm(`ต้องการลบ "${doc.title}" ใช่หรือไม่?`)) return

        setIsLoading(doc.id)
        try {
            await deleteDocument(doc.id)
            window.location.reload()
        } catch (error) {
            console.error('Failed to delete:', error)
            alert('ไม่สามารถลบได้')
        } finally {
            setIsLoading(null)
        }
    }




    const isExpiringSoon = (expiryDate: Date | null) => {
        if (!expiryDate) return false
        const daysUntilExpiry = Math.floor(
            (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0
    }

    const isExpired = (expiryDate: Date | null) => {
        if (!expiryDate) return false
        return new Date(expiryDate) < new Date()
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    if (documents.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>ยังไม่มีเอกสาร</p>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-2">
                {documents.map((doc) => (
                    <div
                        key={doc.id}
                        className={cn(
                            'flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors',
                            isExpired(doc.expiryDate) && 'border-red-300 bg-red-50',
                            isExpiringSoon(doc.expiryDate) && 'border-yellow-300 bg-yellow-50'
                        )}
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="h-5 w-5 text-muted-foreground shrink-0" />

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm truncate">{doc.title}</p>
                                </div>

                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <Badge className={cn('text-xs', doc.category ? categoryColors[doc.category] : '')} >
                                        {doc.category ? (categoryLabels[doc.category] || doc.category) : 'ไม่ระบุ'}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {formatFileSize(doc.fileSize || 0)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {format(new Date(doc.createdAt), 'dd/MM/yyyy', { locale: th })}
                                    </span>
                                </div>

                                {doc.expiryDate && (
                                    <div className="flex items-center gap-1 mt-1">
                                        {isExpired(doc.expiryDate) ? (
                                            <>
                                                <AlertTriangle className="h-3 w-3 text-red-500" />
                                                <span className="text-xs text-red-600 font-medium">
                                                    หมดอายุแล้ว
                                                </span>
                                            </>
                                        ) : isExpiringSoon(doc.expiryDate) ? (
                                            <>
                                                <Clock className="h-3 w-3 text-yellow-500" />
                                                <span className="text-xs text-yellow-600 font-medium">
                                                    หมดอายุ {format(new Date(doc.expiryDate), 'dd/MM/yyyy')}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                หมด: {format(new Date(doc.expiryDate), 'dd/MM/yyyy')}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={isLoading === doc.id}
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleView(doc)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    ดู
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownload(doc)}>
                                    <Download className="h-4 w-4 mr-2" />
                                    ดาวน์โหลด
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => handleDelete(doc)}
                                    className="text-destructive"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    ลบ
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ))}
            </div>


        </>
    )
}
