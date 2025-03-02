import { useEffect, useState } from 'react';

interface Subscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

function useServiceWorker() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    async function registerServiceWorker() {
      try {
        // 注册 Service Worker
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });

        console.log('ServiceWorker 注册成功，作用域为：', registration.scope);

        // 获取推送通知订阅
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
          setSubscription(sub);
        }

        // 处理 Service Worker 状态变化
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('新 Service Worker 已安装。');
                } else {
                  console.log('首次安装 Service Worker。');
                }
              }
            };
          }
        };
      } catch (error) {
        console.error('ServiceWorker 注册失败:', error);
      }
    }

    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  return {subscription, setSubscription};
}

export default useServiceWorker;
