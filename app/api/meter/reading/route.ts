import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Mock meter data (replace with real IoT later)
  const hour = new Date().getHours()
  const isDaytime = hour >= 6 && hour <= 18

  return NextResponse.json({
    current_power_watts: isDaytime ? 2000 + Math.random() * 3000 : 0,
    daily_generation_kwh: parseFloat((5 + Math.random() * 10).toFixed(1)),
    daily_consumption_kwh: parseFloat((4 + Math.random() * 8).toFixed(1)),
    battery_level_percent: isDaytime ? 60 + Math.random() * 35 : 20 + Math.random() * 40,
    grid_status: Math.random() > 0.3 ? "connected" : "disconnected",
    carbon_saved_kg: parseFloat((Math.random() * 5).toFixed(1)),
    timestamp: new Date().toISOString()
  })
}
