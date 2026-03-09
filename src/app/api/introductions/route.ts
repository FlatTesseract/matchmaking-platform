import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
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

    // Get introductions through matches
    const { data: introductions, error } = await supabase
      .from("introductions")
      .select(
        `
        *,
        match:matches!introductions_match_id_fkey(
          id,
          profile_1_id,
          profile_2_id,
          compatibility_score,
          profile_1:profiles!matches_profile_1_id_fkey(id, basic_info, photos),
          profile_2:profiles!matches_profile_2_id_fkey(id, basic_info, photos)
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Filter to only show introductions involving this user's profile and transform
    const userIntroductions = introductions
      .filter((intro) => {
        const match = intro.match;
        return (
          match &&
          (match.profile_1_id === profile.id ||
            match.profile_2_id === profile.id)
        );
      })
      .map((intro) => {
        const match = intro.match;
        const isProfile1 = match.profile_1_id === profile.id;
        const otherProfile = isProfile1 ? match.profile_2 : match.profile_1;
        const otherBasicInfo =
          (otherProfile?.basic_info as Record<string, unknown>) || {};

        return {
          id: intro.id,
          matchId: intro.match_id,
          matchName: otherBasicInfo.name || "Unknown",
          matchPhoto: otherProfile?.photos?.[0] || "",
          status: mapIntroductionStatus(intro.status),
          message: intro.message,
          createdAt: intro.created_at,
          updatedAt: intro.updated_at,
          meetingDetails: intro.outcome,
        };
      });

    return NextResponse.json({ introductions: userIntroductions });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function mapIntroductionStatus(
  dbStatus: string
): "pending" | "accepted" | "meeting_scheduled" | "completed" | "declined" {
  switch (dbStatus) {
    case "pending":
    case "accepted_1":
    case "accepted_2":
      return "pending";
    case "confirmed":
      return "accepted";
    case "contact_shared":
      return "meeting_scheduled";
    case "completed":
      return "completed";
    case "declined":
    case "expired":
      return "declined";
    default:
      return "pending";
  }
}
