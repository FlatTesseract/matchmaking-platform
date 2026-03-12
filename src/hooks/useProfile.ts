"use client";

import useSWR from "swr";
import type { ProfileUpdateInput } from "@/lib/validators";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

export function useProfile() {
  const { data, error, isLoading, mutate } = useSWR("/api/profile", fetcher);

  const updateProfile = async (updates: ProfileUpdateInput) => {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const data = await res.json();
      const details = Array.isArray(data?.details) ? data.details : [];
      const firstDetail = details[0];
      const detailMsg = firstDetail?.message
        ? `${firstDetail.message}${firstDetail.path ? ` (${firstDetail.path.join(".")})` : ""}`
        : null;
      throw new Error(detailMsg || data.error || "Failed to update profile");
    }

    const result = await res.json();
    mutate(result, false);
    return result;
  };

  const uploadPhoto = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/profile/photos", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to upload photo");
    }

    const result = await res.json();
    mutate();
    return result;
  };

  const uploadDocument = async (file: File, type: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const res = await fetch("/api/profile/documents", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to upload document");
    }

    const result = await res.json();
    mutate();
    return result;
  };

  const submitProfile = async () => {
    const res = await fetch("/api/profile/submit", { method: "POST" });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to submit profile");
    }

    const result = await res.json();
    mutate();
    return result;
  };

  return {
    profile: data?.profile ?? null,
    isLoading,
    isError: !!error,
    error,
    mutate,
    updateProfile,
    uploadPhoto,
    uploadDocument,
    submitProfile,
  };
}
