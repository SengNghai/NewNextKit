import { type GlobalDataState } from "~/lib/features/slices/globalData";

export class ServiceWorkerClient {
  private static instance: ServiceWorkerClient;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {}

  static getInstance(): ServiceWorkerClient {
    if (!this.instance) {
      this.instance = new ServiceWorkerClient();
    }
    return this.instance;
  }

  // 注册 Service Worker
  async register(
    serviceWorkerPath: string,
  ): Promise<ServiceWorkerRegistration> {
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service Worker is not supported in this browser.");
    }

    this.registration =
      await navigator.serviceWorker.register(serviceWorkerPath);
    console.log("Service Worker registered:", this.registration);
    return this.registration;
  }

  // 请求全局数据
  async requestGlobalData(): Promise<GlobalDataState> {
    return new Promise((resolve, reject) => {
      if (!this.registration?.active) {
        return reject(new Error("Service Worker is not active."));
      }

      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event: MessageEvent) => {
        if (event.data?.type === "SYNC_DATA_RESPONSE" && event.data?.data) {
          resolve(event.data.data as GlobalDataState);
        } else {
          reject(new Error("Unexpected response from Service Worker."));
        }
      };

      // 发送数据请求
      this.registration.active.postMessage({ type: "SYNC_DATA_REQUEST" }, [
        messageChannel.port2,
      ]);
    });
  }

  // 触发后台同步任务
  async triggerBackgroundSync(tag: string): Promise<void> {
    if (!this.registration) {
      throw new Error("Service Worker is not registered.");
    }

    // 检查 sync 是否存在并强制类型限制
    if (!("sync" in this.registration)) {
      throw new Error("Background Sync is not supported in this browser.");
    }

    const syncRegistration = this.registration.sync as {
      register(tag: string): Promise<void>;
    };

    try {
      await syncRegistration.register(tag); // 注册后台同步任务
      console.log(`Background sync with tag '${tag}' has been triggered.`);
    } catch (error) {
      console.error("Failed to register background sync:", error);
      throw error;
    }
  }
}
