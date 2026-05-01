// Security monitoring (Supabase removed - simplified version)
export async function logSecurityEvent(event: {
  type: string
  user_id?: string
  ip?: string
  details: any
}) {
  // For now, just log to console
  // In production, you can send to a logging service like Sentry
  console.log(`[SECURITY] ${event.type}:`, {
    user_id: event.user_id,
    ip: event.ip,
    details: event.details,
    timestamp: new Date().toISOString(),
  })
  
  // Optionally send to your own API endpoint
  try {
    await fetch('/api/logs/security', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    })
  } catch (error) {
    // Silently fail
  }
}

export function detectSuspiciousActivity(requests: any[]) {
  const suspiciousPatterns = {
    tooManyFailedLogins: requests.filter(r => r.type === "failed_login").length > 10,
    rapidTransactions: requests.filter(r => r.type === "transaction" && r.time_diff < 1000).length > 5,
    unusualAmounts: requests.some(r => r.amount > 1000000),
  }
  return suspiciousPatterns
}
