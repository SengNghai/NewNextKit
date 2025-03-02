import { useReducer, useEffect, useState } from 'react';

// 定义全局数据的初始状态和类型
interface GlobalData {
    someField: string;
    anotherField: number;
    // 根据实际数据结构添加更多字段
}

interface GlobalDataState {
    data: GlobalData | null;
}

interface Action {
    type: 'SET_GLOBAL_DATA';
    payload: GlobalData;
}

const initialState: GlobalDataState = {
    data: null,
};

const globalDataReducer = (state: GlobalDataState, action: Action): GlobalDataState => {
    switch (action.type) {
        case 'SET_GLOBAL_DATA':
            return { ...state, data: action.payload };
        default:
            return state;
    }
};

// 扩展 ServiceWorkerRegistration 接口以包含 sync 属性
interface SyncServiceWorkerRegistration extends ServiceWorkerRegistration {
    sync: {
        register(tag: string): Promise<void>;
    };
}

const API_URL = '/api/domain'; // API 接口 URL

const useServiceWorker = () => {
    const [state, dispatch] = useReducer(globalDataReducer, initialState);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);

    // 同步数据的函数
    const syncData = async () => {
        try {
            const response = await fetch(API_URL);
            const data: GlobalData = await response.json();
            dispatch({ type: 'SET_GLOBAL_DATA', payload: data });
            console.log('Data synced successfully:', data);
        } catch (error) {
            console.error('Error syncing data:', error);
        }
    };

    useEffect(() => {
        // 注册 Service Worker 并设置消息处理程序
        async function registerServiceWorker() {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/',
                    updateViaCache: 'none',
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

                // 在 Service Worker 注册成功后触发后台同步事件
                const syncRegistration = registration as SyncServiceWorkerRegistration;
                if (syncRegistration.sync) {
                    await syncRegistration.sync.register('sync-data');
                    console.log('Background sync registered successfully');
                    syncData(); // 初始同步数据
                } else {
                    console.warn('Background sync not supported');
                }

                // 设置消息处理程序
                const handleServiceWorkerMessage = (event: MessageEvent) => {
                    if (event.data && (event.data.type === 'GLOBAL_DATA_UPDATE' || event.data.type === 'GLOBAL_DATA_INITIALIZE')) {
                        const globalData: GlobalData = event.data.data;
                        console.log('Received global data:', globalData);
                        dispatch({ type: 'SET_GLOBAL_DATA', payload: globalData });
                    }
                };

                navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

                return () => {
                    navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
                };
            } catch (error) {
                console.error('ServiceWorker 注册失败:', error);
            }
        }

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registerServiceWorker).catch((error: Error) => {
                console.error('ServiceWorker ready 失败:', error.message);
            });
        }
    }, []);


    return { subscription, globalData: state.data, setSubscription };
};

export default useServiceWorker;
