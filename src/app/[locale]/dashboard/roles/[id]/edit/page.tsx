'use client'

// =====================================================
// Edit Role Form
// Update role with permission matrix
// =====================================================

import { useState, useEffect } from 'react'
import { useRouter, Link } from '@/i18n/routing'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Shield,
    ArrowLeft,
    Save,
    Loader2,
    AlertCircle,
    Check,
    Trash2,
    AlertTriangle,
} from 'lucide-react'

// Company options
const companyOptions = [
    { value: 'V_CONNECT', label: 'V-Connect', color: 'bg-blue-500' },
    { value: 'V_WORK', label: 'V-Work', color: 'bg-green-500' },
    { value: 'V_CARE', label: 'V-Care', color: 'bg-purple-500' },
    { value: 'V_HOLDING', label: 'V-Holding', color: 'bg-orange-500' },
]

interface Permission {
    id: string
    module: string
    action: string
    description: string | null
}

interface GroupedPermissions {
    [module: string]: Permission[]
}

interface Role {
    id: string
    name: string
    displayName: string
    displayNameLA: string | null
    companyAccess: string[]
    isSystem: boolean
    permissions: { permission: Permission }[]
    _count: { users: number }
}

export default function EditRolePage() {
    const router = useRouter()
    const params = useParams()
    const roleId = params?.id as string

    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState('')
    const [role, setRole] = useState<Role | null>(null)
    const [permissions, setPermissions] = useState<GroupedPermissions>({})
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
    const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
    const [loadingData, setLoadingData] = useState(true)

    // Fetch role and permissions
    useEffect(() => {
        async function fetchData() {
            try {
                const [roleRes, permsRes] = await Promise.all([
                    fetch(`/api/roles/${roleId}`),
                    fetch('/api/permissions'),
                ])

                if (roleRes.ok) {
                    const roleData = await roleRes.json()
                    setRole(roleData)
                    setSelectedCompanies(roleData.companyAccess || [])
                    setSelectedPermissions(roleData.permissions.map((p: any) => p.permission.id))
                }

                if (permsRes.ok) {
                    const permsData = await permsRes.json()
                    setPermissions(permsData)
                }
            } catch (err) {
                console.error('Error fetching data:', err)
                setError('ไม่สามารถโหลดข้อมูลได้')
            } finally {
                setLoadingData(false)
            }
        }
        if (roleId) fetchData()
    }, [roleId])

    const togglePermission = (permId: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permId)
                ? prev.filter(id => id !== permId)
                : [...prev, permId]
        )
    }

    const toggleCompany = (company: string) => {
        setSelectedCompanies(prev =>
            prev.includes(company)
                ? prev.filter(c => c !== company)
                : [...prev, company]
        )
    }

    const toggleModuleAll = (module: string, checked: boolean) => {
        const modulePerms = permissions[module] || []
        const modulePermIds = modulePerms.map(p => p.id)

        if (checked) {
            setSelectedPermissions(prev => [...new Set([...prev, ...modulePermIds])])
        } else {
            setSelectedPermissions(prev => prev.filter(id => !modulePermIds.includes(id)))
        }
    }

    const isModuleAllSelected = (module: string): boolean => {
        const modulePerms = permissions[module] || []
        return modulePerms.length > 0 && modulePerms.every(p => selectedPermissions.includes(p.id))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name'),
            displayName: formData.get('displayName'),
            displayNameLA: formData.get('displayNameLA') || null,
            companyAccess: selectedCompanies,
            permissionIds: selectedPermissions,
        }

        try {
            const res = await fetch(`/api/roles/${roleId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'เกิดข้อผิดพลาด')
            }

            router.push('/dashboard/roles')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('คุณแน่ใจหรือไม่ที่จะลบบทบาทนี้?')) return

        setDeleting(true)
        setError('')

        try {
            const res = await fetch(`/api/roles/${roleId}`, {
                method: 'DELETE',
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'เกิดข้อผิดพลาด')
            }

            router.push('/dashboard/roles')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setDeleting(false)
        }
    }

    if (loadingData) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!role) {
        return (
            <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 mx-auto text-orange-500 mb-4" />
                <h1 className="text-xl font-bold">ไม่พบบทบาท</h1>
                <Link href="/dashboard/roles">
                    <Button className="mt-4">กลับไปหน้ารายการ</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/roles">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Shield className="h-6 w-6" />
                            แก้ไขบทบาท: {role.displayName}
                        </h1>
                        <p className="text-muted-foreground">
                            {role.isSystem && <Badge variant="outline" className="mr-2">ระบบ</Badge>}
                            ใช้โดย {role._count.users} ผู้ใช้
                        </p>
                    </div>
                </div>
                {!role.isSystem && role._count.users === 0 && (
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleting}
                    >
                        {deleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                ลบ
                            </>
                        )}
                    </Button>
                )}
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
                    <CardContent className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">ชื่อ Role (ภาษาอังกฤษ) <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                name="name"
                                required
                                defaultValue={role.name}
                                disabled={role.isSystem}
                                pattern="^[A-Z][A-Z0-9_]*$"
                                title="ต้องเป็นตัวพิมพ์ใหญ่ และ underscore เช่น MY_ROLE"
                            />
                            {role.isSystem && (
                                <p className="text-xs text-muted-foreground">ไม่สามารถเปลี่ยนชื่อ Role ระบบได้</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="displayName">ชื่อแสดง (ไทย) <span className="text-red-500">*</span></Label>
                            <Input id="displayName" name="displayName" required defaultValue={role.displayName} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="displayNameLA">ชื่อแสดง (ลาว)</Label>
                            <Input id="displayNameLA" name="displayNameLA" defaultValue={role.displayNameLA || ''} />
                        </div>
                    </CardContent>
                </Card>

                {/* Company Access */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">สิทธิ์เข้าถึงบริษัท</CardTitle>
                        <CardDescription>เลือกบริษัทที่บทบาทนี้สามารถเข้าถึงได้</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            {companyOptions.map((company) => (
                                <button
                                    key={company.value}
                                    type="button"
                                    onClick={() => toggleCompany(company.value)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition ${selectedCompanies.includes(company.value)
                                            ? 'border-primary bg-primary/10'
                                            : 'border-muted hover:border-primary/50'
                                        }`}
                                >
                                    <div className={`h-3 w-3 rounded-full ${company.color}`} />
                                    <span>{company.label}</span>
                                    {selectedCompanies.includes(company.value) && (
                                        <Check className="h-4 w-4 text-primary" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Permissions Matrix */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">สิทธิ์การใช้งาน</CardTitle>
                        <CardDescription>
                            เลือก {selectedPermissions.length} สิทธิ์
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(permissions).map(([module, perms]) => (
                                <div key={module} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id={`module-${module}`}
                                                checked={isModuleAllSelected(module)}
                                                onCheckedChange={(checked) => toggleModuleAll(module, checked as boolean)}
                                            />
                                            <label htmlFor={`module-${module}`} className="font-medium capitalize cursor-pointer">
                                                {module}
                                            </label>
                                            <Badge variant="secondary" className="text-xs">
                                                {perms.filter(p => selectedPermissions.includes(p.id)).length}/{perms.length}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 pl-6">
                                        {perms.map((perm) => (
                                            <div key={perm.id} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={perm.id}
                                                    checked={selectedPermissions.includes(perm.id)}
                                                    onCheckedChange={() => togglePermission(perm.id)}
                                                />
                                                <label
                                                    htmlFor={perm.id}
                                                    className="text-sm cursor-pointer hover:text-primary"
                                                >
                                                    {perm.action}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex gap-4 justify-end">
                    <Link href="/dashboard/roles">
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
                                บันทึกการเปลี่ยนแปลง
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
