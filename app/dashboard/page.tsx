// app/dashboard/page.tsx
import dynamic from 'next/dynamic'

export const dynamic = 'force-dynamic'

const DashboardClient = dynamic(
  () => import('./DashboardClient'),
  { ssr: false }
)

export default function DashboardPage() {
  return <DashboardClient />
}