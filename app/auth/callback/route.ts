import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth/callback] exchangeCodeForSession failed:", {
      message: error.message,
      status: error.status,
      name: error.name,
    });
    const reason = encodeURIComponent(error.message);
    return NextResponse.redirect(`${origin}/?auth_error=1&reason=${reason}`);
  }

  return NextResponse.redirect(`${origin}/?auth_error=1&reason=missing_code`);
}
