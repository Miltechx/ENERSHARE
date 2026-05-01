import { createClient } from "@/lib/supabase/server"

export async function logSecurityEvent(event: {
  type: string
  user_id?: string
  ip?: string
  details: any
}) {
  const supabase = createClient()
  
  try {
    await supabase.from("security_logs").insert({
      event_type: event.type,
      user_id: event.user_id,
      ip_address: event.ip,
      details: event.details,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Failed to log security event:", error)
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
