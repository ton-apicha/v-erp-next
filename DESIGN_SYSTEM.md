# 🎨 V-ERP Design System Guide
> สำหรับ AI Agents (Gemini Pro) เพื่อสร้างหน้าตาที่สอดคล้องกับระบบ

## 🎯 Overview

V-ERP ออกแบบโดย Claude Opus 4.5 ใช้ **Light Mode Only** พร้อมสี, spacing, และ component patterns ที่กำหนดไว้ในไฟล์นี้

---

## 🎨 Color Palette

### Primary Colors (ใช้ทั่วไป)
```css
--primary: hsl(222.2, 47.4%, 11.2%)  /* Navy ดำ - ปุ่มหลัก */
--primary-foreground: hsl(210, 40%, 98%) /* Text บนปุ่มหลัก */
```

### Status Colors (Badge/Alert)
| Purpose | Background | Text |
|---------|------------|------|
| Success | `bg-green-100` or `bg-green-500` | `text-green-700` or `text-white` |
| Warning | `bg-amber-100` or `bg-amber-500` | `text-amber-700` or `text-white` |
| Error | `bg-red-100` or `bg-red-500` | `text-red-700` or `text-white` |
| Info | `bg-blue-100` or `bg-blue-500` | `text-blue-700` or `text-white` |
| Neutral | `bg-gray-100` or `bg-muted` | `text-gray-700` or `text-muted-foreground` |
| Purple | `bg-purple-100` | `text-purple-700` |

### Stats Card Colors
```jsx
// Worker Stats
<div className="bg-blue-500">   // แรงงาน
<div className="bg-green-500">  // Partners/Success
<div className="bg-purple-500"> // Clients
<div className="bg-amber-500">  // Finance/Warning
```

---

## 📐 Layout Patterns

### Page Structure
```jsx
<div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold">หัวข้อหน้า</h1>
            <p className="text-muted-foreground">คำอธิบาย</p>
        </div>
        <Button>Action</Button>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* StatCard components */}
    </div>

    {/* Main Content */}
    <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            {/* Main content area */}
        </div>
        <div className="space-y-6">
            {/* Sidebar widgets */}
        </div>
    </div>
</div>
```

### Stats Card Component
```jsx
<Card>
    <CardContent className="p-4 text-center">
        <Icon className="h-6 w-6 mx-auto text-blue-500 mb-2" />
        <p className="text-2xl font-bold text-blue-700">{value}</p>
        <p className="text-xs text-muted-foreground">Label</p>
    </CardContent>
</Card>

// หรือแบบ horizontal
<Card>
    <CardContent className="p-4 flex items-center justify-between">
        <div>
            <p className="text-xs text-muted-foreground mb-1">Label</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
            <Icon className="h-6 w-6" />
        </div>
    </CardContent>
</Card>
```

---

## 🧩 Component Patterns

### Card with Header
```jsx
<Card>
    <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    ชื่อ Card
                </CardTitle>
                <CardDescription>คำอธิบาย</CardDescription>
            </div>
            <Link href="/...">
                <Button variant="outline" size="sm">ดูทั้งหมด</Button>
            </Link>
        </div>
    </CardHeader>
    <CardContent>
        {/* Content */}
    </CardContent>
</Card>
```

### List Item (Clickable)
```jsx
<Link href={`/dashboard/.../${item.id}`}
    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
>
    <div>
        <p className="font-medium">{item.name}</p>
        <p className="text-xs text-muted-foreground">{item.subtitle}</p>
    </div>
    <Badge variant="outline">{item.status}</Badge>
</Link>
```

### Progress Bar
```jsx
<div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
    <div
        className="h-full bg-primary transition-all"
        style={{ width: `${percentage}%` }}
    />
</div>
```

### Activity Item
```jsx
<div className="flex items-center gap-3 p-3 border rounded-lg">
    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
        type === 'CREATE' ? 'bg-green-100 text-green-600' :
        type === 'UPDATE' ? 'bg-blue-100 text-blue-600' :
        'bg-red-100 text-red-600'
    }`}>
        <Icon className="h-4 w-4" />
    </div>
    <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
    </div>
</div>
```

---

## 🔘 Button Patterns

### Primary Actions
```jsx
<Button>                          // Default - Navy background
<Button variant="outline">        // Border only
<Button variant="ghost">          // No border/background
<Button variant="destructive">    // Red - Delete actions
<Button variant="link">           // Text only
```

### Button with Icon
```jsx
<Button>
    <Icon className="h-4 w-4 mr-2" />
    ข้อความ
</Button>
```

### Button Sizes
```jsx
<Button size="sm">    // Small
<Button>              // Default
<Button size="lg">    // Large
<Button size="icon">  // Square icon button
```

---

## 📝 Form Patterns

### Form Layout
```jsx
<form className="space-y-6">
    <div className="space-y-2">
        <Label>Label <span className="text-red-500">*</span></Label>
        <Input placeholder="placeholder..." />
    </div>

    <div className="grid md:grid-cols-2 gap-4">
        {/* Two columns on tablet+ */}
    </div>

    <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1">บันทึก</Button>
        <Button type="button" variant="outline">ยกเลิก</Button>
    </div>
