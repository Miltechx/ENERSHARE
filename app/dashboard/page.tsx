import dynamic from 'next/dynamic'
import BackButton from '@/components/BackButton'

const DashboardClient = dynamic(() => import('./DashboardClient'), { ssr: false })

export default function DashboardPage() {
  return <DashboardClient />
}