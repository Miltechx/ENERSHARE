import { auth } from './client'

export async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser
  if (!user) return null
  try {
    return await user.getIdToken()
  } catch (error) {
    console.error('Error getting token:', error)
    return null
  }
}

export async function authorizedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken()
  if (!token) {
    throw new Error('No auth token')
  }
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
}