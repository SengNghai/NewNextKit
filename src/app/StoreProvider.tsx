"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "~/lib/features/store";
import { ServiceWorkerClient } from "~/lib/ServiceWorkerClient";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const setup = async () => {
      try {
        // 获取 ServiceWorkerClient 实例
        const swClient = ServiceWorkerClient.getInstance();

        // 注册 Service Worker
        await swClient.register("/sw.js");

        // 触发后台同步
        if ("sync" in ServiceWorkerRegistration.prototype) {
          await swClient.triggerBackgroundSync("sync-data"); // 触发后台同步任务
        } else {
          console.warn("Background Sync is not supported in this browser.");
        }
      } catch (error) {
        console.error("Failed to trigger background sync:", error);
      }
    };

    console.log("===========StoreProvider===========");
    setup();
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
