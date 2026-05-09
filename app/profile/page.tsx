'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { db, storage } from '@/lib/firebase/client'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import BackButton from '@/components/BackButton'
import { Icons } from '@/components/icons'
import { NIGERIAN_STATES } from '@/types'

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'kyc' | 'security'>('profile')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    state: '',
    city: '',
    nin: '',
    bvn: '',
  })
  const [kycStatus, setKycStatus] = useState('pending')

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        address: profile.address || '',
        state: profile.state || '',
        city: profile.city || '',
        nin: profile.nin || '',
        bvn: profile.bvn || '',
      })
      setKycStatus(profile.kycStatus || 'pending')
    }
  }, [profile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await updateDoc(doc(db, 'users', user!.uid), {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        state: formData.state,
        city: formData.city,
        updatedAt: new Date().toISOString(),
      })
      await refreshProfile()
      setSuccess('Profile updated successfully')
    } catch (err) {
      setError('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please upload an image file'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be less than 5MB'); return }
    
    setUploading(true)
    setError('')
    try {
      const storageRef = ref(storage, `avatars/${user!.uid}/${Date.now()}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      await updateDoc(doc(db, 'users', user!.uid), { avatarUrl: url, updatedAt: new Date().toISOString() })
      await refreshProfile()
      setSuccess('Avatar updated successfully')
    } catch (err) { setError('Failed to upload avatar') }
    finally { setUploading(false) }
  }

  const handleKYCSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!formData.nin || formData.nin.length !== 11) { setError('Please enter a valid 11-digit NIN'); setLoading(false); return }
    if (!formData.bvn || formData.bvn.length !== 11) { setError('Please enter a valid 11-digit BVN'); setLoading(false); return }

    try {
      await updateDoc(doc(db, 'users', user!.uid), {
        nin: formData.nin,
        bvn: formData.bvn,
        kycStatus: 'submitted',
        updatedAt: new Date().toISOString(),
      })
      await refreshProfile()
      setSuccess('KYC submitted successfully. Awaiting verification.')
      setKycStatus('submitted')
    } catch (err) { setError('Failed to submit KYC') }
    finally { setLoading(false) }
  }

  if (!user) return null

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    submitted: 'bg-blue-500/20 text-blue-400',
    verified: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackButton />
        <h1 className="text-3xl font-bold text-white mb-8">Profile Settings</h1>

        {/* Avatar Section */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 bg-gray-700 rounded-full overflow-hidden flex items-center justify-center">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Icons.User className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <div>
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition">
                {uploading ? 'Uploading...' : 'Change Avatar'}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              <p className="text-xs text-gray-500 mt-1">Max 5MB. JPG, PNG only</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-gray-700 mb-6">
          <button onClick={() => setActiveTab('profile')} className={`px-6 py-3 text-sm font-medium transition ${activeTab === 'profile' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-300'}`}>Profile</button>
          <button onClick={() => setActiveTab('kyc')} className={`px-6 py-3 text-sm font-medium transition ${activeTab === 'kyc' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-300'}`}>KYC Verification</button>
          <button onClick={() => setActiveTab('security')} className={`px-6 py-3 text-sm font-medium transition ${activeTab === 'security' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-300'}`}>Security</button>
        </div>

        {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500 rounded-lg"><p className="text-red-500 text-sm">{error}</p></div>}
        {success && <div className="mb-6 p-3 bg-green-500/10 border border-green-500 rounded-lg"><p className="text-green-500 text-sm">{success}</p></div>}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate} className="bg-gray-800 rounded-xl p-6 space-y-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label><input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" required /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Email</label><input type="email" value={user.email || ''} disabled className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-400" /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="08012345678" className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" /></div>
            <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-300 mb-1">State</label><select name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"><option value="">Select State</option>{NIGERIAN_STATES.map(state => (<option key={state} value={state}>{state}</option>))}</select></div><div><label className="block text-sm font-medium text-gray-300 mb-1">City</label><input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" /></div></div>
            <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50">{loading ? 'Saving...' : 'Save Changes'}</button>
          </form>
        )}

        {/* KYC Tab */}
        {activeTab === 'kyc' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="mb-6 p-4 bg-gray-700 rounded-lg"><p className="text-gray-300 text-sm mb-2">KYC Status</p><div className="flex items-center gap-2"><span className={`px-3 py-1 rounded-full text-sm ${statusColors[kycStatus]}`}>{kycStatus.toUpperCase()}</span></div></div>
            {kycStatus === 'pending' && (
              <form onSubmit={handleKYCSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-300 mb-1">NIN (11 digits)</label><input type="text" name="nin" value={formData.nin} onChange={handleChange} placeholder="12345678901" maxLength={11} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" required /></div>
                <div><label className="block text-sm font-medium text-gray-300 mb-1">BVN (11 digits)</label><input type="text" name="bvn" value={formData.bvn} onChange={handleChange} placeholder="12345678901" maxLength={11} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" required /></div>
                <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50">{loading ? 'Submitting...' : 'Submit for Verification'}</button>
              </form>
            )}
            {kycStatus === 'submitted' && <div className="text-center py-4"><p className="text-gray-400">Your KYC is under review. We'll notify you once verified.</p></div>}
            {kycStatus === 'verified' && <div className="text-center py-4"><p className="text-green-400">Your identity has been verified. You have full access to all features.</p></div>}
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400 mb-4">Password reset link will be sent to your email</p>
            <button onClick={async () => { const { sendPasswordResetEmail } = await import('firebase/auth'); const { auth } = await import('@/lib/firebase/client'); await sendPasswordResetEmail(auth, user.email!); setSuccess('Password reset email sent. Check your inbox.'); setTimeout(() => setSuccess(''), 5000); }} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold transition">Send Password Reset Link</button>
          </div>
        )}
      </div>
    </div>
  )
}