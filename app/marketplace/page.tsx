'use client'
import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Marketplace() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin")
  }, [status, router])

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex justify-between">
          <span className="font-bold text-xl text-green-600">⚡ EnerShare</span>
          <Link href="/dashboard" className="text-gray-600">Dashboard</Link>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Energy Marketplace</h1>
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500">No energy available for sale yet.</p>
          <Link href="/marketplace/sell" className="inline-block mt-4 bg-green-600 text-white px-6 py-2 rounded-lg">Be the first to sell</Link>
        </div>
      </div>
    </div>
  )
}
