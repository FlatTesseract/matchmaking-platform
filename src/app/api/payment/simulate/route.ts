import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { plan, method } = body;

    if (!plan || !method) {
      return NextResponse.json(
        { error: "Plan and method are required" },
        { status: 400 }
      );
    }

    const amount = plan === "premium" ? 10000 : 2000;

    // Create payment record
    const { error: paymentError } = await supabase.from("payments").insert({
      user_id: user.id,
      amount,
      currency: "BDT",
      payment_method: method,
      payment_type: plan === "premium" ? "premium" : "signup",
      status: "completed",
      reference: `SIM${Date.now()}`,
    });

    if (paymentError) {
      return NextResponse.json(
        { error: paymentError.message },
        { status: 500 }
      );
    }

    // Update profile status
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        payment_status: "paid",
        payment_type: plan,
        status: "pending_verification",
      })
      .eq("user_id", user.id);

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment simulated successfully",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
