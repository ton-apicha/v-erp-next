// =====================================================
// Reports - Agents Page - Placeholder (Model Replaced)
// Agent model has been replaced by Partner model
// =====================================================

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'

export default function AgentReportsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">รายงานตัวแทน</h1>
                <p className="text-muted-foreground">รายงานผลการดำเนินงานของตัวแทน</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="h-5 w-5" />
                        ระบบตัวแทนได้ถูกเปลี่ยนเป็นระบบพาร์ทเนอร์
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        ในระบบใหม่ "ตัวแทน" ได้ถูกเปลี่ยนเป็น "พาร์ทเนอร์" ซึ่งเป็นผู้พาแรงงานมาฝากไว้กับบริษัท
                    </p>
                    <Link href="/dashboard/partners">
                        <Button>ไปยังหน้าพาร์ทเนอร์</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}
