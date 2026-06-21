import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function handler(req: NextRequest) {
  const path = req.nextUrl.pathname.replace('/api/auth', '/api/auth');
  const url = `${API_URL}${path}${req.nextUrl.search}`;

  const res = await fetch(url, {
    method: req.method,
    headers: req.headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined,
  });

  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: Object.fromEntries(res.headers.entries()),
  });
}

export { handler as GET, handler as POST };
