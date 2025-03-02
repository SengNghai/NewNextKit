import { useEffect, useState } from "react";
import {
  subscribeUser,
  unsubscribeUser,
} from "~/app/actions";
import { urlBase64ToUint8Array } from "~/utils/common";
import io from 'socket.io-client';

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [message, setMessage] = useState<string>("");

  const [notifyEndpoint, setNotifyEndpoint] = useState<string>("");
  const url = `/dashboard`;

  const now = new Date();
  const currentTimestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  const styles = {
    backgroundColor: "blue",
    color: "#ffffff",
    borderRadius: "8px",
    padding: "8px 16px",
  };

  const inputStyles = {
    border: "1px solid black",
    color: "red",
    borderRadius: "8px",
    padding: "8px 16px",
  };

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  // 订阅
  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      ),
    });
    setSubscription(sub);
    const serializedSub = JSON.parse(JSON.stringify(sub));
    await subscribeUser(serializedSub);

    // 使用 WebSocket 订阅
    // const socket = io('http://localhost:3000', {
    //   path: '/api/socket',
    // });

    // socket.on('connect', () => {
    //   console.log('Connected to WebSocket');
    //   socket.emit('subscribe', serializedSub);
    // });

    // socket.on('message', (data) => {
    //   console.log('Message from server:', data);
    // });

    // socket.on('disconnect', () => {
    //   console.log('Disconnected from WebSocket');
    // });
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    setNotifyEndpoint("");
    await unsubscribeUser();
  }

  async function sendTestNotification() {
    if (subscription) {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          message,
          title: `Test Notification ${currentTimestamp}`,
          url,
        }),
      });
      console.log(res);
      setMessage("");
    }
  }

  useEffect(() => {
    if (subscription) {
      setNotifyEndpoint(JSON.stringify({
        subscription,
        message,
        title: `Test Notification ${currentTimestamp}`,
        url,
      }));
    }
  }, [subscription, message, url, currentTimestamp]);

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>;
  }

  return (
    <div>
      <h3 style={{ color: "red" }}>Push Notifications</h3>
      {subscription ? (
        <>
          <p>You are subscribed to push notifications.</p>
          <button
            style={{ ...styles, backgroundColor: "red" }}
            onClick={unsubscribeFromPush}
          >
            Unsubscribe
          </button>
          <input
            style={inputStyles}
            type="text"
            placeholder="Enter notification message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button style={styles} onClick={sendTestNotification}>
            Send Test
          </button>
        </>
      ) : (
        <>
          <p>You are not subscribed to push notifications.</p>
          <button style={styles} onClick={subscribeToPush}>
            Subscribe
          </button>
        </>
      )}

      <div
        style={{
          border: "1px solid green",
          padding: "8px 16px",
          margin: "8px 0",
          borderRadius: "8px",
        }}
      >
        <h1 style={{ color: "green", fontWeight: "bold" }}>当前时间：{currentTimestamp}</h1>
        <h2 style={{ color: "green", fontWeight: "bold" }}>Subscription: </h2>
        <code style={{ color: "red" }}>
          {notifyEndpoint}
        </code>
      </div>
    </div>
  );
}
