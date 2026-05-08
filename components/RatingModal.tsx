'use client'

import { useState } from 'react'
import { db } from '@/lib/firebase/client'
import { collection, addDoc, updateDoc, doc, increment } from 'firebase/firestore'
import { Icons } from './icons'

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  transactionId: string
  sellerId: string
  sellerName: string
  energySource: string
  onSuccess: () => void
}

export default function RatingModal({
  isOpen,
  onClose,
  transactionId,
  sellerId,
  sellerName,
  energySource,
  onSuccess,
}: RatingModalProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await addDoc(collection(db, 'reviews'), {
        transactionId,
        reviewerId: 'currentUserId', // Get from auth
        reviewerName: 'Reviewer Name',
        sellerId,
        sellerName,
        rating,
        comment: comment.slice(0, 280),
        energySource,
        createdAt: new Date().toISOString(),
      })

      // Update seller's average rating
      // This would be done server-side in production
      onSuccess()
      onClose()
    } catch (err) {
      setError('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Rate Your Purchase</h2>
          <button onClick={onClose} className="text-gray-400">
            <Icons.Close className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-400 mb-4">
          How was your experience with <span className="text-white">{sellerName}</span>?
        </p>

        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <Icons.Star
                className={`w-8 h-8 ${
                  (hoverRating || rating) >= star
                    ? 'text-yellow-500 fill-current'
                    : 'text-gray-600'
                }`}
              />
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Comment (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 280))}
            rows={3}
            placeholder="How was the energy quality and seller reliability?"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
          <p className="text-right text-xs text-gray-500 mt-1">{comment.length}/280</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </div>
  )
}