import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signupSchema } from "@/lib/validators";

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { email, password, name, phone, profileFor } = parsed.data;
    const supabase = await createClient();

    const role = profileFor === "family" ? "family" : "seeker";

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          role,
        },
        emailRedirectTo: `${getBaseUrl(request)}/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Update the auto-created profile with signup details
    // (profile is auto-created by database trigger on auth.users insert)
    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          created_by: profileFor === "family" ? "parent" : "self",
          basic_info: { name, phone },
        })
        .eq("user_id", data.user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
      }
    }

    return NextResponse.json({
      user: data.user,
      message: "Account created successfully",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
