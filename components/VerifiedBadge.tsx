import { Icons } from './icons'

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
}

export default function VerifiedBadge({ size = 'sm', showTooltip = true }: VerifiedBadgeProps) {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size]

  return (
    <div className="relative inline-flex items-center group">
      <Icons.Check className={`${sizeClass} text-green-500`} />
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
          Verified Producer — KYC confirmed, 5+ successful trades, 4+ rating
        </div>
      )}
    </div>
  )
}