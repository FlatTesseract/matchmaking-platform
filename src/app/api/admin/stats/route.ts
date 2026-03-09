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

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Total profiles
    const { count: totalProfiles } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Pending verifications
    const { count: pendingVerifications } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("verification_status", "pending");

    // Active matches
    const { count: activeMatches } = await supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
      .in("status", ["sent", "viewed", "interested_1", "interested_2", "mutual"]);

    // Successful introductions
    const { count: totalIntroductions } = await supabase
      .from("introductions")
      .select("*", { count: "exact", head: true });

    const { count: completedIntroductions } = await supabase
      .from("introductions")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed");

    const successRate =
      totalIntroductions && totalIntroductions > 0
        ? Math.round(
            ((completedIntroductions || 0) / totalIntroductions) * 100
          )
        : 0;

    // Revenue
    const { data: payments } = await supabase
      .from("payments")
      .select("amount, currency")
      .eq("status", "completed");

    const revenue = (payments || []).reduce((sum, p) => {
      if (p.currency === "BDT") return sum + Number(p.amount);
      // Rough conversion for display
      if (p.currency === "USD") return sum + Number(p.amount) * 110;
      if (p.currency === "GBP") return sum + Number(p.amount) * 140;
      return sum + Number(p.amount);
    }, 0);

    // New signups this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const { count: newSignupsThisWeek } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", oneWeekAgo.toISOString());

    // Introductions sent
    const { count: introductionsSent } = await supabase
      .from("introductions")
      .select("*", { count: "exact", head: true })
      .neq("status", "pending");

    // Meetings scheduled (contact_shared or completed)
    const { count: meetingsScheduled } = await supabase
      .from("introductions")
      .select("*", { count: "exact", head: true })
      .in("status", ["contact_shared", "completed"]);

    return NextResponse.json({
      totalProfiles: totalProfiles || 0,
      totalProfilesTrend: 0,
      pendingVerifications: pendingVerifications || 0,
      pendingVerificationsTrend: 0,
      activeMatches: activeMatches || 0,
      activeMatchesTrend: 0,
      successRate,
      successRateTrend: 0,
      revenue,
      revenueTrend: 0,
      newSignupsThisWeek: newSignupsThisWeek || 0,
      introductionsSent: introductionsSent || 0,
      meetingsScheduled: meetingsScheduled || 0,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
