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

    // Get conversations this user participates in
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select("*")
      .contains("participant_ids", [user.id])
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // For each conversation, get the last message and other participant info
    const enrichedConversations = await Promise.all(
      (conversations || []).map(async (conv) => {
        const otherParticipantIds = conv.participant_ids.filter(
          (pid: string) => pid !== user.id
        );

        // Get last message
        const { data: lastMessages } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1);

        // Get unread count
        const { count: unreadCount } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .neq("sender_id", user.id)
          .is("read_at", null);

        // Get other participant profile info
        let participantName = "Matchmaker";
        let participantPhoto = "";
        if (otherParticipantIds.length > 0) {
          const { data: otherProfile } = await supabase
            .from("profiles")
            .select("basic_info, photos")
            .eq("user_id", otherParticipantIds[0])
            .single();

          if (otherProfile) {
            participantName =
              (otherProfile.basic_info as Record<string, unknown>)
                ?.name as string || "Unknown";
            participantPhoto = otherProfile.photos?.[0] || "";
          } else {
            // Could be an admin - check users table
            const { data: adminUser } = await supabase
              .from("users")
              .select("role")
              .eq("id", otherParticipantIds[0])
              .single();
            if (adminUser?.role === "admin") {
              participantName = "Matchmaker";
            }
          }
        }

        return {
          id: conv.id,
          participantName,
          participantPhoto,
          participantId: otherParticipantIds[0] || "",
          lastMessage: lastMessages?.[0]?.content || "",
          lastMessageAt: lastMessages?.[0]?.created_at || conv.created_at,
          unreadCount: unreadCount || 0,
        };
      })
    );

    return NextResponse.json({ conversations: enrichedConversations });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
