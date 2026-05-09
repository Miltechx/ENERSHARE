// app/marketplace/page.tsx
import dynamic from 'next/dynamic'

export const dynamic = 'force-dynamic'

const MarketplaceClient = dynamic(
  () => import('./MarketplaceClient'),
  { ssr: false }
)

export default function MarketplacePage() {
  return <MarketplaceClient />
}