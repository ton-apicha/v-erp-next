'use client'

import { useState, useEffect, useCallback } from 'react'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface Province {
    id: string
    code: string
    nameEN: string
    nameTH: string | null
    nameLO?: string | null
    countryCode: string
}

interface District {
    id: string
    code: string
    nameEN: string
    nameTH: string | null
    nameLO?: string | null
    provinceCode: string
}

interface Subdistrict {
    id: string
    code: string
    nameEN: string
    nameTH: string | null
    districtCode: string
}

export interface AddressValue {
    countryCode: string
    provinceCode: string
    districtCode: string
    subdistrictCode?: string
    provinceName?: string
    districtName?: string
    subdistrictName?: string
}

interface AddressSelectorProps {
    value?: Partial<AddressValue>
    onChange?: (value: AddressValue) => void
    defaultCountry?: 'TH' | 'LA'
    showSubdistrict?: boolean
    disabled?: boolean
    required?: boolean
    className?: string
    locale?: 'th' | 'en' | 'la'
}

export function AddressSelector({
    value,
    onChange,
    defaultCountry = 'LA',
    showSubdistrict = true,
    disabled = false,
    required = false,
    className = '',
    locale = 'th',
}: AddressSelectorProps) {
    const [country, setCountry] = useState(value?.countryCode || defaultCountry)
    const [provinces, setProvinces] = useState<Province[]>([])
    const [districts, setDistricts] = useState<District[]>([])
    const [subdistricts, setSubdistricts] = useState<Subdistrict[]>([])

    const [selectedProvince, setSelectedProvince] = useState(value?.provinceCode || '')
    const [selectedDistrict, setSelectedDistrict] = useState(value?.districtCode || '')
    const [selectedSubdistrict, setSelectedSubdistrict] = useState(value?.subdistrictCode || '')

    const [loading, setLoading] = useState({ provinces: false, districts: false, subdistricts: false })

    const getName = (item: { nameEN: string; nameTH?: string | null; nameLO?: string | null }) => {
        if (locale === 'la' && item.nameLO) return item.nameLO
        if (locale === 'th' && item.nameTH) return item.nameTH
        return item.nameEN
    }

    // Fetch provinces when country changes
    const fetchProvinces = useCallback(async (countryCode: string) => {
        setLoading(prev => ({ ...prev, provinces: true }))
        try {
            const res = await fetch(`/api/locations/provinces?country=${countryCode}`)
            if (res.ok) {
                const data = await res.json()
                setProvinces(data)
            }
        } catch (error) {
            console.error('Failed to fetch provinces:', error)
        } finally {
            setLoading(prev => ({ ...prev, provinces: false }))
        }
    }, [])

    // Fetch districts when province changes
    const fetchDistricts = useCallback(async (provinceCode: string) => {
        if (!provinceCode) {
            setDistricts([])
            return
        }
        setLoading(prev => ({ ...prev, districts: true }))
        try {
            const res = await fetch(`/api/locations/districts?province=${provinceCode}`)
            if (res.ok) {
                const data = await res.json()
                setDistricts(data)
            }
        } catch (error) {
            console.error('Failed to fetch districts:', error)
        } finally {
            setLoading(prev => ({ ...prev, districts: false }))
        }
    }, [])

    // Fetch subdistricts when district changes (Thailand only)
    const fetchSubdistricts = useCallback(async (districtCode: string) => {
        if (!districtCode || country !== 'TH') {
            setSubdistricts([])
            return
        }
        setLoading(prev => ({ ...prev, subdistricts: true }))
        try {
            const res = await fetch(`/api/locations/subdistricts?district=${districtCode}`)
            if (res.ok) {
                const data = await res.json()
                setSubdistricts(data)
            }
        } catch (error) {
            console.error('Failed to fetch subdistricts:', error)
        } finally {
            setLoading(prev => ({ ...prev, subdistricts: false }))
        }
    }, [country])

    // Load initial provinces
    useEffect(() => {
        fetchProvinces(country)
    }, [country, fetchProvinces])

    // Load districts when province selected
    useEffect(() => {
        if (selectedProvince) {
            fetchDistricts(selectedProvince)
        }
    }, [selectedProvince, fetchDistricts])

    // Load subdistricts when district selected
    useEffect(() => {
        if (selectedDistrict && showSubdistrict && country === 'TH') {
            fetchSubdistricts(selectedDistrict)
        }
    }, [selectedDistrict, showSubdistrict, country, fetchSubdistricts])

    // Notify parent of changes
    const emitChange = useCallback((updates: Partial<AddressValue>) => {
        const province = provinces.find(p => p.code === (updates.provinceCode || selectedProvince))
        const district = districts.find(d => d.code === (updates.districtCode || selectedDistrict))
        const subdistrict = subdistricts.find(s => s.code === (updates.subdistrictCode || selectedSubdistrict))

        onChange?.({
            countryCode: country,
            provinceCode: updates.provinceCode || selectedProvince,
            districtCode: updates.districtCode || selectedDistrict,
            subdistrictCode: updates.subdistrictCode || selectedSubdistrict,
            provinceName: province ? getName(province) : undefined,
            districtName: district ? getName(district) : undefined,
            subdistrictName: subdistrict ? getName(subdistrict) : undefined,
        })
    }, [country, selectedProvince, selectedDistrict, selectedSubdistrict, provinces, districts, subdistricts, onChange])

    const handleCountryChange = (value: string) => {
        setCountry(value)
        setSelectedProvince('')
        setSelectedDistrict('')
        setSelectedSubdistrict('')
        setDistricts([])
        setSubdistricts([])
    }

    const handleProvinceChange = (code: string) => {
        setSelectedProvince(code)
        setSelectedDistrict('')
        setSelectedSubdistrict('')
        setSubdistricts([])
        emitChange({ provinceCode: code, districtCode: '', subdistrictCode: '' })
    }

    const handleDistrictChange = (code: string) => {
        setSelectedDistrict(code)
        setSelectedSubdistrict('')
        emitChange({ districtCode: code, subdistrictCode: '' })
    }

    const handleSubdistrictChange = (code: string) => {
        setSelectedSubdistrict(code)
        emitChange({ subdistrictCode: code })
    }

    const labels = {
        th: {
            country: 'ประเทศ',
            province: 'จังหวัด',
            district: 'อำเภอ/เขต',
            subdistrict: 'ตำบล/แขวง',
            select: 'เลือก',
            thailand: 'ไทย',
            laos: 'ลาว',
        },
        la: {
            country: 'ປະເທດ',
            province: 'ແຂວງ',
            district: 'ເມືອງ',
            subdistrict: 'ບ້ານ',
            select: 'ເລືອກ',
            thailand: 'ໄທ',
            laos: 'ລາວ',
        },
        en: {
            country: 'Country',
            province: 'Province',
            district: 'District',
            subdistrict: 'Subdistrict',
            select: 'Select',
            thailand: 'Thailand',
            laos: 'Laos',
        },
    }

    const t = labels[locale]

    return (
        <div className={`grid gap-4 ${className}`}>
            {/* Country */}
            <div className="grid gap-2">
                <Label>{t.country} {required && <span className="text-red-500">*</span>}</Label>
                <Select
                    value={country}
                    onValueChange={handleCountryChange}
                    disabled={disabled}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={t.select} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="LA">🇱🇦 {t.laos}</SelectItem>
                        <SelectItem value="TH">🇹🇭 {t.thailand}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Province */}
            <div className="grid gap-2">
                <Label>{t.province} {required && <span className="text-red-500">*</span>}</Label>
                <Select
                    value={selectedProvince}
                    onValueChange={handleProvinceChange}
                    disabled={disabled || loading.provinces}
                >
                    <SelectTrigger>
                        {loading.provinces ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <SelectValue placeholder={`${t.select}${t.province}...`} />
                        )}
                    </SelectTrigger>
                    <SelectContent>
                        {provinces.map((province) => (
                            <SelectItem key={province.code} value={province.code}>
                                {getName(province)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* District */}
            <div className="grid gap-2">
                <Label>{t.district} {required && <span className="text-red-500">*</span>}</Label>
                <Select
                    value={selectedDistrict}
                    onValueChange={handleDistrictChange}
                    disabled={disabled || !selectedProvince || loading.districts}
                >
                    <SelectTrigger>
                        {loading.districts ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <SelectValue placeholder={`${t.select}${t.district}...`} />
                        )}
                    </SelectTrigger>
                    <SelectContent>
                        {districts.map((district) => (
                            <SelectItem key={district.code} value={district.code}>
                                {getName(district)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Subdistrict (Thailand only) */}
            {showSubdistrict && country === 'TH' && (
                <div className="grid gap-2">
                    <Label>{t.subdistrict}</Label>
                    <Select
                        value={selectedSubdistrict}
                        onValueChange={handleSubdistrictChange}
                        disabled={disabled || !selectedDistrict || loading.subdistricts}
                    >
                        <SelectTrigger>
                            {loading.subdistricts ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <SelectValue placeholder={`${t.select}${t.subdistrict}...`} />
                            )}
                        </SelectTrigger>
                        <SelectContent>
                            {subdistricts.map((sub) => (
                                <SelectItem key={sub.code} value={sub.code}>
                                    {getName(sub)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    )
}

export default AddressSelector
