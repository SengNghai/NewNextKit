'use server'
 
import webpush from 'web-push'
 
webpush.setVapidDetails(
  'mailto:youremail@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

interface IPushSubscription extends PushSubscription {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }
 
let subscription: IPushSubscription | null = null
 
export async function subscribeUser(sub: IPushSubscription) {
  subscription = sub
  // In a production environment, you would want to store the subscription in a database
  // For example: await db.subscriptions.create({ data: sub })
  return { success: true }
}
 
export async function unsubscribeUser() {
  subscription = null
  // In a production environment, you would want to remove the subscription from the database
  // For example: await db.subscriptions.delete({ where: { ... } })
  return { success: true }
}
 
export async function sendNotification({message, url}: {message: string, url: string}) {
  console.log('Sending notification:', subscription);
    
  if (!subscription) {
    // throw new Error('No subscription available')
    return { success: false, error: 'No subscription available 请先取消订阅->再重新订阅' }
  }
 
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: 'Test Notification',
        body: message,
        icon: '/icon.png',
        url
      })
    )
    return { success: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}