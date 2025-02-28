import { useEffect, useState } from "react"
import { sendNotification, subscribeUser, unsubscribeUser } from "~/app/actions"
import { urlBase64ToUint8Array } from "~/utils/common"

export default function PushNotificationManager() {
    const [isSupported, setIsSupported] = useState<boolean>(false)
    const [subscription, setSubscription] = useState<PushSubscription | null>(
      null
    )
    const [message, setMessage] = useState<string>('')
    const styles = {
        backgroundColor: 'blue',
        color: '#ffffff',
        borderRadius: '8px',
        padding: '8px 16px'
      }

      const inputStyles = {
        border: '1px solid black',
        color: 'red',
        borderRadius: '8px',
        padding: '8px 16px'
      }
   
    useEffect(() => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        setIsSupported(true)
        registerServiceWorker()
      }
    }, [])
   
    async function registerServiceWorker() {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
    }
   
    async function subscribeToPush() {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })
      setSubscription(sub)
      const serializedSub = JSON.parse(JSON.stringify(sub))
      await subscribeUser(serializedSub)
    }
   
    async function unsubscribeFromPush() {
      await subscription?.unsubscribe()
      setSubscription(null)
      await unsubscribeUser()
    }
   
    async function sendTestNotification() {
      if (subscription) {
        await sendNotification(message)
        setMessage('')
      }
    }
   
    if (!isSupported) {
      return <p>Push notifications are not supported in this browser.</p>
    }
   
    return (
      <div>
        <h3 style={{color: 'red'}}>Push Notifications</h3>
        {subscription ? (
          <>
            <p>You are subscribed to push notifications.</p>
            <button style={{...styles, backgroundColor: 'red'}} onClick={unsubscribeFromPush}>Unsubscribe</button>
            <input
              style={inputStyles}
              type="text"
              placeholder="Enter notification message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button style={styles} onClick={sendTestNotification}>Send Test</button>
          </>
        ) : (
          <>
            <p>You are not subscribed to push notifications.</p>
            <button style={styles} onClick={subscribeToPush}>Subscribe</button>
          </>
        )}

        <div style={{border: '1px solid green', padding: '8px 16px', margin: '8px 0', borderRadius: '8px'}}>
            <h2 style={{color: 'green', fontWeight: 'bold'}}>Subscription: </h2>
            <code style={{color: 'red'}}>{JSON.stringify(subscription, null, 2)}</code>
        </div>
      </div>
    )
  }