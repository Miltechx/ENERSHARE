import dynamic from 'next/dynamic'
import BackButton from '@/components/BackButton'

const SellEnergyClient = dynamic(
  () => import('./SellEnergyClient'),
  { ssr: false }
)

export default function SellPage() {
  return <SellEnergyClient />
}
