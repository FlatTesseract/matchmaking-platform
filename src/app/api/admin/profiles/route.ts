import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!userData || userData.role !== "admin") return null;

  return user;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const admin = await requireAdmin(supabase);

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const verificationStatus = searchParams.get("verification_status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let query = supabase
      .from("profiles")
      .select(
        `
        *,
        user:users!profiles_user_id_fkey(id, role, phone, created_at)
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }
    if (verificationStatus) {
      query = query.eq("verification_status", verificationStatus);
    }
    if (search) {
      query = query.or(
        `basic_info->>name.ilike.%${search}%,basic_info->>location.ilike.%${search}%`
      );
    }

    const { data: profiles, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Transform to match admin frontend interface
    const transformedProfiles = (profiles || []).map((p) => {
      const basicInfo = (p.basic_info as Record<string, unknown>) || {};
      const eduCareer =
        (p.education_career as Record<string, unknown>) || {};

      return {
        id: p.id,
        name: basicInfo.name || "Unknown",
        age: basicInfo.date_of_birth
          ? new Date().getFullYear() -
            new Date(basicInfo.date_of_birth as string).getFullYear()
          : null,
        gender: basicInfo.gender || "unknown",
        location: basicInfo.location || "",
        education: eduCareer.education_level || "",
        occupation: eduCareer.occupation || "",
        status: p.status,
        verificationStatus: p.verification_status,
        signupDate: p.created_at,
        email: "", // Email is in auth.users, not accessible here
        phone: p.user?.phone || "",
        photo: p.photos?.[0] || "",
        religion: basicInfo.religion || "",
        familyType:
          (p.family_background as Record<string, unknown>)?.family_type || "",
        matchCount: 0,
        lastActive: p.updated_at,
      };
    });

    return NextResponse.json({
      profiles: transformedProfiles,
      total: count || 0,
      page,
      limit,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
