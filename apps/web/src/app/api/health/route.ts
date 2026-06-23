import { NextResponse } from 'next/server';

/** Trivial health endpoint — confirms route handlers build & run. */
export function GET() {
  return NextResponse.json({ ok: true, app: 'web' });
}
