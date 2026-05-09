import { storage } from '@/lib/firebase/client'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) { setError('Please upload an image file'); return }
  if (file.size > 5 * 1024 * 1024) { setError('Image must be less than 5MB'); return }
  
  setUploading(true)
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