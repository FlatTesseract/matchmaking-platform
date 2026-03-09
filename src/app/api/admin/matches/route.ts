import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createMatchSchema } from "@/lib/validators";
import { calculateCompatibility } from "@/lib/matching/engine";
import type { ProfileData } from "@/lib/matching/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createMatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { profile_1_id, profile_2_id, matchmaker_notes } = parsed.data;

    // Fetch both profiles for compatibility calculation
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", [profile_1_id, profile_2_id]);

    if (!profiles || profiles.length !== 2) {
      return NextResponse.json(
        { error: "One or both profiles not found" },
        { status: 404 }
      );
    }

    const p1 = profiles.find((p) => p.id === profile_1_id) as unknown as ProfileData;
    const p2 = profiles.find((p) => p.id === profile_2_id) as unknown as ProfileData;

    const compatibility = calculateCompatibility(p1, p2);

    const { data: match, error } = await supabase
      .from("matches")
      .insert({
        profile_1_id,
        profile_2_id,
        compatibility_score: compatibility?.compatibilityScore || 0,
        compatibility_breakdown: compatibility
          ? {
              ...compatibility.breakdown,
              why_matched: compatibility.whyMatched,
            }
          : {},
        status: "approved",
        matchmaker_notes,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ match });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
