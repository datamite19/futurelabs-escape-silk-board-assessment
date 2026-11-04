import { NextResponse } from 'next/server';

const ENGINE_URL = process.env.ENGINE_URL || 'http://127.0.0.1:8080';

export async function GET() {
  try {
    const res = await fetch(`${ENGINE_URL}/engine/state`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch engine state:", error);
    return NextResponse.json({ error: 'Failed to fetch state' }, { status: 500 });
  }
}