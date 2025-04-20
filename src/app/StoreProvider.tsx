"use client";

import { useCallback, useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "~/lib/features/store";
import { ServiceWorkerClient } from "~/lib/pwa/ServiceWorkerClient";
import { globalDataSlice } from "~/lib/features/slices/globalData";
import packageJson from "../../package.json"; // Adjust path to import package.json
import { debounce } from "lodash";
import { setRemBase as rawSetRemBase } from "~/lib/utils/common";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { updateGlobalData } = globalDataSlice.actions;

/**
 * 设置 rem 基础值
 */
const setRemBase = useCallback(() => {
  rawSetRemBase();
}, []);

  /**
   * 初始化 rem 适配
   */
  useEffect(() => {
    // ✅ 确保 `window` 可用 (防止 SSR 运行)
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      import("eruda").then((eruda) => eruda.default.init()); // ✅ 仅在客户端动态加载 `eruda`
    }

    // ✅ 初始化 rem 适配
    setRemBase();

    // ✅ 使用 debounce 优化 resize 触发 ✅ 监听 `resize` 和 `orientationchange` 确保适配
    const handleResize = debounce(setRemBase, 100);

    window.addEventListener("resize", () => {
      requestAnimationFrame(setRemBase); // ✅ 替代 `setTimeout`，确保无延迟优化
    });
    window.addEventListener("orientationchange", () => {
      requestAnimationFrame(setRemBase); // ✅ 替代 `setTimeout`，确保无延迟优化
    });
    // **页面加载时初始化**
    document.addEventListener("DOMContentLoaded", () => {
      requestAnimationFrame(setRemBase); // ✅ 替代 `setTimeout`，确保无延迟优化
    });

    return () => {
      window.removeEventListener("resize", () => {
        requestAnimationFrame(setRemBase); // ✅ 替代 `setTimeout`，确保无延迟优化
      });
      window.removeEventListener("orientationchange", () => {
        requestAnimationFrame(setRemBase); // ✅ 替代 `setTimeout`，确保无延迟优化
      });
    };
  }, [setRemBase]);

  /**
   * 初始化 Service Worker
   */
  useEffect(() => {
    const setup = async () => {
      try {
        // 获取 ServiceWorkerClient 实例
        const swClient = ServiceWorkerClient.getInstance();

        // 注册 Service Worker
        const registration = await swClient.register("/sw.js");

        // 发送参数到 Service Worker
        const API_DOMAIN = process.env.API_DOMAIN_DEV;
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

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}
