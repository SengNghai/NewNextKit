import { NextResponse } from 'next/server';
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:youremail@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

interface IPushSubscription extends PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// 存储无效的订阅信息（仅在内存中）
let invalidSubscriptions: IPushSubscription[] = [];

export async function POST(request: Request) {
  const payload = await request.json();
  console.log('subscription', payload);

  try {
    await webpush.sendNotification(
      payload.subscription,
      JSON.stringify({
        title: 'Test Notification',
        body: payload.message,
        icon: '/icon.png',
        url: payload.url
      })
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending push notification:', error);

    if (error.statusCode === 410) {
      // 处理订阅已取消或过期的情况
      console.error('Push subscription has unsubscribed or expired.');
      // 存储无效的订阅信息
      invalidSubscriptions.push(payload.subscription);
      console.log('Invalid subscriptions:', invalidSubscriptions);
    }

    return NextResponse.json({ success: false, error: 'Failed to send notification' });
  }
}
