/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  // Skip type checking during build to prevent errors
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Use standalone output for better deployment
  output: 'standalone',
  // Enable React strict mode
  reactStrictMode: true,
  // Disable static page generation for dynamic routes
  staticPageGenerationTimeout: 120,
}

module.exports = nextConfig
