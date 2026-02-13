import { NextResponse } from "next/server";
import { getAvailableProviders } from "@/lib/tmdb";

export async function GET() {
  try {
    const providers = await getAvailableProviders();
    return NextResponse.json(providers);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch providers" },
      { status: 500 },
    );
  }
}
