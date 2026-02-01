/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
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
  // Enable instrumentation for polyfills
  experimental: {
    instrumentationHook: true,
  },
  // Webpack configuration for react-pdf (Node.js compatibility)
  webpack: (config, { isServer }) => {
    // Disable canvas for client-side to avoid issues
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      }
    }
    return config
  },
}

export default nextConfig