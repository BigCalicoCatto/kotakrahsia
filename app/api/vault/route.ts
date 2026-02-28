// app/api/vault/route.ts
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(req: Request) {
  const { id, content } = await req.json();
  // Save message for 24 hours (86400 seconds)
  await redis.set(id, content, { ex: 86400 });
  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "No ID" }, { status: 400 });

  const data = await redis.get(id);
  if (data) {
    await redis.del(id); // SHRED AFTER READING
    return NextResponse.json({ content: data });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
