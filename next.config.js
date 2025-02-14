/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Don't fail builds on ESLint errors during development
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
