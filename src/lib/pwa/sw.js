
let CACHE_NAME = ""; // 缓存名称将在接收 APP_VERSION 后设置
let GLOBAL_API = ""; // API URL 将基于 apiDomain 设置
const GLOBAL_DATA_CACHE = "global-data-cache";
const urlsToCache = [
  "/", 
  "/chats", 
  "/counter", 
  "/dashboard", 
  "/domaincheck", 
  "/mobile", 
]; // 关键页面

let unreadCount = 0; // 未读消息数量
let globalData = {}; // 全局数据初始化为空对象

// 接收来自 StoreProvider.tsx 的消息
self.addEventListener("message", (event) => {
  if (event.data?.type === "INIT_DATA") {
    const { API_DOMAIN, APP_VERSION } = event.data.payload;

    // 动态设置全局变量
  
    CACHE_NAME = `cache-v${APP_VERSION}`;
    GLOBAL_API = API_DOMAIN;

    console.log("Service Worker received INIT_DATA:", {
      CACHE_NAME,
      GLOBAL_API,
    });

    // 开始初始化全局数据
    initializeGlobalData();
  }

  // 处理消息事件
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
    console.warn("GLOBAL_API 或 CACHE_NAME 未设置，跳过初始化");
    return;
  }

  try {
    globalData = (await getStoredGlobalData()) || {};

    if (Object.keys(globalData).length === 0) {
      console.log(`Fetching global data from: ${GLOBAL_API}`);

      const response = await fetch(GLOBAL_API);

      // 输出返回的内容以检查是否是 HTML
      const textResponse = await response.text();
      console.log("Raw response text:", textResponse);

      const contentType = response.headers.get("Content-Type");
      console.log("Response Content-Type:", contentType);

      // // 如果响应包含 '<!DOCTYPE', 说明是 HTML 错误页面
      if (!contentType || !contentType.includes("application/json") || textResponse.includes("<!DOCTYPE")) {
        throw new Error(`Unexpected response format: ${contentType} - Raw Response: ${textResponse.slice(0, 100)}`);
      }

      // 解析 JSON
      globalData = JSON.parse(textResponse);

      await storeGlobalData(globalData);
    }

    console.log("初始化全局数据:", globalData);

    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "GLOBAL_DATA_INITIALIZE",
        data: globalData,
      });
    });
  } catch (error) {
    console.error("初始化全局数据时发生错误:", error);
  }
};


// 后台同步逻辑
const syncData = async () => {
  if (!GLOBAL_API) {
    console.warn("GLOBAL_API is not set. Synchronization skipped.");
    return;
  }

  try {
    const response = await fetch(GLOBAL_API);
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


/**
 * 处理安装事件
 * @param event Service Worker 安装事件
 */
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");

  if (!CACHE_NAME) {
    console.warn("CACHE_NAME is not set, skipping cache initialization.");
    return;
  }

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        const validUrls = await Promise.all(
          urlsToCache.map(async (url) => {
            const response = await fetch(url, { method: "HEAD" });
            return response.ok ? url : null;
          })
        );

        await cache.addAll(validUrls.filter((url) => url !== null));
        console.log("Cached initial resources:", validUrls.filter(Boolean));
      } catch (error) {
        console.error("Failed to cache resources:", error);
      }
    })
  );
});


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
      data: { url: data.url || "/" }, // 默认打开首页
    };

    unreadCount += data.count || 1;
    navigator.setAppBadge?.(unreadCount).catch(console.error);

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});


// 监听通知点击事件
self.addEventListener("notificationclick", (event) => {
  event.notification.close(); // 关闭通知

  const url = event.notification.data?.url || "/"; // 获取 URL
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus(); // 如果 PWA 已打开，则聚焦
        }
      }
      return self.clients.openWindow(url); // 否则新开 PWA 内部窗口
    })
  );
});
