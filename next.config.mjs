/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  optimizeCss: false,
  experimental: {
    optimizeFonts: false,
    turbotrace: {
      contextDirectory: process.cwd(),
    },
  },
  generateBuildId: async () => {
    return `build-${new Date().getTime()}`
  },
}

export default nextConfig
