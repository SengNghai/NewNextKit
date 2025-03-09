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
        // 检查 Service Worker 支持情况
        if (!("serviceWorker" in navigator)) {
          console.warn("Service Worker is not supported in this browser.");
          return;
        }

        // 获取 ServiceWorkerClient 实例
        const swClient = ServiceWorkerClient.getInstance();

        // 注册 Service Worker
        const registration = await swClient.register("/sw.js");

        // 发送参数到 Service Worker
        const API_DOMAIN = process.env.API_DOMAIN;
        const APP_VERSION = packageJson.version;

        if (registration.active) {
          console.log("Sending INIT_DATA to Service Worker...");
          registration.active.postMessage({
            type: "INIT_DATA",
            payload: { API_DOMAIN, APP_VERSION },
          });
        } else {
          console.warn("Service Worker is not active yet.");
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

    // 监听来自 Service Worker 的消息
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "GLOBAL_DATA_UPDATE") {
        console.log("Received global data from Service Worker:", event.data.data);
        // 更新 Redux Store 中的全局数据
        store.dispatch(updateGlobalData(event.data.data));
      }
    };

    // 确保 Service Worker 注册成功后再添加监听器
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleMessage);
    } else {
      console.warn("Service Worker is not available.");
    }

    console.log("===========StoreProvider===========");
    setup();

    // 清理监听器
    return () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", handleMessage);
      }
    };
  }, [updateGlobalData]);

  return <Provider store={store}>{children}</Provider>;
}
