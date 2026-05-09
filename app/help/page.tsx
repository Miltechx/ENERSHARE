import dynamic from 'next/dynamic'
import BackButton from '@/components/BackButton'

const HelpClient = dynamic(
  () => import('./HelpClient'),
  { ssr: false }
)

export default function HelpPage() {
  return <HelpClient />
}
