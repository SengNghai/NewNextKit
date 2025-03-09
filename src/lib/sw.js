

let CACHE_NAME = ""; // 缓存名称将在接收 APP_VERSION 后设置
let GLOBAL_API = ""; // API URL 将基于 API_DOMAIN 设置
const GLOBAL_DATA_CACHE = "global-data-cache";

let unreadCount = 0; // 未读消息数量
let globalData = {}; // 全局数据初始化为空对象

// 接收来自 StoreProvider.tsx 的消息
self.addEventListener("message", (event) => {
  if (event.data?.type === "INIT_DATA") {
    const { 
      API_DOMAIN,  // 动态接收的 API 域
      APP_VERSION  // 动态接收的应用版本号
     } = event.data.payload;

    // 动态设置全局变量
    CACHE_NAME = `cache-v${APP_VERSION}`;
    GLOBAL_API = API_DOMAIN;

    console.log("Service Worker received INIT_DATA:", {
      CACHE_NAME,
      API_URL,
    });

    // 开始初始化全局数据
    initializeGlobalData();
  }

  if (event.data?.type === "GET_GLOBAL_DATA") {
    event.ports[0].postMessage(globalData);
  }
});

// 检查数据是否发生变化的函数
const dataHasChanged = (data) => {
  return JSON.stringify(data) !== JSON.stringify(globalData);
};

// 发送通知
const sendNotification = (data) => {
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
  return {}; // 默认返回空对象
};

// 将全局数据存储到 Cache Storage
const storeGlobalData = async (data) => {
  const cache = await caches.open(GLOBAL_DATA_CACHE);
  await cache.put("globalData", new Response(JSON.stringify(data)));
  console.log("Stored global data to cache:", data);
};

// 初始化全局数据并发送到前端
const initializeGlobalData = async () => {
  if (!GLOBAL_API || !CACHE_NAME) {
    console.warn("API_DOMAIN or APP_VERSION is not set. Initialization skipped.");
    return;
  }

  try {
    globalData = (await getStoredGlobalData()) || {};

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
  if (!API_URL) {
    console.warn("API_URL is not set. Synchronization skipped.");
    return;
  }

  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    if (dataHasChanged(data)) {
      globalData = data; // 更新全局数据
      await storeGlobalData(globalData);

      // 通知客户端数据更新
      const clients = await self.clients.matchAll();
      clients.forEach((client) =>
        client.postMessage({ type: "GLOBAL_DATA_UPDATE", data: globalData })
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
        })
      );
      await self.clients.claim();
    })()
  );
});

// 处理后台同步事件
self.addEventListener("sync", (event) => {
  console.log(`Sync event triggered: ${event.tag}`);
  if (event.tag === "sync-data") {
    event.waitUntil(syncData());
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

// 在同步或初始化时发送数据到前端
const sendGlobalDataToClients = async (type, data) => {
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type, data });
  });
};