</form>
```

### Select Dropdown
```jsx
<Select value={value} onValueChange={setValue}>
    <SelectTrigger>
        <SelectValue placeholder="เลือก..." />
    </SelectTrigger>
    <SelectContent>
        <SelectItem value="value1">Option 1</SelectItem>
        <SelectItem value="value2">Option 2</SelectItem>
    </SelectContent>
</Select>
```

---

## 🏷️ Badge Patterns

### Status Badges
```jsx
<Badge variant="default">Active</Badge>          // Primary color
<Badge variant="secondary">Inactive</Badge>      // Gray
<Badge variant="destructive">Error</Badge>       // Red
<Badge variant="outline">Info</Badge>            // Border only

// Custom color badges
<Badge className="bg-green-100 text-green-800">Success</Badge>
<Badge className="bg-amber-100 text-amber-800">Warning</Badge>
<Badge className="bg-blue-100 text-blue-800">Info</Badge>
```

---

## 📊 Table Patterns

```jsx
<div className="overflow-x-auto">
    <table className="w-full">
        <thead>
            <tr className="border-b">
                <th className="text-left py-3 px-2">Column</th>
                <th className="text-right py-3 px-2">Number</th>
                <th className="text-center py-3 px-2">Status</th>
            </tr>
        </thead>
        <tbody>
            {items.map((item) => (
                <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-2">{item.name}</td>
                    <td className="py-3 px-2 text-right font-medium">
                        ฿{Number(item.amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-center">
                        <Badge>{item.status}</Badge>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
</div>
```

---

## 🎭 Empty States

```jsx
<div className="text-center py-8 text-muted-foreground">
    <Icon className="h-12 w-12 mx-auto mb-2 opacity-50" />
    <p>ไม่มีข้อมูล</p>
    <Link href="/dashboard/...">
        <Button className="mt-4" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            เพิ่มข้อมูลใหม่
        </Button>
    </Link>
</div>
```

---

## 📅 Date Formatting

```jsx
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

// Full date
format(new Date(), 'dd MMMM yyyy', { locale: th })    // "17 มกราคม 2569"

// Short date
format(new Date(), 'dd/MM/yyyy')                       // "17/01/2569"

// With time
format(new Date(), 'dd/MM/yyyy HH:mm', { locale: th }) // "17/01/2569 10:30"

// Relative short
format(new Date(), 'dd MMM yy', { locale: th })        // "17 ม.ค. 69"
```

---

## 🔗 Navigation

### Internal Links (MUST use i18n routing)
```jsx
import { Link } from '@/i18n/routing'

<Link href="/dashboard/workers">        // ✅ Correct
<Link href="/th/dashboard/workers">     // ❌ Don't hardcode locale
```

### Back Button
```jsx
<Link href="/dashboard/previous-page">
    <Button variant="outline" size="icon">
        <ArrowLeft className="h-4 w-4" />
    </Button>
</Link>
```

---

## 📱 Responsive Guidelines

| Breakpoint | Use Case |
|------------|----------|
| `md:` | 768px+ (Tablet) |
| `lg:` | 1024px+ (Desktop) |
| `xl:` | 1280px+ (Large) |

### Common Patterns
```jsx
// 2 cols → 4 cols
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">

// Full width → 2/3 + 1/3
<div className="grid lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2">Main</div>
    <div>Sidebar</div>
</div>

// Stacked → Row
<div className="flex flex-col md:flex-row gap-4">
```

---

## 🎯 Key Icons (lucide-react)

```jsx
// Common
import { Users, Building2, Handshake, CreditCard } from 'lucide-react'

// Actions
import { Plus, Search, Edit, Trash2, ArrowLeft, ArrowRight } from 'lucide-react'

// Status
import { CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react'

// Modules
import { GraduationCap, Home, Heart, FileText, BarChart3 } from 'lucide-react'
```

---

## ⚡ Quick Checklist for New Pages

- [ ] ใช้ `space-y-6` สำหรับ page container
- [ ] ใช้ `gap-4` หรือ `gap-6` สำหรับ grids
- [ ] Header มี title + description + action button
- [ ] Stats Cards ใช้ consistent color scheme
- [ ] ใช้ `Link` จาก `@/i18n/routing` เท่านั้น
- [ ] Tables มี `hover:bg-muted/50` row effect
- [ ] Empty states มี icon + message + action
- [ ] Forms ใช้ `space-y-6` และ `space-y-2` for fields
- [ ] Badges ใช้ consistent status colors
- [ ] Loading states ใช้ `<Loader2 className="h-4 w-4 animate-spin" />`

---

*สร้างโดย Claude Opus 4.5 - ใช้สำหรับ AI Agents อ้างอิงในการพัฒนา V-ERP ต่อ*
