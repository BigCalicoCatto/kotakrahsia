import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const { id, content } = await req.json();
    await redis.set(id, content, { ex: 86400 }); // 24 hour expiry
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  const data = await redis.get(id);
  if (data) {
    await redis.del(id); // DELETE IMMEDIATELY
    return NextResponse.json({ content: data });
  }
  return NextResponse.json({ error: "Empty or Expired" }, { status: 404 });
}
