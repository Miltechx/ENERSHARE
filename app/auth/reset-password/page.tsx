'use client'
import BackButton from '@/components/BackButton'

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getAuth, confirmPasswordReset } from "firebase/auth"
import { app } from "@/lib/firebase/config"
import Link from "next/link"

const auth = getAuth(app)

export default function ResetPassword() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [oobCode, setOobCode] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get("oobCode")
    if (code) setOobCode(code)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError("Passwords do not match")
      return
    }
    if (!oobCode) {
      setError("Invalid or missing reset code")
      return
    }

    setLoading(true)
    setError("")
    setMessage("")

    try {
      await confirmPasswordReset(auth, oobCode, password)
      setMessage("Password reset successful! Redirecting to sign in...")
      setTimeout(() => router.push("/auth/signin"), 3000)
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
        <h1 className="text-2xl font-bold mb-6 text-center">Set New Password</h1>
        {message && <p className="text-green-600 text-sm mb-4">{message}</p>}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            required
          />
          <button
            type="submit"
            disabled={loading || !oobCode}
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <p className="text-center text-sm mt-4">
          <Link href="/auth/signin" className="text-green-600">Back to Sign In</Link>
        </p>
      </div>
    </div>
  )
}
