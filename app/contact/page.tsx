'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BackButton from '@/components/BackButton'
import { db } from '@/lib/firebase/client'
import { addDoc, collection } from 'firebase/firestore'

export default function ContactPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await addDoc(collection(db, 'contactMessages'), { ...formData, createdAt: new Date().toISOString(), status: 'unread' })
      setSuccess('Message sent successfully!')
      setFormData({ name: '', email: '', subject: '', message: '' })
      setTimeout(() => router.push('/'), 3000)
    } catch (err) {
      setError('Failed to send message')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackButton />
        <h1 className="text-4xl font-bold text-white mb-6">Contact Us</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-xl p-6"><h2 className="text-xl font-semibold text-white mb-4">Get in Touch</h2><div className="space-y-4 text-gray-300"><p>Email: support@enershare.ng</p><p>Phone: +234 123 456 7890</p><p>Hours: Mon-Fri, 9am-6pm WAT</p></div></div>
          <div className="bg-gray-800 rounded-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg"><p className="text-red-500 text-sm">{error}</p></div>}
              {success && <div className="p-3 bg-green-500/10 border border-green-500 rounded-lg"><p className="text-green-500 text-sm">{success}</p></div>}
              <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" required />
              <input type="email" name="email" placeholder="Your Email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" required />
              <input type="text" name="subject" placeholder="Subject" value={formData.subject} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" required />
              <textarea name="message" placeholder="Your Message" rows={4} value={formData.message} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" required />
              <button type="submit" disabled={submitting} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold">{submitting ? 'Sending...' : 'Send Message'}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
