'use client'

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
          <img 
            src="/logo.png" 
            alt="EnerShare" 
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback if logo.png doesn't exist
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"%3E%3Cpath d="M16 2L6 16H14L12 26L26 12H18L16 2Z" fill="%2300C853" stroke="%2300C853" stroke-width="1.5"/%3E%3C/svg%3E'
            }}
          />
        </div>
      </Link>
    )
  }
  
  return (
    <Link href="/" className={`flex items-center space-x-2 ${className}`}>
      <div className="relative w-6 h-6">
        <img 
          src="/logo.png" 
          alt="EnerShare" 
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback if logo.png doesn't exist
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"%3E%3Cpath d="M16 2L6 16H14L12 26L26 12H18L16 2Z" fill="%2300C853" stroke="%2300C853" stroke-width="1.5"/%3E%3C/svg%3E'
          }}
        />
      </div>
      <span className="font-bold text-lg text-gray-800">EnerShare</span>
    </Link>
  )
}
