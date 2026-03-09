import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current profile
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (fetchError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Validate profile has minimum required fields
    const basicInfo = profile.basic_info as Record<string, unknown> | null;
    if (!basicInfo?.name || !basicInfo?.gender) {
      return NextResponse.json(
        { error: "Please complete basic information before submitting" },
        { status: 400 }
      );
    }

    if (!profile.photos || profile.photos.length === 0) {
      return NextResponse.json(
        { error: "Please upload at least one photo before submitting" },
        { status: 400 }
      );
    }

    // Update status based on payment
    const newStatus =
      profile.payment_status === "paid"
        ? "pending_verification"
        : "pending_payment";

    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update({ status: newStatus })
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      profile: updatedProfile,
      message:
        newStatus === "pending_payment"
          ? "Profile submitted. Please complete payment to proceed."
          : "Profile submitted for verification.",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
