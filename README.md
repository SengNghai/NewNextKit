This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



5. 清理旧的服务工作线程
手动清理旧的服务工作线程可以确保新的 service worker 正常激活：

打开浏览器的开发者工具（通常按 F12 或 Ctrl+Shift+I）。

进入 Application 选项卡。

在左侧导航栏中找到 Service Workers。

点击 Unregister 按钮，注销旧的服务工作线程。

通过这些步骤，你应该能够在 Next.js15.x 项目中全局处理服务工作线程的问题，并确保它在更新时能够正常工作。如果你遇到任何问题或需要进一步的帮助，请随时告诉我！

# 通过外部连接来打开我的 PWA
是的，你完全可以使用 http://localhost:3000/?source=external 这样的链接来打开你的 PWA 应用。通过在 URL 中添加查询参数 ?source=external，你可以检测这个参数并根据其值执行特定的逻辑。