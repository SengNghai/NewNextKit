importScripts("/version.js"); // 导入版本号

const CACHE_NAME = `my-cache-v${self.PWA_VERSION}`; // 使用版本号命名缓存
const API_URL = "/api/domain"; // API 接口 URL
const GLOBAL_DATA_CACHE = "global-data-cache";
let unreadCount = 0; // 未读消息数量
let globalData = { currentDomain: "http://localhost:3000", anotherField: 123 }; // 用于存储全局数据

// 检查数据是否发生变化的函数
const dataHasChanged = (data) => {
  return JSON.stringify(data) !== JSON.stringify(globalData);
};

// 发送通知
const sendNotification = (data) => {
  console.table("sendNotification:", data);
  if (Notification.permission === "granted") {
    self.registration.showNotification("Data Updated", {
      body: "New data is available!",
      icon: "/icon.png",
      data: { url: "https://your-website.com" },
    });
  } else {
    console.warn("No notification permission granted.");
  }
};

// 从 Cache Storage 获取全局数据
const getStoredGlobalData = async () => {
  const cache = await caches.open(GLOBAL_DATA_CACHE);
  const response = await cache.match("globalData");
  if (response) {
    const data = await response.json();
    console.log("Retrieved global data from cache:", data);
    return data;
  }
  return null;
};

// 将全局数据存储到 Cache Storage
const storeGlobalData = async (data) => {
  const cache = await caches.open(GLOBAL_DATA_CACHE);
  await cache.put("globalData", new Response(JSON.stringify(data)));
  console.log("Stored global data to cache:", data);
};

// 初始化全局数据并发送到前端
const initializeGlobalData = async () => {
  try {
    globalData = (await getStoredGlobalData()) || globalData;

    if (Object.keys(globalData).length === 0) {
      const response = await fetch(API_URL);
      globalData = await response.json();
      await storeGlobalData(globalData);
    }

    console.log("Initialized global data:", globalData);

    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "GLOBAL_DATA_INITIALIZE",
        data: globalData,
      });
    });
  } catch (error) {
    console.error("Error initializing global data:", error);
  }
};

// 后台同步逻辑
const syncData = async () => {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    if (dataHasChanged(data)) {
      globalData = data; // 更新全局数据
      await storeGlobalData(globalData);

      // 通知客户端数据更新
      const clients = await self.clients.matchAll();
      clients.forEach((client) =>
        client.postMessage({ type: "GLOBAL_DATA_UPDATE", data: globalData }),
      );

      // 发送通知
      sendNotification(data);
      unreadCount += data.count || 1;
      navigator.setAppBadge?.(unreadCount).catch(console.error);
    }
  } catch (error) {
    console.error("Error syncing data:", error);
  }
};

// 处理 activate 事件
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      );
      await self.clients.claim();
      await initializeGlobalData(); // 初始化全局数据
    })(),
  );
});

// 处理后台同步事件
self.addEventListener("sync", (event) => {
  console.log(`Sync event triggered: ${event.tag}`);
  if (event.tag === "sync-data") {
    event.waitUntil(syncData()); // 后台同步
  }
});

// 处理消息事件
self.addEventListener("message", (event) => {
  if (event.data?.type === "GET_GLOBAL_DATA") {
    event.ports[0].postMessage(globalData);
  }
});

// 处理 push 事件
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    console.log("Push event data:", data);

    const options = {
      body: data.body,
      icon: data.icon || "/icon.png",
      badge: "/badge.png",
      vibrate: [100, 50, 100],
      data: { url: data.url || "https://your-website.com" },
    };

    unreadCount += data.count || 1;
    navigator.setAppBadge?.(unreadCount).catch(console.error);

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// 处理 notificationclick 事件
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const { url } = event.notification.data;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (let client of windowClients) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }),
  );

  unreadCount = 0;
  navigator.clearAppBadge?.().catch(console.error);
});
