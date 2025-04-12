/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  // assetPrefix: process.env.NODE_ENV === 'production' ? undefined : undefined,
  // Ensure favicon and other static assets are properly handled
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig 