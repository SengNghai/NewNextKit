import { NextResponse } from 'next/server';
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:youremail@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

let subscription: PushSubscription | null = null;

export async function POST(request: Request) {
  const payload = await request.json();
  subscription = payload.subscription;
  // 在生产环境中，你应该将订阅信息存储到数据库
  return NextResponse.json({ success: true });
}
