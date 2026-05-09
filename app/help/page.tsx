# Create wrapper files
echo "import dynamic from 'next/dynamic'\n\nexport const dynamic = 'force-dynamic'\n\nconst Client = dynamic(() => import('./Client'), { ssr: false })\n\nexport default function Page() { return <Client /> }" > app/marketplace/page.tsx

echo "import dynamic from 'next/dynamic'\n\nexport const dynamic = 'force-dynamic'\n\nconst Client = dynamic(() => import('./Client'), { ssr: false })\n\nexport default function Page() { return <Client /> }" > app/dashboard/page.tsx

echo "import dynamic from 'next/dynamic'\n\nexport const dynamic = 'force-dynamic'\n\nconst Client = dynamic(() => import('./Client'), { ssr: false })\n\nexport default function Page() { return <Client /> }" > app/wallet/page.tsx

echo "import dynamic from 'next/dynamic'\n\nexport const dynamic = 'force-dynamic'\n\nconst Client = dynamic(() => import('./Client'), { ssr: false })\n\nexport default function Page() { return <Client /> }" > app/help/page.tsx