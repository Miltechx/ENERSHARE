'use client'
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await signIn("credentials", { email, password, redirect: false })
    if (result?.error) setError("Invalid credentials")
    else router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to EnerShare</h1>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border rounded-lg" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-lg" required />
          <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold">Sign In</button>
        </form>
        <p className="text-center text-sm mt-6">No account? <a href="/auth/signup" className="text-green-600">Sign up</a></p>
      </div>
    </div>
  )
}
