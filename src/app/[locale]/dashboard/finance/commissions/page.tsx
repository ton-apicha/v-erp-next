// =====================================================
// Commission Page - Placeholder (Feature Coming Soon)
// Model 'Commission' has been redesigned for V2
// =====================================================

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function CommissionsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">ค่าคอมมิชชั่น</h1>
                <p className="text-muted-foreground">จัดการค่าคอมมิชชั่นตัวแทน</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="h-5 w-5" />
                        อยู่ระหว่างการพัฒนา
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        ระบบค่าคอมมิชชั่นกำลังถูกออกแบบใหม่เพื่อรองรับโครงสร้าง Multi-Company
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        ฟีเจอร์นี้จะพร้อมใช้งานใน Phase 4 (สัปดาห์ที่ 7-8)
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
