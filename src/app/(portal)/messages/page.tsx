"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/portal/chat-interface";
import { MessagesSkeleton } from "@/components/portal/loading-skeleton";
import { ErrorState } from "@/components/portal/error-state";
import { EmptyState } from "@/components/portal/empty-state";
import { useConversations, useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const { user } = useAuth();
  const { conversations, isLoading: convsLoading, isError: convsError, mutate: mutateConvs } = useConversations();
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);

  // Auto-select first conversation
  const activeConvId = selectedConvId || (conversations.length > 0 ? conversations[0].id : null);
  const { messages, isLoading: msgsLoading, sendMessage } = useMessages(activeConvId);

  if (convsLoading) return <MessagesSkeleton />;
  if (convsError) return <ErrorState message="Couldn't load messages." onRetry={() => mutateConvs()} />;

  if (conversations.length === 0) {
    return (
      <div className="h-[calc(100vh-64px)] lg:h-screen flex flex-col">
        <div className="bg-white border-b border-[#FECDD3]/50 p-4 lg:p-6">
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#2D1318] mb-1">Messages</h1>
          <p className="text-[#6B5B5E] text-sm">Chat with your dedicated matchmaker for guidance and updates.</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState type="messages" />
        </div>
      </div>
    );
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  // Map API messages to the shape expected by ChatInterface
  const chatMessages = messages.map((msg: any) => ({
    id: msg.id,
    senderId: msg.sender_id,
    senderName: msg.sender_name || "User",
    senderAvatar: msg.sender_avatar || "",
    content: msg.content,
    timestamp: msg.created_at || msg.timestamp,
    isFromMatchmaker: msg.is_matchmaker ?? false,
  }));

  const activeConv = conversations.find((c: any) => c.id === activeConvId);
  const matchmakerName = activeConv?.participant_name || "Your Matchmaker";
  const matchmakerAvatar = activeConv?.participant_photo || "";

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
    } catch {
      // Error handled by the hook
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] lg:h-screen flex flex-col">
      <div className="bg-white border-b border-[#FECDD3]/50 p-4 lg:p-6">
        <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#2D1318] mb-1">Messages</h1>
        <p className="text-[#6B5B5E] text-sm">
          Chat with your dedicated matchmaker for guidance and updates.
        </p>
      </div>

      {/* Conversation list (if multiple) */}
      {conversations.length > 1 && (
        <div className="bg-white border-b border-[#FECDD3]/50 px-4 py-2 flex gap-2 overflow-x-auto">
          {conversations.map((conv: any) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConvId(conv.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors",
                conv.id === activeConvId
                  ? "bg-[#7B1E3A] text-white"
                  : "bg-[#F5E0E8] text-[#6B5B5E] hover:bg-[#FECDD3]"
              )}
            >
              {conv.participant_name || "Conversation"}
              {conv.unread_count > 0 && (
                <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full font-bold">
                  {conv.unread_count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        {msgsLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-8 w-8 border-2 border-[#7B1E3A]/30 border-t-[#7B1E3A] rounded-full animate-spin" />
          </div>
        ) : (
          <ChatInterface
            messages={chatMessages}
            currentUserId={user?.id || ""}
            matchmakerName={matchmakerName}
            matchmakerAvatar={matchmakerAvatar}
            onSendMessage={handleSendMessage}
            className="h-full"
          />
        )}
      </div>
    </div>
  );
}
