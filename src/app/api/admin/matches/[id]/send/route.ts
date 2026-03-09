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

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { data: match, error } = await supabase
      .from("matches")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("status", "approved")
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!match) {
      return NextResponse.json(
        { error: "Match not found or not in approved status" },
        { status: 404 }
      );
    }

    // Create notifications for both users
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, basic_info")
      .in("id", [match.profile_1_id, match.profile_2_id]);

    if (profiles) {
      const notifications = profiles.map((p) => ({
        user_id: p.user_id,
        type: "match",
        title: "New Match!",
        message: `You have a new match with ${Math.round(match.compatibility_score)}% compatibility`,
        data: { match_id: match.id },
      }));

      await supabase.from("notifications").insert(notifications);
    }

    return NextResponse.json({
      match,
      message: "Match sent to both users",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
