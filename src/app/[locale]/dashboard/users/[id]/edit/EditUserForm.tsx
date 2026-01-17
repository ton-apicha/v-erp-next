'use client'

import { useState } from 'react'
import { useRouter, Link } from '@/i18n/routing'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Loader2, Save } from 'lucide-react'

interface EditUserFormProps {
    user: {
        id: string
        name: string
        email: string
        role: string
    }
    currentUserRole: string
}

export default function EditUserForm({ user, currentUserRole }: EditUserFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        password: '',
        confirmPassword: '',
        role: user.role as 'SUPER_ADMIN' | 'MANAGER' | 'STAFF',
    })

    const roleOptions = [
        { value: 'SUPER_ADMIN', label: 'Super Admin - ผู้ดูแลระบบ', disabled: currentUserRole !== 'SUPER_ADMIN' },
        { value: 'MANAGER', label: 'Manager - ผู้จัดการ' },
        { value: 'STAFF', label: 'Staff - พนักงาน' },
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validation
        if (!formData.name || formData.name.length < 3) {
            setError('ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร')
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            setError('รูปแบบอีเมลไม่ถูกต้อง')
            return
        }

        // Validate password if provided
        if (formData.password) {
            if (formData.password.length < 8) {
                setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
                return
            }

            if (formData.password !== formData.confirmPassword) {
                setError('รหัสผ่านไม่ตรงกัน')
                return
            }
        }

        setLoading(true)

        try {
            const updateData: any = {
                name: formData.name,
                email: formData.email,
                roleName: formData.role,
            }

            // Only include password if it was changed
            if (formData.password) {
                updateData.password = formData.password
            }

            const res = await fetch(`/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'เกิดข้อผิดพลาด')
            }

            router.push('/dashboard/users')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาดในการแก้ไขผู้ใช้')
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/users">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        แก้ไขผู้ใช้งาน
                    </h1>
                    <p className="text-muted-foreground">
                        แก้ไขข้อมูลผู้ใช้: {user.name}
                    </p>
                </div>
            </div>

            {/* Form */}
            <Card>
                <CardHeader>
                    <CardTitle>ข้อมูลผู้ใช้</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                ชื่อผู้ใช้ <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="ระบุชื่อ-นามสกุล"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">
                                อีเมล <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="user@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Password (Optional) */}
                        <div className="space-y-2">
                            <Label htmlFor="password">
                                รหัสผ่านใหม่ (ไม่บังคับ)
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="เว้นว่างไว้หากไม่ต้องการเปลี่ยน"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                disabled={loading}
                            />
                        </div>

                        {/* Confirm Password */}
                        {formData.password && (
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">
                                    ยืนยันรหัสผ่านใหม่ <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        )}

                        {/* Role */}
                        <div className="space-y-2">
                            <Label htmlFor="role">
                                บทบาท <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกบทบาท" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roleOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                            disabled={option.disabled}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {currentUserRole !== 'SUPER_ADMIN' && (
                                <p className="text-xs text-muted-foreground">
                                    เฉพาะ Super Admin เท่านั้นที่สามารถกำหนดบทบาท Super Admin ได้
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        บันทึกการเปลี่ยนแปลง
                                    </>
                                )}
                            </Button>
                            <Link href="/dashboard/users">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={loading}
                                >
                                    ยกเลิก
                                </Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Info */}
            <Card>
                <CardContent className="py-4">
                    <div className="text-sm text-muted-foreground">
                        <p className="font-medium mb-2">คำแนะนำ:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>หากไม่ต้องการเปลี่ยนรหัสผ่าน ให้เว้นว่างไว้</li>
                            <li>รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร</li>
                            <li>การเปลี่ยนอีเมลจะส่งผลต่อการเข้าสู่ระบบ</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
