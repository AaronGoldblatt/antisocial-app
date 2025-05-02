import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    experimental: {
        nodeMiddleware: true,
    },
    images: {
        domains: [],
        unoptimized: true,
    },
    // Ensure asset prefix is correctly set for static assets
    assetPrefix: process.env.NODE_ENV === 'production' ? undefined : undefined,
}

export default nextConfig
