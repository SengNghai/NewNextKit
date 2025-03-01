importScripts('/version.js'); // 导入版本号

const CACHE_NAME = `my-cache-v${self.PWA_VERSION}`; // 使用版本号命名缓存
const API_URL = '/api/domain'; // API 接口 URL
let intervalId; // 启动定时器定期检查API接口

// 拦截 push 事件
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

// 拦截通知点击事件
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



// 定期检查 API 接口数据是否发生变化
const fetchAndCheckData = async () => {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (dataHasChanged(data)) {
            sendNotification(data);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }

};


// 检查数据是否发生变化的函数
const dataHasChanged = (data) => {
    // 检查数据是否发生变化的逻辑
    // 返回 true 表示数据发生变化
    return true;
};

// 安装 service worker 时触发的事件
self.addEventListener('install', event => {
    console.log('Service Worker installing.');
    self.skipWaiting(); // 立即激活新的 service worker
    console.log("立即激活新的 service worker");

    // 启动定时器定期检查API接口
    intervalId = setInterval(fetchAndCheckData, 5 * 60 * 1000);
    // intervalId = setInterval(fetchAndCheckData, 1000);
});


// 激活 service worker 时触发的事件
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


// 拦截网络请求
self.addEventListener('fetch', event => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match('/index.html');
            })
        );
    }
});

// 发送通知
const sendNotification = (data) => {
    // 检查通知权限
    if (Notification.permission !== 'granted') {
      console.warn('No notification permission granted.');
      return;
    }
    
    console.log("data", data);
    self.registration.showNotification('Data Updated', {
      body: 'New data is available!',
      icon: '/icon.png',
      data: {
        url: 'https://your-website.com'
      }
    });
  };
