import { execSync } from "child_process";
import type { NextConfig } from "next";
import packageJson from "./package.json";

// 运行生成版本号和加密脚本
if (
  process.env.NODE_ENV === "production" ||
  process.env.NODE_ENV === "development"
) {
  execSync("node generate.cjs");
}



const GLOBAL_API_DOMAIN = process.env.NODE_ENV === "development" ? process.env.API_DOMAIN_DEV : process.env.API_DOMAIN_PRO;
const nextConfig: NextConfig = {
  transpilePackages: ["antd-mobile"],
  reactStrictMode: true,
  crossOrigin: "anonymous",
  experimental: {
    cssChunking: true, 
  },
  sassOptions: {
    implementation: "sass-embedded",
  },
  env: {
    API_DOMAIN: GLOBAL_API_DOMAIN,
    APP_VERSION: packageJson.version,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/_next/static/media/:path*",
        headers: [
          {
            key: "Link",
            value:
              '</_next/static/media/:path*>; rel=preload; as=font; type="font/woff2"; crossorigin="anonymous"',
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
  publicRuntimeConfig: {
    isProd: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
