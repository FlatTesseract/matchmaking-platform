import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/create-profile";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has completed profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("status")
          .eq("user_id", user.id)
          .single();

        // If profile is draft or doesn't exist, go to onboarding
        if (!profile || profile.status === "draft") {
          return NextResponse.redirect(`${origin}/create-profile`);
        }
        // Otherwise go to dashboard
        return NextResponse.redirect(`${origin}/dashboard`);
      }
    }
  }

  // If something went wrong, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=verification_failed`);
}
