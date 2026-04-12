import type { User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabaseTypes";
import { resolveMapsHotelFromUrl } from "@/lib/mapsResolveMapsHotel";

function createSupabaseAuthClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

function isAdminUser(user: User): boolean {
  const meta = user.user_metadata as { role?: string } | undefined;
  const appMeta = user.app_metadata as { role?: string } | undefined;
  const role = meta?.role ?? appMeta?.role;
  return role === "admin";
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 },
      );
    }

    const token = authHeader.slice(7);
    const supabase = createSupabaseAuthClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user || !isAdminUser(user)) {
      return NextResponse.json(
        { error: "Unauthorized — admin sign-in required" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { url?: string };
    const url = typeof body.url === "string" ? body.url.trim() : "";
    if (!url) {
      return NextResponse.json({ error: "Missing url in body" }, { status: 400 });
    }

    const placesApiKey =
      process.env.GOOGLE_PLACES_API_KEY ?? process.env.GOOGLE_MAPS_API_KEY;

    const result = await resolveMapsHotelFromUrl({
      inputUrl: url,
      placesApiKey,
    });

    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    console.error("resolve-maps-hotel:", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
