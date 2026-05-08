'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase/client'
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { Icons } from './icons'

interface FavouriteButtonProps {
  listingId: string
  listingTitle: string
  sellerName: string
  pricePerKwh: number
  energySource: string
}

export default function FavouriteButton({
  listingId,
  listingTitle,
  sellerName,
  pricePerKwh,
  energySource,
}: FavouriteButtonProps) {
  const { user } = useAuth()
  const [isFavourite, setIsFavourite] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const checkFavourite = async () => {
      const favRef = doc(db, 'favourites', `${user.uid}_${listingId}`)
      const favDoc = await getDoc(favRef)
      setIsFavourite(favDoc.exists())
      setLoading(false)
    }
    checkFavourite()
  }, [user, listingId])

  const toggleFavourite = async () => {
    if (!user) return

    const favRef = doc(db, 'favourites', `${user.uid}_${listingId}`)
    
    if (isFavourite) {
      await deleteDoc(favRef)
      setIsFavourite(false)
    } else {
      await setDoc(favRef, {
        userId: user.uid,
        listingId,
        listingTitle,
        sellerName,
        pricePerKwh,
        energySource,
        createdAt: new Date().toISOString(),
      })
      setIsFavourite(true)
    }
  }

  if (loading) {
    return <div className="w-8 h-8" />
  }

  return (
    <button
      onClick={toggleFavourite}
      className="focus:outline-none transition-transform hover:scale-110"
      aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
    >
      <Icons.Star
        className={`w-6 h-6 ${
          isFavourite ? 'text-green-500 fill-current' : 'text-gray-500'
        }`}
      />
    </button>
  )
}