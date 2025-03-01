// public/sw.js
importScripts('/version.js'); // 导入版本号

const CACHE_NAME = `my-cache-v${self.PWA_VERSION}`; // 使用版本号命名缓存

self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    console.log("data", data);

    const options = {
      body: data.body,
      icon: data.icon || '/icon.png',
      badge: '/badge.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey,
        url: data.url,
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', event => {
  console.log('Notification click received.', event);
  event.notification.close(); // 关闭通知

  if (event) {
    const { url } = event.notification.data; // 从通知数据中获取 URL

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          // 检查 PWA 应用窗口是否已经打开
          if (client.url.includes(self.location.origin) && 'navigate' in client) {
            client.navigate(url); // 在当前 PWA 应用窗口中导航到指定 URL
            return client.focus(); // 将窗口聚焦
          }
        }
        // 如果没有找到匹配窗口，打开新窗口
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

self.addEventListener('install', event => {
  console.log('Service Worker installing.');
  self.skipWaiting(); // 立即激活新的 service worker
});

self.addEventListener('activate', event => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // 删除旧缓存
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
  }
});
