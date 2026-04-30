'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SellEnergy() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [price, setPrice] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    alert("Demo: Energy listed for sale! (Supabase not connected)")
    router.push("/marketplace")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-green-600">← Back to Dashboard</Link>
        <h1 className="text-2xl font-bold mt-4 mb-6">Sell Energy</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Amount (kWh)</label>
            <input type="number" step="0.1" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Price per kWh (₦)</label>
            <input type="number" step="1" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          </div>
          <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold">List Energy</button>
        </form>
      </div>
    </div>
  )
}
