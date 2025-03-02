import { execSync } from 'child_process';
import type { NextConfig } from 'next';

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
            value: '</_next/static/media/:path*>; rel=preload; as=font; type="font/woff2"; crossorigin="anonymous"',
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
  webpack: (config, { isServer }) => {
    // 修改 webpack 配置

    // 确保在客户端编译时禁用 `fs` 模块
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
      };
    }

    return config;
  },
  postcssLoaderOptions: {
    postcssOptions: {
      plugins: [
        'postcss-preset-env',
        ['postcss-px-to-viewport', {
          unitToConvert: 'px', // 需要转换的单位，默认为"px"
          viewportWidth: 750, // 设计稿的视口宽度
          unitPrecision: 5, // 单位转换后保留的精度
          propList: ['*'], // 能转化为vw的属性列表
          viewportUnit: 'vw', // 希望使用的视口单位
          fontViewportUnit: 'vw', // 字体使用的视口单位
          selectorBlackList: ['.ignore', '.hairlines'], // 需要忽略的CSS选择器，不会转为视口单位
          minPixelValue: 1, // 设置最小的转换数值
          mediaQuery: false, // 媒体查询里的单位是否需要转换单位
          replace: true, // 是否直接更换属性值，而不添加备用属性
          exclude: undefined, // 忽略某些文件夹下的文件或特定文件
          include: undefined, // 如果设置了include，那将只有匹配到的文件才会被转换
          landscape: false, // 是否添加根据 landscapeWidth 生成的媒体查询条件
          landscapeUnit: 'vw', // 横屏时使用的单位
          landscapeWidth: 1920, // 横屏时使用的视口宽度
        }],
      ],
    },
  },
};

export default nextConfig;
