import { execSync } from 'child_process';
import type { NextConfig } from 'next';
import { Inter } from 'next/font/google';

// 运行生成版本号的脚本
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
  execSync('node generate-version.cjs');
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/_next/static/media/:path*',
        headers: [
          {
            key: 'Link',
            value: `</_next/static/media/:path*>; rel=preload; as=font; type="font/woff2"; crossorigin="anonymous"`,
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
  publicRuntimeConfig: {
    isProd: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
