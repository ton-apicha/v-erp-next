'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function NewWorkerPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            firstNameTH: formData.get('firstNameTH'),
            lastNameTH: formData.get('lastNameTH'),
            firstNameEN: formData.get('firstNameEN'),
            lastNameEN: formData.get('lastNameEN'),
            nickname: formData.get('nickname'),
            gender: formData.get('gender'),
            dateOfBirth: formData.get('dateOfBirth'),
            nationality: formData.get('nationality') || 'LAO',
            religion: formData.get('religion'),
            phoneNumber: formData.get('phoneNumber'),
            email: formData.get('email'),
            lineId: formData.get('lineId'),
            address: formData.get('address'),
            passportNo: formData.get('passportNo'),
            visaNo: formData.get('visaNo'),
            workPermitNo: formData.get('workPermitNo'),
        }

        try {
            const res = await fetch('/api/workers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (res.ok) {
                router.push('/dashboard/workers')
                router.refresh()
            } else {
                const error = await res.json()
                setError(error.message || 'เกิดข้อผิดพลาด')
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/dashboard/workers"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    กลับ
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">เพิ่มแรงงาน</h1>
                <p className="text-gray-600">กรอกข้อมูลแรงงานใหม่</p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Error Message */}
                {error && (
                    <div className="card bg-red-50 border border-red-200 text-red-700 mb-6">
                        {error}
                    </div>
                )}

                {/* Personal Info */}
                <div className="card mb-6">
                    <h2 className="text-xl font-semibold mb-4">ข้อมูลส่วนตัว</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ชื่อ (ไทย) <span className="text-red-500">*</span>
                            </label>
                            <input type="text" name="firstNameTH" className="input" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                นามสกุล (ไทย) <span className="text-red-500">*</span>
                            </label>
                            <input type="text" name="lastNameTH" className="input" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ชื่อ (อังกฤษ)
                            </label>
                            <input type="text" name="firstNameEN" className="input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                นามสกุล (อังกฤษ)
                            </label>
                            <input type="text" name="lastNameEN" className="input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ชื่อเล่น
                            </label>
                            <input type="text" name="nickname" className="input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                เพศ <span className="text-red-500">*</span>
                            </label>
                            <select name="gender" className="input" required>
                                <option value="">เลือกเพศ</option>
                                <option value="MALE">ชาย</option>
                                <option value="FEMALE">หญิง</option>
                                <option value="OTHER">อื่นๆ</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                วันเกิด <span className="text-red-500">*</span>
                            </label>
                            <input type="date" name="dateOfBirth" className="input" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                สัญชาติ
                            </label>
                            <input type="text" name="nationality" className="input" defaultValue="LAO" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ศาสนา
                            </label>
                            <input type="text" name="religion" className="input" />
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="card mb-6">
                    <h2 className="text-xl font-semibold mb-4">ข้อมูลติดต่อ</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                เบอร์โทร
                            </label>
                            <input type="tel" name="phoneNumber" className="input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                อีเมล
                            </label>
                            <input type="email" name="email" className="input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                LINE ID
                            </label>
                            <input type="text" name="lineId" className="input" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ที่อยู่
                            </label>
                            <textarea name="address" rows={3} className="input" />
                        </div>
                    </div>
                </div>

                {/* Documents */}
                <div className="card mb-6">
                    <h2 className="text-xl font-semibold mb-4">เอกสาร</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                เลขที่พาสปอร์ต
                            </label>
                            <input type="text" name="passportNo" className="input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                เลขที่วีซ่า
                            </label>
                            <input type="text" name="visaNo" className="input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                เลขที่ใบอนุญาตทำงาน
                            </label>
                            <input type="text" name="workPermitNo" className="input" />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                กำลังบันทึก...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                บันทึก
                            </>
                        )}
                    </button>
                    <Link href="/dashboard/workers" className="btn btn-secondary">
                        ยกเลิก
                    </Link>
                </div>
            </form>
        </div>
    )
}
