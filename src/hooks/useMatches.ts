"use client";

import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

export function useMatches() {
  const { data, error, isLoading, mutate } = useSWR("/api/matches", fetcher);

  const expressInterest = async (matchId: string, note?: string) => {
    const res = await fetch(`/api/matches/${matchId}/interest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to express interest");
    }

    const result = await res.json();
    mutate();
    return result;
  };

  const passMatch = async (matchId: string, reason?: string) => {
    const res = await fetch(`/api/matches/${matchId}/pass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to pass match");
    }

    const result = await res.json();
    mutate();
    return result;
  };

  return {
    matches: data?.matches ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
    expressInterest,
    passMatch,
  };
}

export function useIntroductions() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/introductions",
    fetcher
  );

  const respondToIntroduction = async (
    introductionId: string,
    action: "accept" | "decline",
    options?: {
      preferred_contact?: { method?: string; best_times?: string };
      feedback?: string;
    }
  ) => {
    const res = await fetch(`/api/introductions/${introductionId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...options }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to respond to introduction");
    }

    const result = await res.json();
    mutate();
    return result;
  };

  return {
    introductions: data?.introductions ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
    respondToIntroduction,
  };
}
