'use client'
import BackButton from '@/components/BackButton'

import { useState } from "react"
import { getAuth, sendPasswordResetEmail } from "firebase/auth"
import { app } from "@/lib/firebase/config"
import Link from "next/link"

const auth = getAuth(app)

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      await sendPasswordResetEmail(auth, email)
      setMessage("Password reset email sent. Check your inbox.")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <BackButton />
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>
        {message && <p className="text-green-600 text-sm mb-4">{message}</p>}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
          >
            {loading ? "Sending..." : "Send Reset Email"}
          </button>
        </form>
        <p className="text-center text-sm mt-4">
          <Link href="/auth/signin" className="text-green-600">Back to Sign In</Link>
        </p>
      </div>
    </div>
  )
}
