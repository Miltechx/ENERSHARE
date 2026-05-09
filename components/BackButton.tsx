'use client'

import { useRouter } from 'next/navigation'
import { Icons } from './icons'

export default function BackButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-4"
    >
      <Icons.ArrowRight className="w-5 h-5 rotate-180" />
      <span>Back</span>
    </button>
  )
}