'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/firebase/config'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    const checkAdmin = async () => {
      if (!session?.user?.id) return

      const userRef = doc(db, 'profiles', session.user.id)
      const userSnap = await getDoc(userRef)
      const userData = userSnap.data()

      if (userData?.is_admin === true) {
        setIsAdmin(true)
        const usersSnapshot = await getDocs(collection(db, 'profiles'))
        const usersData = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setUsers(usersData)
      } else {
        router.push('/dashboard')
      }
      setLoading(false)
    }

    if (session?.user) {
      checkAdmin()
    }
  }, [session])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <Link href="/dashboard" className="text-green-600 mt-4 inline-block">Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex justify-between">
          <h1 className="text-xl font-bold">EnerShare Admin</h1>
          <Link href="/dashboard" className="text-gray-600">Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-lg font-semibold mb-4">Users</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Admin</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="p-3">{user.full_name || '—'}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.is_admin ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
