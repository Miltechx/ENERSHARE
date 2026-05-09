import dynamic from 'next/dynamic'

const SellEnergyClient = dynamic(
  () => import('./SellEnergyClient'),
  { ssr: false }
)

export default function SellPage() {
  return <SellEnergyClient />
}
