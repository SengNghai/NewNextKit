import { NextResponse } from 'next/server';
// 用于接收客户端订阅请求并存储订阅信息。
interface IPushSubscription extends PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

let subscription: IPushSubscription | null = null;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    subscription = body as IPushSubscription;

    // 在生产环境中，你需要将 subscription 存储到数据库
    // 例如：await db.subscriptions.create({ data: subscription });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to subscribe' });
  }
}
