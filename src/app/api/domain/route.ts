import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('host');

    if (!host) {
      return NextResponse.json({ error: "Missing host header" }, { status: 400 });
    }

    return new NextResponse(JSON.stringify({ currentDomain: `${protocol}://${host}` }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
