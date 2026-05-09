// app/marketplace/sell/page.tsx
import dynamic from 'next/dynamic'

// Force dynamic rendering at server level
export const dynamic = 'force-dynamic'

// Dynamically import the client component with SSR disabled
const SellEnergyClient = dynamic(
  () => import('./SellEnergyClient'),
  { ssr: false }
)

export default function SellEnergyPage() {
  return <SellEnergyClient />
}