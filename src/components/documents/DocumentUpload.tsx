'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Upload, FileText, X, Loader2 } from 'lucide-react'
import { uploadDocument } from '@/actions/documents'

interface DocumentUploadProps {
    workerId?: string
    agentId?: string
    clientId?: string
    onSuccess?: () => void
}

const categories = [
    { value: 'PASSPORT', label: 'Passport' },
    { value: 'VISA', label: 'Visa' },
    { value: 'WORK_PERMIT', label: 'Work Permit' },
    { value: 'MEDICAL_CERT', label: 'ใบรับรองแพทย์' },
    { value: 'CRIMINAL_CHECK', label: 'ใบตรวจประวัติอาชญากรรม' },
    { value: 'CONTRACT', label: 'สัญญาจ้าง' },
    { value: 'ID_CARD', label: 'บัตรประชาชน' },
    { value: 'PHOTO', label: 'รูปถ่าย' },
    { value: 'OTHER', label: 'อื่นๆ' },
]

export default function DocumentUpload({
    workerId,
    agentId,
    clientId,
    onSuccess,
}: DocumentUploadProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [category, setCategory] = useState('')
    const [expiryDate, setExpiryDate] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0])
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleSubmit = async () => {
        if (!file || !category) return

        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('category', category)
            if (workerId) formData.append('workerId', workerId)
            if (agentId) formData.append('agentId', agentId)
            if (clientId) formData.append('clientId', clientId)
            if (expiryDate) formData.append('expiryDate', expiryDate)

            await uploadDocument(formData)

            setOpen(false)
            setFile(null)
            setCategory('')
            setExpiryDate('')
            router.refresh()
            onSuccess?.()
        } catch (error) {
            console.error('Upload failed:', error)
            alert('อัพโหลดไม่สำเร็จ กรุณาลองใหม่')
        } finally {
            setIsUploading(false)
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    อัพโหลดเอกสาร
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>อัพโหลดเอกสาร</DialogTitle>
                    <DialogDescription>
                        เลือกไฟล์และประเภทเอกสารที่ต้องการอัพโหลด
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Drop Zone */}
                    <div
                        className={cn(
                            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                            dragActive
                                ? 'border-primary bg-primary/5'
                                : 'border-muted-foreground/25 hover:border-primary/50',
                            file && 'border-green-500 bg-green-50'
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />

                        {file ? (
                            <div className="flex items-center justify-center gap-3">
                                <FileText className="h-8 w-8 text-green-600" />
                                <div className="text-left">
                                    <p className="font-medium text-sm truncate max-w-[200px]">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="ml-2"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setFile(null)
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div>
                                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือก
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    รองรับ PDF, JPG, PNG, DOC (สูงสุด 10MB)
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">ประเภทเอกสาร *</label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="เลือกประเภท" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Expiry Date (optional) */}
                    {['PASSPORT', 'VISA', 'WORK_PERMIT', 'MEDICAL_CERT'].includes(category) && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">วันหมดอายุ</label>
                            <Input
                                type="date"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!file || !category || isUploading}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                กำลังอัพโหลด...
                            </>
                        ) : (
                            'อัพโหลด'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
