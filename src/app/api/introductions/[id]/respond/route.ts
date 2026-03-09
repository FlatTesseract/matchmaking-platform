import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { respondIntroductionSchema } from "@/lib/validators";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = respondIntroductionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Get the introduction with match
    const { data: intro, error: introError } = await supabase
      .from("introductions")
      .select(
        `
        *,
        match:matches!introductions_match_id_fkey(
          profile_1_id, profile_2_id
        )
      `
      )
      .eq("id", id)
      .single();

    if (introError || !intro) {
      return NextResponse.json(
        { error: "Introduction not found" },
        { status: 404 }
      );
    }

    const isProfile1 = intro.match.profile_1_id === profile.id;
    const isProfile2 = intro.match.profile_2_id === profile.id;

    if (!isProfile1 && !isProfile2) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { action, preferred_contact, feedback } = parsed.data;

    if (action === "decline") {
      const { error } = await supabase
        .from("introductions")
        .update({
          status: "declined",
          outcome: feedback ? { declined_reason: feedback } : undefined,
        })
        .eq("id", id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ message: "Introduction declined" });
    }

    // Accept
    const updateData: Record<string, unknown> = {};

    if (isProfile1) {
      updateData.preferred_contact_1 = preferred_contact || {};
      if (intro.status === "accepted_2") {
        updateData.status = "confirmed";
      } else {
        updateData.status = "accepted_1";
      }
    } else {
      updateData.preferred_contact_2 = preferred_contact || {};
      if (intro.status === "accepted_1") {
        updateData.status = "confirmed";
      } else {
        updateData.status = "accepted_2";
      }
    }

    const { data: updatedIntro, error } = await supabase
      .from("introductions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      introduction: updatedIntro,
      message:
        updatedIntro.status === "confirmed"
          ? "Both parties have accepted! Contact details will be shared soon."
          : "Response recorded. Waiting for the other party.",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
