'use client'

import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
    src: string
    alt: string
    width?: number
    height?: number
    fill?: boolean
    priority?: boolean
    className?: string
    sizes?: string
}

/**
 * Optimized Image Component
 * - Uses Next.js Image for automatic WebP conversion
 * - Lazy loading by default
 * - Blur placeholder with skeleton
 * - Responsive sizes
 */
export function OptimizedImage({
    src,
    alt,
    width,
    height,
    fill = false,
    priority = false,
    className = '',
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)

    // Handle external URLs or MinIO URLs
    const isExternal = src.startsWith('http') || src.startsWith('//')

    if (error) {
        return (
            <div
                className={`bg-slate-200 flex items-center justify-center ${className}`}
                style={{ width: width || '100%', height: height || 200 }}
            >
                <span className="text-slate-400 text-sm">ไม่พบรูปภาพ</span>
            </div>
        )
    }

    const imageProps = {
        src,
        alt,
        className: `transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`,
        onLoad: () => setIsLoading(false),
        onError: () => setError(true),
        priority,
        sizes,
        ...(fill ? { fill: true } : { width: width || 800, height: height || 450 }),
        ...(isExternal && { unoptimized: true })
    }

    return (
        <div className={`relative overflow-hidden ${fill ? 'w-full h-full' : ''}`}>
            {isLoading && (
                <div
                    className="absolute inset-0 bg-slate-200 animate-pulse"
                    style={{ width: width || '100%', height: height || 200 }}
                />
            )}
            <Image {...imageProps} />
        </div>
    )
}
