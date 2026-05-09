'use client'

import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    setMessage('Page loaded!')
    console.log('Dashboard mounted')
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111827', padding: '2rem' }}>
      <h1 style={{ color: 'white', fontSize: '2rem', marginBottom: '1rem' }}>Dashboard Test</h1>
      <p style={{ color: '#9CA3AF', marginBottom: '1rem' }}>Status: {message}</p>
      <div style={{ backgroundColor: '#1F2937', padding: '1rem', borderRadius: '0.5rem' }}>
        <p style={{ color: '#10B981' }}>✅ If you see this, the dashboard page is rendering.</p>
        <p style={{ color: '#9CA3AF', marginTop: '0.5rem' }}>This is a test version with no dependencies.</p>
      </div>
      <a 
        href="/auth/signin" 
        style={{ display: 'inline-block', marginTop: '1rem', backgroundColor: '#10B981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', textDecoration: 'none' }}
      >
        Go to Sign In
      </a>
    </div>
  )
}