import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // 清除内存中的订阅（生产环境需同步删除数据库中的订阅）
    subscription = null;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to unsubscribe' });
  }
}
