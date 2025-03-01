import { NextApiRequest, NextApiResponse } from 'next';
import webpush from '~/lib/webpush';

let subscription: IPushSubscription | null = null;

interface IPushSubscription extends PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  const { subscription: sub, message, url } = req.body;

  if (sub) {
    subscription = sub;
    return res.status(200).json({ success: true });
  }

  if (!subscription) {
    return res.status(400).json({ error: 'No subscription available' });
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
    );
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending notification:', error);
    return res.status(500).json({ error: 'Failed to send notification' });
  }
}
