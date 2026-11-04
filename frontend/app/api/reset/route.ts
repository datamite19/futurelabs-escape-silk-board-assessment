import { NextResponse } from 'next/server';

const ENGINE_URL = process.env.ENGINE_URL || 'http://127.0.0.1:8080';

export async function POST() {
  try {
    const res = await fetch(`${ENGINE_URL}/engine/reset`, { method: 'POST' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to reset engine:", error);
    return NextResponse.json({ error: 'Failed to reset' }, { status: 500 });
  }
}