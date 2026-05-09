// app/wallet/page.tsx
import dynamic from 'next/dynamic'

export const dynamic = 'force-dynamic'

const WalletClient = dynamic(
  () => import('./WalletClient'),
  { ssr: false }
)

export default function WalletPage() {
  return <WalletClient />
}