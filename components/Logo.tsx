'use client'

import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  variant?: 'full' | 'compact' | 'icon'
  className?: string
}

export function Logo({ variant = 'compact', className = '' }: LogoProps) {
  if (variant === 'icon') {
    return (
      <Link href="/" className={className}>
        <div className="relative w-8 h-8">
          <Image
            src="/logo.png"
            alt="EnerShare"
            fill
            className="object-contain"
            priority
          />
        </div>
      </Link>
    )
  }
  
  return (
    <Link href="/" className={`flex items-center space-x-2 ${className}`}>
      <div className="relative w-6 h-6">
        <Image
          src="/logo.png"
          alt="EnerShare"
          fill
          className="object-contain"
        />
      </div>
      <span className="font-bold text-lg text-gray-800">EnerShare</span>
    </Link>
  )
}
