import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { findMatches } from "@/lib/matching/engine";
import type { ProfileData } from "@/lib/matching/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const { profileId } = await params;
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

    // Get the target profile
    const { data: targetProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .single();

    if (profileError || !targetProfile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Get target profile's gender to find opposite gender candidates
    const targetGender = (targetProfile.basic_info as Record<string, unknown>)
      ?.gender;

    // Get all active, verified profiles as potential candidates
    let query = supabase
      .from("profiles")
      .select("*")
      .eq("status", "active")
      .eq("verification_status", "verified")
      .neq("id", profileId);

    // Filter by opposite gender if available
    if (targetGender) {
      const oppositeGender = targetGender === "male" ? "female" : "male";
      query = query.filter(
        "basic_info->>gender",
        "eq",
        oppositeGender
      );
    }

    const { data: candidates } = await query;

    if (!candidates || candidates.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    // Get existing matches to exclude
    const { data: existingMatches } = await supabase
      .from("matches")
      .select("profile_1_id, profile_2_id")
      .or(
        `profile_1_id.eq.${profileId},profile_2_id.eq.${profileId}`
      );

    const matchedProfileIds = new Set(
      (existingMatches || []).flatMap((m) => [m.profile_1_id, m.profile_2_id])
    );
    matchedProfileIds.delete(profileId);

    const eligibleCandidates = candidates.filter(
      (c) => !matchedProfileIds.has(c.id)
    );

    // Run matching engine
    const suggestions = findMatches(
      targetProfile as unknown as ProfileData,
      eligibleCandidates as unknown as ProfileData[],
      undefined,
      10
    );

    // Enrich suggestions with profile data
    const enrichedSuggestions = suggestions.map((suggestion) => {
      const candidateProfile = eligibleCandidates.find(
        (c) => c.id === suggestion.profileId
      );
      const basicInfo =
        (candidateProfile?.basic_info as Record<string, unknown>) || {};
      const eduCareer =
        (candidateProfile?.education_career as Record<string, unknown>) || {};

      return {
        ...suggestion,
        profile: {
          id: candidateProfile?.id,
          name: basicInfo.name || "Unknown",
          age: basicInfo.date_of_birth
            ? new Date().getFullYear() -
              new Date(basicInfo.date_of_birth as string).getFullYear()
            : null,
          gender: basicInfo.gender,
          location: basicInfo.location || "",
          education: eduCareer.education_level || "",
          occupation: eduCareer.occupation || "",
          photo: candidateProfile?.photos?.[0] || "",
          religion: basicInfo.religion || "",
        },
      };
    });

    return NextResponse.json({ suggestions: enrichedSuggestions });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
