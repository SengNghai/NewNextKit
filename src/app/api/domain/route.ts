import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { version } from 'os';

export async function GET(request: NextRequest) {
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host');
  const currentDomain = `${protocol}://${host}`;

  return NextResponse.json({ currentDomain, api: process.env.API_DOMAIN, version: process.env.APP_VERSION });
}
