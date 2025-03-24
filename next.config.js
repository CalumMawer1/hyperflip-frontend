/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  // Add assetPrefix to ensure assets are loaded correctly on Vercel
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : undefined,
  // Ensure favicon and other static assets are properly handled
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig 