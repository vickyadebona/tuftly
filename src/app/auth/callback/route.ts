import { NextResponse, type NextRequest } from "next/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import { getSupabaseServer } from "@/lib/supabase/server";

/** Record why a sign-in failed (it shows in the server logs). The reason can come from the address bar, so keep it short and on one line. */
function failed(origin: string, reason: string) {
  console.warn("Sign-in failed:", reason.replace(/\s+/g, " ").slice(0, 300));
  return NextResponse.redirect(`${origin}/login?error=link`);
}

/** Where Google and the emailed sign-in link land. Trades the one-time code for a session, then goes home. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  // Only allow same-site paths so the link can't be used to bounce someone elsewhere.
  const next = searchParams.get("next");
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/home";

  if (!supabaseConfigured) return failed(origin, "Supabase is not configured");
  if (!code) return failed(origin, searchParams.get("error_description") ?? searchParams.get("error") ?? "no code");
  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return failed(origin, error.message);
  return NextResponse.redirect(`${origin}${safeNext}`);
}
