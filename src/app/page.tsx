"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import InstallPrompt from "../components/InstallPrompt";
import PushNotificationManager from "../components/PushNotificationManager";
import ClientCurrentDomain from "~/components/ClientCurrentDomain";
import NetworkedStatus from "~/components/NetworkedStatus";
import APIResponseTime from "~/components/APIResponseTime";
import { PWA_VERSION } from '~/utils/version';
import { useCurrentDomain } from "~/hooks/useCurrentDomain";
import useServiceWorkerData from "~/hooks/useServiceWorkerData";


export default function Home() {
  const [message, setMessage] = useState("");
  const currentDomain = useCurrentDomain();
  const globalData = useServiceWorkerData();

  useEffect(() => {
    // 解析 URL 的查询参数
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get("source");

    if (source === "external") {
      console.log("PWA opened from external link");
      // 处理外部链接
      // 确保在处理外部链接时正确引导用户

      // 设置欢迎消息
      setMessage("欢迎从外部链接打开我们的 PWA 应用！");
      // 这里可以添加统计逻辑，例如发送请求到统计服务器
      // fetch('https://your-analytics-server.com/track', { method: 'POST', body: JSON.stringify({ event: 'external_open' }) });
    }
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert image-logo"
          src={`${currentDomain}/next.svg`}
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        {/* 显示欢迎消息 */}
        <p>{message}</p>
        <p>当前的版本号：{PWA_VERSION}</p>
        {/* 当前的域名 */}
        <ClientCurrentDomain />
        {/* 当前的网络状态 */}
        < NetworkedStatus />
        {/* API 请求时间 */}
        < APIResponseTime />
        {/* API 请求时间 */}
        <div>
          <h1>Global Data</h1>
          {globalData ? (
            <pre>{JSON.stringify(globalData, null, 2)}</pre>
          ) : (
            <p>Loading data...</p>
          )}
        </div>
        {/* 其它 */}
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              src/app/page.tsx
            </code>
            .
          </li>
          <li style={{ fontSize: 14, color: 'green' }} className="other">Save and see your changes instantly.</li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert image-logomark"
              src={`${currentDomain}/vercel.svg`}
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <InstallPrompt />
          <PushNotificationManager />
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src={`${currentDomain}/file.svg`}
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src={`${currentDomain}/window.svg`}
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src={`${currentDomain}/globe.svg`}
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
