/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Remove static export to enable dynamic routes
  // output: process.env.NETLIFY ? 'export' : undefined,
  trailingSlash: false,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    // Remove unoptimized for server-side rendering
    // unoptimized: process.env.NETLIFY ? true : false,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Disable ESLint during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Environment variables
  env: {
    NETLIFY: process.env.NETLIFY,
  },
}

module.exports = nextConfig