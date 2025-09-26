/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Netlify deployment optimization
  output: process.env.NETLIFY ? 'export' : undefined,
  trailingSlash: process.env.NETLIFY ? true : false,
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
    // Netlify image optimization
    unoptimized: process.env.NETLIFY ? true : false,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Environment variables
  env: {
    NETLIFY: process.env.NETLIFY,
  },
}

module.exports = nextConfig