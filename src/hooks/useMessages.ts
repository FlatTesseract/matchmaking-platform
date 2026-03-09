"use client";

import useSWR from "swr";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

export function useConversations() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/messages",
    fetcher
  );

  return {
    conversations: data?.conversations ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useMessages(conversationId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    conversationId ? `/api/messages/${conversationId}` : null,
    fetcher
  );

  // Real-time subscription for new messages
  useEffect(() => {
    if (!conversationId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          mutate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, mutate]);

  const sendMessage = async (content: string) => {
    if (!conversationId) throw new Error("No conversation selected");

    const res = await fetch(`/api/messages/${conversationId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to send message");
    }

    const result = await res.json();
    mutate();
    return result;
  };

  return {
    messages: data?.messages ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
    sendMessage,
  };
}
