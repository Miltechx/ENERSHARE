'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase/client'
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore'
import { Icons } from './icons'

interface Activity {
  id: string
  action: string
  description: string
  createdAt: any
}

const getActivityIcon = (action: string) => {
  switch (action) {
    case 'login': return <Icons.User className="w-4 h-4 text-blue-400" />
    case 'logout': return <Icons.User className="w-4 h-4 text-gray-400" />
    case 'password_change': return <Icons.Settings className="w-4 h-4 text-yellow-400" />
    case 'kyc_submitted': return <Icons.Check className="w-4 h-4 text-purple-400" />
    case 'listing_created': return <Icons.Lightning className="w-4 h-4 text-green-400" />
    case 'withdrawal_requested': return <Icons.Wallet className="w-4 h-4 text-orange-400" />
    default: return <Icons.Chart className="w-4 h-4 text-gray-400" />
  }
}

const getRelativeTime = (date: Date) => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

export default function ActivityLog() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchActivities = async () => {
      const q = query(
        collection(db, 'activityLogs'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(20)
      )
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Activity[]
      setActivities(data)
      setLoading(false)
    }

    fetchActivities()
  }, [user])

  if (loading) {
    return <div className="animate-pulse text-gray-400">Loading activity...</div>
  }

  if (activities.length === 0) {
    return <p className="text-gray-500 text-center py-8">No activity recorded yet</p>
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
          <div className="mt-0.5">{getActivityIcon(activity.action)}</div>
          <div className="flex-1">
            <p className="text-sm text-gray-300">{activity.description}</p>
            <p className="text-xs text-gray-500 mt-1">
              {getRelativeTime(new Date(activity.createdAt))}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}