import { NextRequest, NextResponse } from 'next/server';

// 处理 GET 请求
export async function GET(req: NextRequest) {
  return NextResponse.json({ message: 'GET Hello from Next.js!' });
}

// 处理 POST 请求
export async function POST(req: NextRequest) {
  return NextResponse.json({ message: 'POST Hello from Next.js!' });
}
