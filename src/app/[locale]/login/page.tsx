'use client'

import { signIn } from 'next-auth/react'
import { useState, FormEvent } from 'react'
import { useRouter } from '@/i18n/routing'
import { LogIn, Loader2, KeyRound, Mail, Lock, ArrowLeft } from 'lucide-react'
import { Link } from '@/i18n/routing'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError(result.error)
            } else if (result?.ok) {
                router.push('/dashboard')
                router.refresh()
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwZWE1ZTkiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMi41Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex flex-col items-center gap-3 mb-2 group">
                        <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-sky-500/30 group-hover:shadow-2xl group-hover:shadow-sky-500/40 transition-all duration-300 group-hover:-translate-y-1">
                            V
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-800 mt-4">V-ERP</h1>
                    <p className="text-slate-500 mt-1">ระบบบริหารจัดการทรัพยากรองค์กร</p>
                </div>

                {/* Login Card */}
                <div className="card backdrop-blur-sm bg-white/90">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-slate-800">เข้าสู่ระบบ</h2>
                        <p className="text-sm text-slate-500 mt-1">กรุณากรอกข้อมูลเพื่อเข้าใช้งาน</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-red-600 text-xs font-bold">!</span>
                                </div>
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                อีเมล
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="w-5 h-5 text-slate-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input pl-10"
                                    placeholder="admin@v-group.la"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                                รหัสผ่าน
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-slate-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pl-10"
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary flex items-center justify-center gap-2 py-3.5 text-base"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    กำลังเข้าสู่ระบบ...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    เข้าสู่ระบบ
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <div className="flex items-center gap-2 mb-3">
                            <KeyRound className="w-4 h-4 text-amber-500" />
                            <p className="text-sm font-medium text-slate-600">บัญชีทดสอบ</p>
                        </div>
                        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Email</span>
                                <code className="bg-white px-2.5 py-1 rounded text-sm font-mono text-slate-700 border border-slate-200">
                                    admin@v-group.la
                                </code>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Password</span>
                                <code className="bg-white px-2.5 py-1 rounded text-sm font-mono text-slate-700 border border-slate-200">
                                    admin123
                                </code>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-sky-600 hover:text-sky-700 font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        กลับหน้าหลัก
                    </Link>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-xs text-slate-400">
                        © 2024 V-Group Corporation. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    )
}
