import dynamic from 'next/dynamic'
import BackButton from '@/components/BackButton'

const MarketplaceClient = dynamic(
  () => import('./MarketplaceClient'),
  { ssr: false }
)

export default function MarketplacePage() {
  return <MarketplaceClient />
}
