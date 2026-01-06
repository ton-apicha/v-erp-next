import Link from 'next/link'
import { ArrowRight, Users, Building2, UserCircle, Smartphone } from 'lucide-react'

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                            V
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">V-ERP</h1>
                            <p className="text-xs text-gray-500">Enterprise Resource Planning</p>
                        </div>
                    </div>
                    <Link href="/login" className="btn btn-primary">
                        เข้าสู่ระบบ
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h2 className="text-5xl font-bold text-gray-900 mb-4">
                        ระบบบริหารจัดการทรัพยากร
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        แพลตฟอร์มครบวงจรสำหรับธุรกิจจัดหาแรงงาน
                        จัดการแรงงาน ตัวแทน และนายจ้างได้อย่างมีประสิทธิภาพ
                    </p>
                </div>

                {/* Portals Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    <PortalCard
                        icon={<Building2 className="w-12 h-12" />}
                        title="V-CORE"
                        description="Admin Back Office"
                        subtitle="สำหรับผู้ดูแลระบบ"
                        href="/login"
                        color="bg-blue-500"
                    />

                    <PortalCard
                        icon={<Users className="w-12 h-12" />}
                        title="V-PARTNER"
                        description="Agent Portal"
                        subtitle="สำหรับตัวแทนรับสมัคร"
                        href="/partner"
                        color="bg-green-500"
                    />

                    <PortalCard
                        icon={<UserCircle className="w-12 h-12" />}
                        title="V-CLIENT"
                        description="Employer Portal"
                        subtitle="สำหรับนายจ้าง"
                        href="/client"
                        color="bg-purple-500"
                    />

                    <PortalCard
                        icon={<Smartphone className="w-12 h-12" />}
                        title="V-LIFE"
                        description="Worker Super App"
                        subtitle="สำหรับแรงงาน"
                        href="/life"
                        color="bg-orange-500"
                    />
                </div>

                {/* Features */}
                <div className="card">
                    <h3 className="text-2xl font-bold mb-6">คุณสมบัติหลัก</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <Feature
                            title="จัดการแรงงาน"
                            description="ติดตามสถานะ เอกสาร และข้อมูลแรงงานทั้งหมด"
                        />
                        <Feature
                            title="ระบบตัวแทน"
                            description="บริหารจัดการตัวแทนและค่าคอมมิชชั่น"
                        />
                        <Feature
                            title="ลูกค้า/นายจ้าง"
                            description="จัดการข้อมูลลูกค้าและความต้องการ"
                        />
                        <Feature
                            title="เอกสารออนไลน์"
                            description="อัพโหลดและจัดการเอกสารทั้งหมด"
                        />
                        <Feature
                            title="รายงาน & สถิติ"
                            description="Dashboard และรายงานแบบ Real-time"
                        />
                        <Feature
                            title="แจ้งเตือนอัตโนมัติ"
                            description="แจ้งเตือนวีซ่าหมดอายุและเหตุการณ์สำคัญ"
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t mt-16">
                <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-600">
                    <p>© 2026 V-GROUP. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}

function PortalCard({
    icon,
    title,
    description,
    subtitle,
    href,
    color,
}: {
    icon: React.ReactNode
    title: string
    description: string
    subtitle: string
    href: string
    color: string
}) {
    return (
        <Link
            href={href}
            className="group card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
            <div className={`${color} text-white w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-1">{title}</h3>
            <p className="text-gray-600 mb-1">{description}</p>
            <p className="text-sm text-gray-500 mb-4">{subtitle}</p>
            <div className="flex items-center text-primary-600 font-medium group-hover:gap-2 transition-all">
                เข้าสู่ระบบ
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
        </Link>
    )
}

function Feature({ title, description }: { title: string; description: string }) {
    return (
        <div>
            <h4 className="font-semibold mb-2">{title}</h4>
            <p className="text-sm text-gray-600">{description}</p>
        </div>
    )
}
