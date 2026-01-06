'use client'

import { useState, useEffect } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface AddressSelectorProps {
    defaultCountry?: 'TH' | 'LA'
    onAddressChange: (address: string) => void
    initialAddress?: string
}

interface Location {
    code: string
    nameEN: string
    nameTH?: string
    nameLO?: string
}

export default function AddressSelector({
    defaultCountry = 'TH',
    onAddressChange,
    initialAddress,
}: AddressSelectorProps) {
    const [country, setCountry] = useState(defaultCountry)
    const [provinces, setProvinces] = useState<Location[]>([])
    const [districts, setDistricts] = useState<Location[]>([])
    const [subdistricts, setSubdistricts] = useState<Location[]>([])

    const [selectedProvince, setSelectedProvince] = useState('')
    const [selectedDistrict, setSelectedDistrict] = useState('')
    const [selectedSubdistrict, setSelectedSubdistrict] = useState('')
    const [details, setDetails] = useState('')

    const [loadingProvinces, setLoadingProvinces] = useState(false)
    const [loadingDistricts, setLoadingDistricts] = useState(false)
    const [loadingSubdistricts, setLoadingSubdistricts] = useState(false)

    // Parse initial address if possible (simplified)
    useEffect(() => {
        if (initialAddress) {
            // This is tricky without structured data, so we mainly blindly set the unified string if provided
            // But for this component usage, we assume we are building NEW addresses mostly.
            // If editing, we might just put the whole thing in "details" if we can't parse it.
            if (!details && !selectedProvince) {
                // setDetails(initialAddress) // Optional: behaviour strategy
            }
        }
    }, [initialAddress])

    // Load Provinces when Country changes
    useEffect(() => {
        const fetchProvinces = async () => {
            setLoadingProvinces(true)
            setProvinces([])
            setSelectedProvince('')
            setSelectedDistrict('')
            setSelectedSubdistrict('')
            try {
                const res = await fetch(`/api/locations/provinces?country=${country}`)
                if (res.ok) {
                    const data = await res.json()
                    setProvinces(data)
                }
            } catch (err) {
                console.error('Failed to fetch provinces', err)
            } finally {
                setLoadingProvinces(false)
            }
        }
        fetchProvinces()
    }, [country])

    // Load Districts when Province changes
    useEffect(() => {
        if (!selectedProvince) {
            setDistricts([])
            return
        }
        const fetchDistricts = async () => {
            setLoadingDistricts(true)
            setDistricts([])
            setSelectedDistrict('')
            setSelectedSubdistrict('')
            try {
                const res = await fetch(`/api/locations/districts?provinceCode=${selectedProvince}`)
                if (res.ok) {
                    const data = await res.json()
                    setDistricts(data)
                }
            } catch (err) {
                console.error('Failed to fetch districts', err)
            } finally {
                setLoadingDistricts(false)
            }
        }
        fetchDistricts()
    }, [selectedProvince])

    // Load Subdistricts when District changes
    useEffect(() => {
        if (!selectedDistrict) {
            setSubdistricts([])
            return
        }

        // Laos data might not have subdistricts in our seed, check this.
        // If TH, we definitely have them.
        const fetchSubdistricts = async () => {
            setLoadingSubdistricts(true)
            setSubdistricts([])
            setSelectedSubdistrict('')
            try {
                const res = await fetch(`/api/locations/subdistricts?districtCode=${selectedDistrict}`)
                if (res.ok) {
                    const data = await res.json()
                    setSubdistricts(data)
                }
            } catch (err) {
                console.error('Failed to fetch subdistricts', err)
            } finally {
                setLoadingSubdistricts(false)
            }
        }
        fetchSubdistricts()
    }, [selectedDistrict])

    // Construct full address string
    useEffect(() => {
        const parts = []
        if (details) parts.push(details)

        const sub = subdistricts.find(s => s.code === selectedSubdistrict)
        const dist = districts.find(d => d.code === selectedDistrict)
        const prov = provinces.find(p => p.code === selectedProvince)

        if (country === 'TH') {
            if (sub) parts.push(`ต.${sub.nameTH || sub.nameEN}`)
            if (dist) parts.push(`อ.${dist.nameTH || dist.nameEN}`)
            if (prov) parts.push(`จ.${prov.nameTH || prov.nameEN}`)
            parts.push('ประเทศไทย')
        } else {
            // Laos Format
            if (sub) parts.push(sub.nameLO || sub.nameEN) // Laos specific term? Ban?
            if (dist) parts.push(`ม.${dist.nameLO || dist.nameEN}`) // Muang
            if (prov) parts.push(`ข.${prov.nameLO || prov.nameEN}`) // Khoueng
            parts.push('สปป.ลาว')
        }

        onAddressChange(parts.join(' '))
    }, [details, selectedSubdistrict, selectedDistrict, selectedProvince, country, subdistricts, districts, provinces, onAddressChange])

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50/50">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>ประเทศ (Country)</Label>
                    <Select value={country} onValueChange={(v: 'TH' | 'LA') => setCountry(v)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TH">ประเทศไทย (Thailand)</SelectItem>
                            <SelectItem value="LA">สปป.ลาว (Laos)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>ที่อยู่รายละเอียด (House No, Village, Road)</Label>
                <Input
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="123/45 หมู่ 6 หมู่บ้าน..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>
                        {country === 'TH' ? 'จังหวัด' : 'แขวง (Province)'}
                        {loadingProvinces && <Loader2 className="inline ml-2 h-3 w-3 animate-spin" />}
                    </Label>
                    <Select value={selectedProvince} onValueChange={setSelectedProvince} disabled={loadingProvinces}>
                        <SelectTrigger>
                            <SelectValue placeholder="เลือกจังหวัด" />
                        </SelectTrigger>
                        <SelectContent>
                            {provinces.map((p) => (
                                <SelectItem key={p.code} value={p.code}>
                                    {country === 'TH' ? p.nameTH : p.nameLO || p.nameEN} ({p.nameEN})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>
                        {country === 'TH' ? 'อำเภอ/เขต' : 'เมือง (District)'}
                        {loadingDistricts && <Loader2 className="inline ml-2 h-3 w-3 animate-spin" />}
                    </Label>
                    <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedProvince || loadingDistricts}>
                        <SelectTrigger>
                            <SelectValue placeholder="เลือกอำเภอ" />
                        </SelectTrigger>
                        <SelectContent>
                            {districts.map((d) => (
                                <SelectItem key={d.code} value={d.code}>
                                    {country === 'TH' ? d.nameTH : d.nameLO || d.nameEN} ({d.nameEN})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>
                        {country === 'TH' ? 'ตำบล/แขวง' : 'เขตย่อย (Subdistrict)'}
                        {loadingSubdistricts && <Loader2 className="inline ml-2 h-3 w-3 animate-spin" />}
                    </Label>
                    <Select value={selectedSubdistrict} onValueChange={setSelectedSubdistrict} disabled={!selectedDistrict || loadingSubdistricts || subdistricts.length === 0}>
                        <SelectTrigger>
                            <SelectValue placeholder="เลือกตำบล" />
                        </SelectTrigger>
                        <SelectContent>
                            {subdistricts.map((s) => (
                                <SelectItem key={s.code} value={s.code}>
                                    {country === 'TH' ? s.nameTH : s.nameLO || s.nameEN} ({s.nameEN})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}
