import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { adminDb } from "@/lib/firebase/admin"

// Real meter providers API endpoints
const METER_PROVIDERS = {
  mojec: {
    baseUrl: "https://api.mojec.com/v1",
    apiKeyHeader: "X-API-Key",
  },
  conlog: {
    baseUrl: "https://api.conlog.co.za/v1",
    apiKeyHeader: "Authorization",
  },
  holley: {
    baseUrl: "https://api.holley.com/v1",
    apiKeyHeader: "X-Holley-Key",
  },
}

export async function GET(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get user's meter configuration
    const meterConfigRef = adminDb.collection("meter_configs").doc(session.user.id)
    const meterConfigDoc = await meterConfigRef.get()

    if (!meterConfigDoc.exists) {
      return NextResponse.json({ 
        error: "No meter connected",
        available: false 
      }, { status: 404 })
    }

    const meterConfig = meterConfigDoc.data()
    const provider = meterConfig.provider
    const meterId = meterConfig.meter_id
    const apiKey = process.env[`${provider.toUpperCase()}_API_KEY`]

    if (!apiKey) {
      console.error(`No API key for provider: ${provider}`)
      return NextResponse.json({ 
        error: "Meter provider not configured",
        available: false 
      }, { status: 500 })
    }

    // Fetch real meter data from provider
    const providerConfig = METER_PROVIDERS[provider as keyof typeof METER_PROVIDERS]
    const response = await fetch(
      `${providerConfig.baseUrl}/meters/${meterId}/reading`,
      {
        headers: {
          [providerConfig.apiKeyHeader]: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      throw new Error(`Meter API error: ${response.status}`)
    }

    const meterData = await response.json()

    // Store reading in database
    await adminDb.collection("meter_readings").add({
      user_id: session.user.id,
      meter_id: meterId,
      provider: provider,
      current_power_watts: meterData.power || meterData.current_power || 0,
      daily_generation_kwh: meterData.generation || meterData.daily_generation || 0,
      daily_consumption_kwh: meterData.consumption || meterData.daily_consumption || 0,
      battery_level_percent: meterData.battery || 0,
      grid_status: meterData.grid_status || "unknown",
      timestamp: new Date().toISOString(),
    })

    const surplus = Math.max(0, (meterData.generation || 0) - (meterData.consumption || 0))

    return NextResponse.json({
      success: true,
      reading: {
        current_power_watts: meterData.power || 0,
        daily_generation_kwh: meterData.generation || 0,
        daily_consumption_kwh: meterData.consumption || 0,
        battery_level_percent: meterData.battery || 0,
        grid_status: meterData.grid_status || "connected",
      },
      surplus_kwh: surplus,
      can_sell: surplus > 0,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Smart meter error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch meter data",
      available: false 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { meter_id, provider } = body

  if (!meter_id || !provider) {
    return NextResponse.json({ error: "Meter ID and provider required" }, { status: 400 })
  }

  // Validate provider
  if (!METER_PROVIDERS[provider as keyof typeof METER_PROVIDERS]) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 })
  }

  try {
    // Store meter configuration
    await adminDb.collection("meter_configs").doc(session.user.id).set({
      user_id: session.user.id,
      meter_id: meter_id,
      provider: provider,
      connected_at: new Date().toISOString(),
      status: "active",
    })

    return NextResponse.json({
      success: true,
      message: `Meter connected successfully`,
    })
  } catch (error) {
    console.error("Meter connection error:", error)
    return NextResponse.json({ error: "Failed to connect meter" }, { status: 500 })
  }
}
