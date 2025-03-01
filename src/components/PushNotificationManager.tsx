import { useEffect, useState } from "react";
import {
  // sendNotification,
  subscribeUser,
  unsubscribeUser,
} from "~/app/actions";
import { urlBase64ToUint8Array } from "~/utils/common";

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [message, setMessage] = useState<string>("");

  const [notifyEndpoint, setNotifyEndpoint] = useState<string>("");
  const url = `/dashboard`;


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

    // 使用 API 订阅
    /*
    const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serializedSub),
    });
    const data = await res.json();
    console.log(data);
    */
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    setNotifyEndpoint("");
    await unsubscribeUser();
    // 使用 API 取消订阅
    /*
    const serializedSub = JSON.parse(JSON.stringify(subscription))
    const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: serializedSub.endpoint }),
    });
    const data = await res.json();
    console.log(data);
    */
  }

  async function sendTestNotification() {
    if (subscription) {
      // 第一种方式是直接调用
      /*
      const result = await sendNotification({ message, url });
      if (!result.success) {
        alert(result.error);
      }
      */


      /**
       * 第二种方式： 使用 API 发送通知
       * 传递 subscription、message 和 url
       */
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          message,
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
        url,
      }));
    }
  }, [subscription]);

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
        <h2 style={{ color: "green", fontWeight: "bold" }}>Subscription: </h2>
        <code style={{ color: "red" }}>
          {notifyEndpoint}
        </code>
      </div>
    </div>
  );
}
