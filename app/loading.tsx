import { Icons } from '@/components/icons'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 relative">
          <Icons.Lightning className="w-full h-full text-green-500 animate-pulse" />
        </div>
        <p className="text-gray-400">Loading EnerShare...</p>
      </div>
    </div>
  )
}