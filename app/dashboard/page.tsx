'use client'
import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin")
  }, [status, router])

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex justify-between">
          <span className="font-bold text-xl text-green-600">⚡ EnerShare</span>
          <Link href="/marketplace/sell" className="bg-green-600 text-white px-4 py-2 rounded-lg">Sell Energy</Link>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-500">Wallet Balance</p>
          <p className="text-3xl font-bold text-green-600">₦5,000</p>
          <p className="text-sm text-gray-400 mt-2">Demo credits</p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Link href="/marketplace" className="bg-green-600 text-white text-center py-3 rounded-lg">Buy Energy</Link>
          <Link href="/marketplace/sell" className="border border-green-600 text-green-600 text-center py-3 rounded-lg">Sell Energy</Link>
        </div>
      </div>
    </div>
  )
}
