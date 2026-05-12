'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase/client'
import {
  collection, query, where, getDocs,
  updateDoc, doc, writeBatch, orderBy  // ← orderBy was missing
} from 'firebase/firestore'

interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: string
  read: boolean      // server writes `read`, not `isRead`
  link?: string
  createdAt: any
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading]   = useState(true)
  const [markingAll, setMarkingAll] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/signin')
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) fetchNotifications()
  }, [user])

  const fetchNotifications = async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')   // ← now imported
      )
      const snapshot = await getDocs(q)
      setNotifications(
        snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Notification[]
      )
    } catch (err: any) {
      console.error('Notifications error:', err)
      setError('Could not load notifications. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true }) // `read` not `isRead`
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (err) {
      console.error('markAsRead error:', err)
    }
  }

  const markAllAsRead = async () => {
    setMarkingAll(true)
    try {
      const unread = notifications.filter(n => !n.read)
      const batch  = writeBatch(db)
      unread.forEach(n => batch.update(doc(db, 'notifications', n.id), { read: true }))
      await batch.commit()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {
      console.error('markAllAsRead error:', err)
    } finally {
      setMarkingAll(false)
    }
  }

  const handleClick = async (n: Notification) => {
    if (!n.read) await markAsRead(n.id)
    if (n.link)  router.push(n.link)
  }

  const formatTime = (createdAt: any) => {
    try {
      const date = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt)
      const diff  = Date.now() - date.getTime()
      const mins  = Math.floor(diff / 60000)
      if (mins < 1)   return 'Just now'
      if (mins < 60)  return `${mins}m ago`
      const hrs = Math.floor(mins / 60)
      if (hrs  < 24)  return `${hrs}h ago`
      return date.toLocaleDateString()
    } catch { return '' }
  }

  const typeIcon: Record<string, string> = {
    purchase:         '⚡',
    sale:             '💰',
    payment:          '💳',
    withdrawal:       '🏦',
    withdrawal_failed:'⚠️',
    default:          '🔔',
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-12">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Notifications</h1>
            <p className="text-gray-400 mt-1 text-sm">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={markingAll}
              className="text-sm text-green-500 hover:underline disabled:opacity-50"
            >
              {markingAll ? 'Marking…' : 'Mark all as read'}
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Empty */}
        {notifications.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <div className="text-4xl mb-4">🔔</div>
            <p className="text-white font-medium">No notifications yet</p>
            <p className="text-gray-400 text-sm mt-2">
              You&apos;ll be notified when you buy or sell energy
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className={`p-4 rounded-xl cursor-pointer transition flex gap-4 items-start ${
                  n.read
                    ? 'bg-gray-800 hover:bg-gray-750'
                    : 'bg-gray-700 border-l-4 border-green-500'
                }`}
              >
                {/* Icon */}
                <div className="text-2xl flex-shrink-0 mt-0.5">
                  {typeIcon[n.type] || typeIcon.default}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className={`font-semibold text-sm ${n.read ? 'text-gray-300' : 'text-white'}`}>
                      {n.title}
                    </h3>
                    <span className="text-gray-500 text-xs flex-shrink-0">
                      {formatTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-0.5 leading-snug">{n.message}</p>
                </div>

                {/* Unread dot */}
                {!n.read && (
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}