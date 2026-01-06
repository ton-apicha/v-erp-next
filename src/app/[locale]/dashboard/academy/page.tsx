import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    GraduationCap,
    BookOpen,
    Users,
    Calendar,
    ClipboardList,
    Package,
    Clock,
    CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'

export default function AcademyPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <GraduationCap className="h-6 w-6" />
                        ศูนย์ฝึกอบรม
                    </h1>
                    <p className="text-muted-foreground">
                        จัดการการฝึกอบรมและอุปกรณ์ของแรงงาน
                    </p>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-1">
                    🚧 กำลังพัฒนา
                </Badge>
            </div>

            {/* Coming Soon Banner */}
            <Card className="border-primary/20 bg-primary/5">
                <CardContent className="py-8">
                    <div className="text-center">
                        <GraduationCap className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
                        <h2 className="text-xl font-semibold mb-2">ฟีเจอร์กำลังพัฒนา</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            ระบบจัดการการฝึกอบรมและติดตามอุปกรณ์กำลังอยู่ในระหว่างการพัฒนา
                            คาดว่าจะพร้อมใช้งานเร็วๆ นี้
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Feature Preview */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="opacity-60">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            ตารางฝึกอบรม
                        </CardTitle>
                        <CardDescription>
                            จัดการตารางการฝึกอบรมแรงงาน
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                กำหนดรุ่นการฝึก
                            </li>
                            <li className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                จัดกลุ่มผู้เข้าอบรม
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                ติดตามความคืบหน้า
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="opacity-60">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            จัดการอุปกรณ์
                        </CardTitle>
                        <CardDescription>
                            ติดตามการเบิก-จ่ายอุปกรณ์
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li className="flex items-center gap-2">
                                <ClipboardList className="h-4 w-4" />
                                บันทึกการเบิกจ่าย
                            </li>
                            <li className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                คลังอุปกรณ์
                            </li>
                            <li className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                ติดตามต่อตัวแทน
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="opacity-60">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            หลักสูตร
                        </CardTitle>
                        <CardDescription>
                            จัดการเนื้อหาหลักสูตร
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                เนื้อหาภาษาไทย
                            </li>
                            <li className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                เนื้อหาภาษาลาว
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                แบบทดสอบ
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Link */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">ต้องการดูแรงงานที่อยู่ในขั้นตอนฝึกอบรม?</p>
                            <p className="text-sm text-muted-foreground">
                                ดูรายชื่อแรงงานที่มีสถานะ "ACADEMY" ได้ที่หน้า Workers
                            </p>
                        </div>
                        <Link href="/dashboard/workers?status=ACADEMY">
                            <Button>
                                <Users className="h-4 w-4 mr-2" />
                                ดูแรงงานฝึกอบรม
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
