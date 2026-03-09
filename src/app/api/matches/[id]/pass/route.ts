import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { passMatchSchema } from "@/lib/validators";

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
    const parsed = passMatchSchema.safeParse(body);

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

    // Get the match
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("*")
      .eq("id", id)
      .single();

    if (matchError || !match) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      );
    }

    const isProfile1 = match.profile_1_id === profile.id;
    const isProfile2 = match.profile_2_id === profile.id;

    if (!isProfile1 && !isProfile2) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const newStatus = isProfile1 ? "declined_1" : "declined_2";
    const notes = parsed.success
      ? parsed.data.reason
        ? `Declined: ${parsed.data.reason}`
        : undefined
      : undefined;

    const updateData: Record<string, unknown> = { status: newStatus };
    if (notes) {
      updateData.matchmaker_notes = match.matchmaker_notes
        ? `${match.matchmaker_notes}\n${notes}`
        : notes;
    }

    const { data: updatedMatch, error } = await supabase
      .from("matches")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      match: updatedMatch,
      message: "Match passed. Thank you for your feedback.",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
