importScripts('/version.js'); // 导入版本号

const CACHE_NAME = `my-cache-v${self.PWA_VERSION}`; // 使用版本号命名缓存
const API_URL = '/api/domain'; // API 接口 URL
const GLOBAL_DATA_CACHE = 'global-data-cache';
let intervalId; // 启动定时器定期检查API接口
let unreadCount = 0; // 未读消息数量
let globalData = {}; // 用于存储全局数据

// 检查数据是否发生变化的函数
const dataHasChanged = (data) => {
    return JSON.stringify(data) !== JSON.stringify(globalData);
};

// 发送通知
const sendNotification = (data) => {
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

// 从 Cache Storage 获取全局数据
const getStoredGlobalData = async () => {
    const cache = await caches.open(GLOBAL_DATA_CACHE);
    const response = await cache.match('globalData');
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
    await cache.put('globalData', new Response(JSON.stringify(data)));
    console.log("Stored global data to cache:", data);
};

// 初始化全局数据并发送到前端
const initializeGlobalData = async () => {
    console.log("初始化全局数据并发送到前端");
    
    try {
        globalData = await getStoredGlobalData() || {};

        if (Object.keys(globalData).length === 0) {
            const response = await fetch(API_URL);
            globalData = await response.json();
            await storeGlobalData(globalData);
        }

        console.log("Initializing global data:", globalData);

        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'GLOBAL_DATA_INITIALIZE',
                data: globalData
            });
        });
    } catch (error) {
        console.error('Error initializing global data:', error);
    }
};

// 定期检查 API 接口数据是否发生变化
const fetchAndCheckData = async () => {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (dataHasChanged(data)) {
            globalData = data; // 更新全局数据
            await storeGlobalData(globalData); // 更新 Cache Storage
            sendNotification(data);
            unreadCount += data.count || 1;
            navigator.setAppBadge(unreadCount).catch((error) => {
                console.error('设置徽章失败:', error);
            });

            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({
                    type: 'GLOBAL_DATA_UPDATE',
                    data: globalData
                });
            });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

// 定期检查更新
const checkForUpdates = async () => {
    importScripts('/version.js'); // 动态导入版本号
    const response = await fetch('/version.js');
    if (self.PWA_VERSION !== '2025.03.02.161654') { // 设定版本号对比逻辑
        self.skipWaiting(); // 跳过等待，立即激活新的 Service Worker
    }
};

// 启动定时器定期检查API接口
const startInterval = () => {
    // intervalId = setInterval(fetchAndCheckData, 5 * 60 * 1000); // 每 5 分钟检查一次
    intervalId = setInterval(fetchAndCheckData, 1000); // 每 5 分钟检查一次
};

// 清除徽章
const clearBadge = async () => {
    try {
        await navigator.clearAppBadge();
    } catch (error) {
        console.error('清除徽章失败:', error);
    }
};

// 处理 push 事件
self.addEventListener('push', (event) => {
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
        unreadCount += data.count || 1;
        navigator.setAppBadge(unreadCount).catch((error) => {
            console.error('设置徽章失败:', error);
        });

        console.log("设置徽章数字", unreadCount);

        event.waitUntil(self.registration.showNotification(data.title, options));
    }
});

// 处理 notificationclick 事件
self.addEventListener('notificationclick', (event) => {
    console.log('Notification click received.', event);
    event.notification.close();

    const { url } = event.notification.data;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let client of windowClients) {
                if (client.url.includes(self.location.origin) && 'navigate' in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );

    clearBadge();
    unreadCount = 0;
});

// 处理 activate 事件
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating.');
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

            await initializeGlobalData(); // 在激活时获取全局数据并设置
            startInterval(); // 启动定时器定期检查API接口
        })()
    );
    // 调试日志，确保事件处理程序已执行
    console.log('activate 事件处理程序已执行');
    // 初始化全局数据并发送到前端
    initializeGlobalData();
});

// 处理 fetch 事件
self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match('/index.html');
            })
        );
    }
});

// 设置定期检查更新的间隔
setInterval(checkForUpdates, 60 * 60 * 1000); // 每小时检查一次
