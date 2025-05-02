import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

// ['picsum.photos', 'asset.ayo.co.id', 'cdn.rri.co.id', 'lh3.googleusercontent.com']

export default nextConfig;
