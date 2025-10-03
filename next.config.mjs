/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Optimize for Core Web Vitals
  compress: true,
  poweredByHeader: false,
  // Enable modern optimizations
  reactStrictMode: true,
  swcMinify: true,
  // Optimize fonts
  optimizeFonts: true,
}

export default nextConfig