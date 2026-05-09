'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase/client'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'

export default function AdminKYCPage() {
  const { profile } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.is_admin) {
      fetchUsers()
    }
  }, [profile])

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, 'users'))
    setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    setLoading(false)
  }

  const approveKYC = async (userId: string) => {
    await updateDoc(doc(db, 'users', userId), { kycStatus: 'verified' })
    fetchUsers()
  }

  const rejectKYC = async (userId: string) => {
    await updateDoc(doc(db, 'users', userId), { kycStatus: 'rejected' })
    fetchUsers()
  }

  if (!profile?.is_admin) return <div>Access Denied</div>

  const pendingUsers = users.filter(u => u.kycStatus === 'submitted')

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-3xl font-bold text-white mb-8">KYC Approvals</h1>
      {pendingUsers.length === 0 ? (
        <p className="text-gray-400">No pending KYC submissions</p>
      ) : (
        <div className="space-y-4">
          {pendingUsers.map(user => (
            <div key={user.id} className="bg-gray-800 rounded-xl p-6">
              <p className="text-white font-semibold">{user.fullName}</p>
              <p className="text-gray-400 text-sm">{user.email}</p>
              <p className="text-gray-400 text-sm mt-2">NIN: {user.nin || 'Not provided'}</p>
              <p className="text-gray-400 text-sm">BVN: {user.bvn || 'Not provided'}</p>
              <div className="flex gap-3 mt-4">
                <button onClick={() => approveKYC(user.id)} className="bg-green-600 px-4 py-2 rounded-lg">Approve</button>
                <button onClick={() => rejectKYC(user.id)} className="bg-red-600 px-4 py-2 rounded-lg">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}