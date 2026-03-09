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

    // Get user's profile
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

    // Get matches where this profile is involved and status is visible to user
    const { data: matches, error } = await supabase
      .from("matches")
      .select(
        `
        *,
        profile_1:profiles!matches_profile_1_id_fkey(
          id, user_id, basic_info, education_career, family_background,
          values_beliefs, lifestyle, personality, partner_preferences,
          photos, status, verification_status
        ),
        profile_2:profiles!matches_profile_2_id_fkey(
          id, user_id, basic_info, education_career, family_background,
          values_beliefs, lifestyle, personality, partner_preferences,
          photos, status, verification_status
        )
      `
      )
      .or(`profile_1_id.eq.${profile.id},profile_2_id.eq.${profile.id}`)
      .not("status", "in", '("suggested","approved")')
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Transform matches to show the "other" profile
    const transformedMatches = matches.map((match) => {
      const isProfile1 = match.profile_1_id === profile.id;
      const otherProfile = isProfile1 ? match.profile_2 : match.profile_1;
      const basicInfo = (otherProfile?.basic_info as Record<string, unknown>) || {};

      return {
        id: match.id,
        profile: {
          id: otherProfile?.id,
          name: basicInfo.name,
          age: basicInfo.date_of_birth
            ? new Date().getFullYear() -
              new Date(basicInfo.date_of_birth as string).getFullYear()
            : null,
          location: basicInfo.location,
          occupation: (otherProfile?.education_career as Record<string, unknown>)
            ?.occupation,
          education: (otherProfile?.education_career as Record<string, unknown>)
            ?.education_level,
          headline: basicInfo.headline || "",
          about: (otherProfile?.personality as Record<string, unknown>)
            ?.self_description || "",
          photoUrl: otherProfile?.photos?.[0] || "",
          photos: otherProfile?.photos || [],
          isVerified: otherProfile?.verification_status === "verified",
          religion: basicInfo.religion,
          familyType: (
            otherProfile?.family_background as Record<string, unknown>
          )?.family_type,
          height: basicInfo.height,
          values: (otherProfile?.values_beliefs as Record<string, unknown>)
            ? Object.values(
                otherProfile?.values_beliefs as Record<string, unknown>
              ).filter(Boolean)
            : [],
          interests: (otherProfile?.lifestyle as Record<string, unknown>)
            ?.hobbies || [],
          lifestyle: {
            routine:
              (otherProfile?.lifestyle as Record<string, unknown>)?.routine ||
              "",
            socialStyle:
              (otherProfile?.lifestyle as Record<string, unknown>)
                ?.social_style || "",
            diet:
              (otherProfile?.lifestyle as Record<string, unknown>)?.diet || "",
          },
          familyBackground: {
            fatherOccupation:
              (otherProfile?.family_background as Record<string, unknown>)
                ?.father_occupation || "",
            motherOccupation:
              (otherProfile?.family_background as Record<string, unknown>)
                ?.mother_occupation || "",
            siblings:
              (otherProfile?.family_background as Record<string, unknown>)
                ?.siblings || "",
          },
          partnerPreferences: {
            ageRange: `${(otherProfile?.partner_preferences as Record<string, unknown>)?.age_min || "?"}-${(otherProfile?.partner_preferences as Record<string, unknown>)?.age_max || "?"}`,
            educationMin:
              (otherProfile?.partner_preferences as Record<string, unknown>)
                ?.education_min || "",
            locationPreference:
              (
                (otherProfile?.partner_preferences as Record<string, unknown>)
                  ?.location_preferences as string[]
              )?.join(", ") || "",
          },
        },
        compatibilityScore: match.compatibility_score,
        compatibilityBreakdown: match.compatibility_breakdown,
        whyMatched:
          (match.compatibility_breakdown as Record<string, unknown>)
            ?.why_matched || [],
        matchedAt: match.created_at,
        status: mapMatchStatus(match.status, isProfile1),
      };
    });

    return NextResponse.json({ matches: transformedMatches });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function mapMatchStatus(
  dbStatus: string,
  isProfile1: boolean
): "new" | "viewed" | "interested" | "passed" {
  switch (dbStatus) {
    case "sent":
      return "new";
    case "viewed":
      return "viewed";
    case "interested_1":
      return isProfile1 ? "interested" : "new";
    case "interested_2":
      return isProfile1 ? "new" : "interested";
    case "mutual":
      return "interested";
    case "declined_1":
    case "declined_2":
      return "passed";
    default:
      return "new";
  }
}
