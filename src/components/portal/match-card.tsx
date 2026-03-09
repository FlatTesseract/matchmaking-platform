"use client";

import { cn } from "@/lib/utils";
import { MapPin, Briefcase } from "lucide-react";
import { CompatibilityScore } from "./compatibility-score";
import { StatusBadge } from "./status-badge";
import Link from "next/link";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface MatchCardProps {
  match: any;
  className?: string;
}

export function MatchCard({ match, className }: MatchCardProps) {
  // Support both mock data shape and API data shape
  const profile = match.profile || match;
  const compatibilityScore = match.compatibilityScore ?? match.compatibility_score ?? 0;
  const status = match.status || "new";
  const matchId = match.id;

  const name = profile.name || "Unknown";
  const age = profile.age || "";
  const photoUrl = profile.photoUrl || profile.photo_url || (profile.photos && profile.photos[0]) || null;
  const headline = profile.headline || profile.about || "";
  const location = profile.location || "";
  const occupation = profile.occupation || "";
  const isVerified = profile.isVerified ?? profile.is_verified ?? false;
  const isPremium = profile.isPremium ?? profile.is_premium ?? false;

  return (
    <Link href={`/matches/${matchId}`}>
      <div
        className={cn(
          "group bg-white rounded-2xl shadow-sm border border-[#FECDD3]/50 overflow-hidden",
          "transition-all duration-200 ease-out",
          "hover:shadow-lg hover:-translate-y-1",
          "cursor-pointer",
          className
        )}
      >
        {/* Photo Section */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#F5E0E8]">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[#7B1E3A]">
              {name.charAt(0)}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          <div className="absolute top-3 left-3 flex gap-2">
            {isVerified && <StatusBadge type="verified" size="sm" />}
            {isPremium && <StatusBadge type="premium" size="sm" />}
          </div>

          <div className="absolute top-3 right-3">
            <CompatibilityScore score={compatibilityScore} size="sm" showLabel={false} />
          </div>

          {(status === "new" || status === "sent") && (
            <div className="absolute bottom-3 left-3">
              <span className="bg-[#7B1E3A] text-white text-xs font-semibold px-2 py-1 rounded-full">
                New
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-semibold text-[#2D1318] font-serif truncate">
              {name}{age ? `, ${age}` : ""}
            </h3>
          </div>

          {headline && (
            <p className="text-sm text-[#6B5B5E] line-clamp-2 mb-3 min-h-[2.5rem]">
              {headline}
            </p>
          )}

          <div className="space-y-1.5">
            {location && (
              <div className="flex items-center gap-2 text-sm text-[#6B5B5E]">
                <MapPin className="w-4 h-4 text-[#C9956B]" />
                <span className="truncate">{location}</span>
              </div>
            )}
            {occupation && (
              <div className="flex items-center gap-2 text-sm text-[#6B5B5E]">
                <Briefcase className="w-4 h-4 text-[#C9956B]" />
                <span className="truncate">{occupation}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
