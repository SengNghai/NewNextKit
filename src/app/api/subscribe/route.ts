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

export async function POST(request: Request) {
  const payload: { subscription: IPushSubscription; title: string; message: string; url: string } = await request.json();
  console.log('subscription', payload);

  try {
    await webpush.sendNotification(
      payload.subscription,
      JSON.stringify({
        title: payload.title,
        body: payload.message,
        icon: '/icon.png',
        url: payload.url
      })
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending push notification:', error);
    return NextResponse.json({ success: false, error: 'Failed to send notification' });
  }
}
