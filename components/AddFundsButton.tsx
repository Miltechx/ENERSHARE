'use client'

import { useState } from "react"
import { Icons } from "./icons"

export function AddFundsButton() {
  const [loading, setLoading] = useState(false)

  const handleAddFunds = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 5000 }),
      })
      const data = await response.json()
      if (data.authorization_url) {
        window.location.href = data.authorization_url
      } else {
        alert("Payment initialization failed")
      }
    } catch (error) {
      alert("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleAddFunds}
      disabled={loading}
      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center space-x-2"
    >
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      ) : (
        <Icons.Wallet className="w-5 h-5" />
      )}
      <span>{loading ? "Processing..." : "Add Funds"}</span>
    </button>
  )
}
