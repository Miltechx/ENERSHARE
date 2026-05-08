import { Icons } from './icons'

interface StarRatingProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
}

export default function StarRating({ rating, size = 'sm', showValue = false }: StarRatingProps) {
  const sizeClass = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size]

  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Icons.Star
            key={i}
            className={`${sizeClass} ${
              i < fullStars
                ? 'text-yellow-500 fill-current'
                : i === fullStars && hasHalfStar
                ? 'text-yellow-500 fill-current opacity-50'
                : 'text-gray-600'
            }`}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs text-gray-400 ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  )
}