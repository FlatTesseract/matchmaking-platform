import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createIntroductionSchema } from "@/lib/validators";

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
    const parsed = createIntroductionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { match_id, message, response_deadline_hours } = parsed.data;

    // Verify the match exists and is in mutual status
    const { data: match } = await supabase
      .from("matches")
      .select("*")
      .eq("id", match_id)
      .single();

    if (!match) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      );
    }

    const deadlineHours = response_deadline_hours || 72;
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + deadlineHours);

    const { data: introduction, error } = await supabase
      .from("introductions")
      .insert({
        match_id,
        initiated_by: user.id,
        message,
        status: "pending",
        response_deadline: deadline.toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Notify both users
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id")
      .in("id", [match.profile_1_id, match.profile_2_id]);

    if (profiles) {
      const notifications = profiles.map((p) => ({
        user_id: p.user_id,
        type: "introduction",
        title: "Introduction Ready!",
        message:
          "Your matchmaker has prepared an introduction for you. Check it out!",
        data: { introduction_id: introduction.id, match_id },
      }));

      await supabase.from("notifications").insert(notifications);
    }

    return NextResponse.json({
      introduction,
      message: "Introduction created and sent to both parties",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
