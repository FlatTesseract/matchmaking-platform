"use client";

import useSWR from "swr";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

export function useNotifications() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/notifications",
    fetcher
  );

  // Real-time subscription for new notifications
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        () => {
          mutate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mutate]);

  const markAsRead = async (notificationId: string) => {
    const res = await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to mark as read");
    }

    mutate();
  };

  const markAllAsRead = async () => {
    const res = await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to mark all as read");
    }

    mutate();
  };

  const notifications = data?.notifications ?? [];
  const unreadCount = notifications.filter(
    (n: { is_read: boolean }) => !n.is_read
  ).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    isError: !!error,
    error,
    mutate,
    markAsRead,
    markAllAsRead,
  };
}
