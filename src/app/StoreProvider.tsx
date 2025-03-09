"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "~/lib/features/store";
import { ServiceWorkerClient } from "~/lib/ServiceWorkerClient";
import { globalDataSlice } from "~/lib/features/slices/globalData";
import packageJson from "../../package.json"; // Adjust path to import package.json

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { updateGlobalData } = globalDataSlice.actions;

  useEffect(() => {
    const setup = async () => {
      try {
        // 获取 ServiceWorkerClient 实例
        const swClient = ServiceWorkerClient.getInstance();

        // 注册 Service Worker
        const registration = await swClient.register("/sw.js");

        // 发送参数到 Service Worker
        const API_DOMAIN = process.env.API_DOMAIN;
        const APP_VERSION = packageJson.version;

        if (registration.active) {
          registration.active.postMessage({
            type: "INIT_DATA",
            payload: { API_DOMAIN, APP_VERSION },
          });
          console.log("Sent data to Service Worker:", { API_DOMAIN, APP_VERSION });
        }

        // 触发后台同步
        if ("sync" in ServiceWorkerRegistration.prototype) {
          await swClient.triggerBackgroundSync("sync-data");
        } else {
          console.warn("Background Sync is not supported in this browser.");
        }
      } catch (error) {
        console.error("Failed to trigger background sync:", error);
      }
    };

    // 监听 Service Worker 发来的消息
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "GLOBAL_DATA_UPDATE") {
        console.log("Received global data from Service Worker:", event.data.data);
        // 更新 Redux Store 中的全局数据
        store.dispatch(updateGlobalData(event.data.data));
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);

    console.log("===========StoreProvider===========");
    setup();

    // 清理监听器
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, [updateGlobalData]);

  return <Provider store={store}>{children}</Provider>;
}
