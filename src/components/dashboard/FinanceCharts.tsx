'use client'

// =====================================================
// Finance Charts Component
// Interactive charts for loan and payment visualization
// =====================================================

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'
import { TrendingUp, PieChartIcon, BarChart3, RefreshCcw } from 'lucide-react'

interface FinanceChartsProps {
    loanStats: {
        active: number
        overdue: number
        paidOff: number
        totalOutstanding: number
    }
    monthlyData?: {
        month: string
        loans: number
        payments: number
    }[]
}

// Colors
const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b']

export default function FinanceCharts({ loanStats, monthlyData }: FinanceChartsProps) {
    const [activeChart, setActiveChart] = useState<'pie' | 'bar'>('pie')

    // Pie chart data for loan status
    const pieData = [
        { name: 'กำลังผ่อน', value: loanStats.active, color: '#3b82f6' },
        { name: 'ค้างชำระ', value: loanStats.overdue, color: '#ef4444' },
        { name: 'ชำระแล้ว', value: loanStats.paidOff, color: '#22c55e' },
    ].filter(item => item.value > 0)

    // Generate sample monthly data if not provided
    const chartMonthlyData = monthlyData || [
        { month: 'ม.ค.', loans: 5, payments: 12 },
        { month: 'ก.พ.', loans: 8, payments: 15 },
        { month: 'มี.ค.', loans: 12, payments: 20 },
        { month: 'เม.ย.', loans: 6, payments: 18 },
        { month: 'พ.ค.', loans: 10, payments: 25 },
        { month: 'มิ.ย.', loans: 7, payments: 22 },
    ]

    const totalLoans = loanStats.active + loanStats.overdue + loanStats.paidOff

    if (totalLoans === 0) {
        return (
            <Card>
                <CardContent className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>ยังไม่มีข้อมูลสำหรับแสดงกราฟ</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid lg:grid-cols-2 gap-6">
            {/* Loan Status Pie Chart */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <PieChartIcon className="h-5 w-5" />
                                สถานะสินเชื่อ
                            </CardTitle>
                            <CardDescription>
                                แบ่งตามสถานะการชำระ
                            </CardDescription>
                        </div>
                        <Badge variant="outline">
                            รวม {totalLoans} รายการ
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) =>
                                    `${name} ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={100}
                                innerRadius={60}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number, name: string) => [
                                    `${value} รายการ`,
                                    name,
                                ]}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Legend */}
                    <div className="flex justify-center gap-4 mt-4">
                        {pieData.map((entry) => (
                            <div
                                key={entry.name}
                                className="flex items-center gap-2 text-sm"
                            >
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span>{entry.name}</span>
                                <span className="font-medium">{entry.value}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Monthly Trends Bar Chart */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                แนวโน้มรายเดือน
                            </CardTitle>
                            <CardDescription>
                                เปรียบเทียบสินเชื่อใหม่และการชำระ
                            </CardDescription>
                        </div>
                        <div className="flex gap-1">
                            <Button
                                size="sm"
                                variant={activeChart === 'bar' ? 'default' : 'outline'}
                                onClick={() => setActiveChart('bar')}
                            >
                                <BarChart3 className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant={activeChart === 'pie' ? 'default' : 'outline'}
                                onClick={() => setActiveChart('pie')}
                            >
                                <TrendingUp className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        {activeChart === 'bar' ? (
                            <BarChart data={chartMonthlyData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fill: 'currentColor', fontSize: 12 }}
                                />
                                <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Legend />
                                <Bar
                                    dataKey="loans"
                                    name="สินเชื่อใหม่"
                                    fill="#3b82f6"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    dataKey="payments"
                                    name="การชำระ"
                                    fill="#22c55e"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        ) : (
                            <LineChart data={chartMonthlyData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fill: 'currentColor', fontSize: 12 }}
                                />
                                <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="loans"
                                    name="สินเชื่อใหม่"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ fill: '#3b82f6' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="payments"
                                    name="การชำระ"
                                    stroke="#22c55e"
                                    strokeWidth={2}
                                    dot={{ fill: '#22c55e' }}
                                />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
