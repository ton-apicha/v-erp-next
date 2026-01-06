'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Settings,
    Database,
    Trash2,
    RefreshCw,
    AlertTriangle,
    Shield,
    User,
    Building2,
    Bell,
    Palette,
} from 'lucide-react'
import { resetDatabaseData } from '@/actions/settings'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
    const t = useTranslations('Common')
    const router = useRouter()

    const [isResetting, setIsResetting] = useState(false)
    const [confirmText, setConfirmText] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [finalConfirmOpen, setFinalConfirmOpen] = useState(false)
    const [resetResult, setResetResult] = useState<{ success: boolean; message: string } | null>(null)

    const CONFIRM_PHRASE = 'DELETE ALL DATA'

    const handleResetDatabase = async () => {
        if (confirmText !== CONFIRM_PHRASE) {
            alert('กรุณาพิมพ์ข้อความยืนยันให้ถูกต้อง')
            return
        }

        setIsResetting(true)
        try {
            const result = await resetDatabaseData()
            setResetResult(result)
            setDialogOpen(false)
            setFinalConfirmOpen(false)
            setConfirmText('')
            router.refresh()
        } catch (error) {
            setResetResult({
                success: false,
                message: (error as Error).message
            })
        } finally {
            setIsResetting(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Settings className="h-6 w-6" />
                    ตั้งค่าระบบ
                </h1>
                <p className="text-muted-foreground">
                    จัดการการตั้งค่าและการกำหนดค่าระบบ
                </p>
            </div>

            {/* Result Alert */}
            {resetResult && (
                <Card className={resetResult.success ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-red-500 bg-red-50 dark:bg-red-950'}>
                    <CardContent className="py-4">
                        <p className={resetResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                            {resetResult.success ? '✅' : '❌'} {resetResult.message}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Settings Grid */}
            <div className="grid md:grid-cols-2 gap-6">

                {/* Profile Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            โปรไฟล์ผู้ใช้
                        </CardTitle>
                        <CardDescription>
                            จัดการข้อมูลส่วนตัวและรหัสผ่าน
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" disabled>
                            แก้ไขโปรไฟล์ (กำลังพัฒนา)
                        </Button>
                    </CardContent>
                </Card>

                {/* Company Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            ข้อมูลบริษัท
                        </CardTitle>
                        <CardDescription>
                            ตั้งค่าข้อมูลบริษัทและโลโก้
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" disabled>
                            ตั้งค่าบริษัท (กำลังพัฒนา)
                        </Button>
                    </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            การแจ้งเตือน
                        </CardTitle>
                        <CardDescription>
                            ตั้งค่าการแจ้งเตือนและอีเมล
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" disabled>
                            ตั้งค่าการแจ้งเตือน (กำลังพัฒนา)
                        </Button>
                    </CardContent>
                </Card>

                {/* Theme Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            ธีมและการแสดงผล
                        </CardTitle>
                        <CardDescription>
                            สลับโหมดกลางวัน/กลางคืน
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" disabled>
                            ตั้งค่าธีม (กำลังพัฒนา)
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Separator className="my-8" />

            {/* Danger Zone */}
            <Card className="border-red-200 dark:border-red-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <Shield className="h-5 w-5" />
                        ส่วนจัดการฐานข้อมูล
                        <Badge variant="destructive">Danger Zone</Badge>
                    </CardTitle>
                    <CardDescription>
                        การดำเนินการในส่วนนี้มีผลกระทบต่อข้อมูลทั้งระบบ กรุณาดำเนินการด้วยความระมัดระวัง
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">

                    {/* Reset Database */}
                    <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg bg-red-50/50 dark:bg-red-950/20">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Database className="h-4 w-4 text-red-500" />
                                <span className="font-medium">รีเซ็ตข้อมูลทั้งหมด</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                ลบข้อมูลแรงงาน, ตัวแทน, นายจ้าง, สินเชื่อ, การชำระเงิน และอื่นๆ <br />
                                <strong className="text-green-600 dark:text-green-400">ยกเว้น:</strong> ผู้ใช้ระบบ และข้อมูลที่อยู่ (จังหวัด/อำเภอ/ตำบล)
                            </p>
                        </div>

                        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    รีเซ็ตข้อมูล
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                                        <AlertTriangle className="h-5 w-5" />
                                        ยืนยันการรีเซ็ตข้อมูล?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="space-y-3">
                                        <p>
                                            การดำเนินการนี้จะ<strong className="text-red-600">ลบข้อมูลทั้งหมด</strong>ออกจากระบบ:
                                        </p>
                                        <ul className="list-disc list-inside text-sm space-y-1 bg-red-50 dark:bg-red-950 p-3 rounded">
                                            <li>แรงงานทั้งหมด ({'>'}200 คน)</li>
                                            <li>ตัวแทนทั้งหมด</li>
                                            <li>นายจ้างทั้งหมด</li>
                                            <li>สินเชื่อและการชำระเงิน</li>
                                            <li>ค่าคอมมิชชั่น</li>
                                            <li>เอกสารทั้งหมด</li>
                                            <li>SOS Alerts</li>
                                        </ul>
                                        <p className="text-green-600 dark:text-green-400 font-medium">
                                            ✅ ข้อมูลที่จะคงไว้: ผู้ใช้ระบบ และข้อมูลที่อยู่
                                        </p>
                                        <div className="mt-4">
                                            <Label htmlFor="confirm" className="text-base font-medium">
                                                พิมพ์ <code className="bg-muted px-2 py-1 rounded font-bold text-red-600">{CONFIRM_PHRASE}</code> เพื่อยืนยัน:
                                            </Label>
                                            <Input
                                                id="confirm"
                                                className="mt-2"
                                                placeholder="พิมพ์ข้อความยืนยัน..."
                                                value={confirmText}
                                                onChange={(e) => setConfirmText(e.target.value)}
                                            />
                                        </div>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setConfirmText('')}>
                                        ยกเลิก
                                    </AlertDialogCancel>
                                    <Button
                                        variant="destructive"
                                        disabled={confirmText !== CONFIRM_PHRASE || isResetting}
                                        onClick={() => setFinalConfirmOpen(true)}
                                    >
                                        {isResetting ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                กำลังรีเซ็ต...
                                            </>
                                        ) : (
                                            'ดำเนินการรีเซ็ต'
                                        )}
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        {/* Final Confirmation Dialog */}
                        <AlertDialog open={finalConfirmOpen} onOpenChange={setFinalConfirmOpen}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-red-600">
                                        ⚠️ ยืนยันครั้งสุดท้าย
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลทั้งหมด?
                                        <br />
                                        <strong>การดำเนินการนี้ไม่สามารถย้อนกลับได้!</strong>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        ไม่, เก็บข้อมูลไว้
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-red-600 hover:bg-red-700"
                                        onClick={handleResetDatabase}
                                        disabled={isResetting}
                                    >
                                        {isResetting ? 'กำลังลบ...' : 'ใช่, ลบข้อมูลทั้งหมด'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                    {/* Re-seed Data */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <RefreshCw className="h-4 w-4 text-blue-500" />
                                <span className="font-medium">สร้างข้อมูลตัวอย่างใหม่</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                สร้าง seed data ใหม่หลังจากรีเซ็ต (ต้องรันด้วย command line)
                            </p>
                        </div>
                        <Button variant="outline" disabled>
                            Run Seed Script
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* System Info */}
            <Card>
                <CardHeader>
                    <CardTitle>ข้อมูลระบบ</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Version</p>
                            <p className="font-mono font-medium">v1.2.0</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Next.js</p>
                            <p className="font-mono font-medium">15.5.9</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Database</p>
                            <p className="font-mono font-medium">PostgreSQL 16</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Timezone</p>
                            <p className="font-mono font-medium">Asia/Bangkok</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
