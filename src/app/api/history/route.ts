import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getRecentDocuments } from "@/lib/parser/db";

export async function GET() {
  try {
    const { env } = getCloudflareContext();
    const history = await getRecentDocuments(env.DB);
    return NextResponse.json({ success: true, history });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
