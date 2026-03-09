import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    // Determine new status
    let newStatus: string;
    if (isProfile1) {
      newStatus =
        match.status === "interested_2" ? "mutual" : "interested_1";
    } else {
      newStatus =
        match.status === "interested_1" ? "mutual" : "interested_2";
    }

    const { data: updatedMatch, error } = await supabase
      .from("matches")
      .update({ status: newStatus })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      match: updatedMatch,
      mutual: newStatus === "mutual",
      message:
        newStatus === "mutual"
          ? "Mutual interest! The matchmaker will facilitate an introduction."
          : "Interest expressed. Waiting for the other party.",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
