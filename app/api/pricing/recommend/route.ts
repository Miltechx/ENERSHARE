import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const source = searchParams.get("source") || "solar"
  const hour = parseInt(searchParams.get("hour") || new Date().getHours().toString())

  const basePrices: Record<string, number> = {
    solar: 72,
    generator: 185,
    grid: 105,
    battery: 87,
    other: 92,
  }

  let basePrice = basePrices[source] || 85

  let demandFactor = 1.0
  if (hour >= 18 && hour <= 22) demandFactor = 1.4
  else if (hour >= 12 && hour <= 16) demandFactor = 1.2
  else if (hour >= 22 || hour <= 5) demandFactor = 0.7
  else demandFactor = 0.9

  const isDaytime = hour >= 8 && hour <= 17
  let supplyFactor = 1.0
  if (source === "solar") supplyFactor = isDaytime ? 0.7 : 1.3
  else if (source === "grid") supplyFactor = isDaytime ? 0.95 : 1.05
  else if (source === "battery") supplyFactor = isDaytime ? 0.85 : 1.15

  let recommendedPrice = basePrice * demandFactor * supplyFactor

  let minPrice = 50, maxPrice = 200
  if (source === "generator") {
    minPrice = 160
    maxPrice = 350
    recommendedPrice = Math.max(recommendedPrice, 160)
  } else if (source === "solar") {
    minPrice = 50
    maxPrice = 120
  } else if (source === "grid") {
    minPrice = 80
    maxPrice = 150
  } else if (source === "battery") {
    minPrice = 60
    maxPrice = 140
  }

  recommendedPrice = Math.min(maxPrice, Math.max(minPrice, recommendedPrice))

  let demandLevel: "low" | "medium" | "high" = "medium"
  if (demandFactor > 1.2) demandLevel = "high"
  else if (demandFactor < 0.8) demandLevel = "low"

  let supplyLevel: "low" | "medium" | "high" = "medium"
  if (supplyFactor < 0.9) supplyLevel = "high"
  else if (supplyFactor > 1.1) supplyLevel = "low"

  let timeOfDay = "afternoon"
  if (hour >= 6 && hour < 12) timeOfDay = "morning"
  else if (hour >= 12 && hour < 18) timeOfDay = "afternoon"
  else if (hour >= 18 && hour < 22) timeOfDay = "evening"
  else timeOfDay = "night"

  const confidence = source === "solar" ? 0.85 : source === "grid" ? 0.8 : 0.75

  return NextResponse.json({
    recommended_price: Math.round(recommendedPrice),
    min_price: Math.round(recommendedPrice * 0.85),
    max_price: Math.round(recommendedPrice * 1.15),
    confidence,
    factors: { demand: demandLevel, supply: supplyLevel, time_of_day: timeOfDay, source },
    breakdown: { base_price: basePrice, demand_multiplier: demandFactor, supply_multiplier: supplyFactor },
  })
}
