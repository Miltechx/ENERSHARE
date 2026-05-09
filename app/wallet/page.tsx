import dynamic from 'next/dynamic'
import BackButton from '@/components/BackButton'

const WalletClient = dynamic(
  () => import('./WalletClient'),
  { ssr: false }
)

export default function WalletPage() {
  return <WalletClient />
}
