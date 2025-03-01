import { NextRequest, NextResponse } from "next/server";
import webpush from "~/lib/webpush";

let subscription: IPushSubscription | null = null;

interface IPushSubscription extends PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function POST(req: NextRequest) {
  const { subscription: sub, message, url } = await req.json();

  if (sub) {
    subscription = sub;
    return NextResponse.json({ success: true });
  }

  if (!subscription) {
    return NextResponse.json(
      { error: "No subscription available" },
      { status: 400 },
    );
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: "Test Notification",
        body: message,
        icon: "/icon.png",
        url,
      }),
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 },
    );
  }
}
