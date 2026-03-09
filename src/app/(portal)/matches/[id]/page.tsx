"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  X,
  MessageCircle,
  Share2,
  Flag,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompatibilityScore, CompatibilityBreakdown } from "@/components/portal/compatibility-score";
import { WhyMatched } from "@/components/portal/why-matched";
import { ProfileSections } from "@/components/portal/profile-sections";
import { StatusBadge } from "@/components/portal/status-badge";
import { ErrorState } from "@/components/portal/error-state";
import { Skeleton } from "@/components/portal/loading-skeleton";
import { useMatches } from "@/hooks/useMatches";
import { toast } from "sonner";

export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { matches, isLoading, isError, expressInterest, passMatch, mutate } = useMatches();
  const [actionLoading, setActionLoading] = useState<"interest" | "pass" | null>(null);

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8 space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <Skeleton className="md:w-2/5 aspect-[3/4] md:aspect-auto md:h-96 rounded-none" />
            <div className="md:w-3/5 p-8 space-y-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-5 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-24 rounded-xl" />
              <div className="flex gap-3">
                <Skeleton className="h-12 flex-1 rounded-xl" />
                <Skeleton className="h-12 flex-1 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return <ErrorState message="Couldn't load match details." onRetry={() => mutate()} />;
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const match = matches.find((m: any) => m.id === id);

  if (!match) {
    return (
      <div className="p-4 lg:p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-serif font-bold text-[#2D1318] mb-2">Match not found</h2>
          <p className="text-[#6B5B5E] mb-6">This match may no longer be available.</p>
          <Link href="/matches">
            <Button className="bg-[#7B1E3A] hover:bg-[#5C1229] text-white rounded-lg">
              Back to Matches
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const name = match.name || "Unknown";
  const age = match.age || "";
  const headline = match.headline || match.about || "";
  const location = match.location || "";
  const occupation = match.occupation || "";
  const education = match.education || "";
  const photoUrl = match.photo_url || (match.photos && match.photos[0]) || null;
  const isVerified = match.is_verified ?? false;
  const isPremium = match.is_premium ?? false;
  const compatibilityScore = match.compatibility_score || 0;
  const compatibilityBreakdown = match.compatibility_breakdown || { values: 0, lifestyle: 0, family: 0, personality: 0 };
  const whyMatched = match.why_matched || [];

  const profileForSections = {
    id: match.id || id,
    name,
    age,
    headline,
    about: match.about || headline,
    location,
    occupation,
    education,
    photoUrl,
    photos: match.photos || [],
    religion: match.religion || "",
    familyType: match.family_type || "",
    height: match.height || "",
    values: match.values || [],
    interests: match.hobbies || [],
    lifestyle: match.lifestyle || {},
    familyBackground: match.family_background || {},
    partnerPreferences: match.partner_preferences || {},
    profileCompletion: 100,
    isVerified,
    isPremium,
  };

  const handleInterest = async () => {
    setActionLoading("interest");
    try {
      const result = await expressInterest(id);
      if (result.mutual) {
        toast.success("It's mutual! The matchmaker will facilitate an introduction.");
      } else {
        toast.success(`Interest expressed in ${name}! The matchmaker will be notified.`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to express interest");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePass = async () => {
    if (!confirm(`Are you sure you want to pass on ${name}?`)) return;
    setActionLoading("pass");
    try {
      await passMatch(id);
      toast.success("Match passed.");
      router.push("/matches");
    } catch (err: any) {
      toast.error(err.message || "Failed to pass");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <div className="relative">
        <div className="absolute inset-0 h-80 bg-gradient-to-b from-[#7B1E3A]/10 to-transparent" />

        <div className="relative z-10 p-4 lg:p-8">
          <Link
            href="/matches"
            className="inline-flex items-center gap-2 text-[#6B5B5E] hover:text-[#7B1E3A] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Matches</span>
          </Link>
        </div>

        <div className="relative z-10 px-4 lg:px-8 pb-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl shadow-lg border border-[#FECDD3]/50 overflow-hidden">
              <div className="md:flex">
                <div className="md:w-2/5 relative">
                  <div className="aspect-[3/4] md:aspect-auto md:h-full">
                    {photoUrl ? (
                      <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#F5E0E8] flex items-center justify-center text-6xl font-bold text-[#7B1E3A]">
                        {name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:bg-gradient-to-r" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {isVerified && <StatusBadge type="verified" />}
                    {isPremium && <StatusBadge type="premium" />}
                  </div>
                </div>

                <div className="md:w-3/5 p-6 lg:p-8">
                  <div className="flex flex-col h-full">
                    <div className="mb-6">
                      <h1 className="text-3xl lg:text-4xl font-serif font-bold text-[#2D1318] mb-2">
                        {name}{age ? `, ${age}` : ""}
                      </h1>
                      {headline && <p className="text-lg text-[#6B5B5E] mb-4">{headline}</p>}
                      <div className="flex flex-wrap gap-4 text-sm text-[#6B5B5E]">
                        {location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#C9956B]" />
                            <span>{location}</span>
                          </div>
                        )}
                        {occupation && (
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-[#C9956B]" />
                            <span>{occupation}</span>
                          </div>
                        )}
                        {education && (
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-[#C9956B]" />
                            <span>{education}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mb-6 p-4 bg-[#FFF8F0] rounded-xl">
                      <CompatibilityScore score={compatibilityScore} size="lg" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#2D1318] mb-2">Compatibility Score</h3>
                        <CompatibilityBreakdown breakdown={compatibilityBreakdown} />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-auto">
                      <Button
                        onClick={handlePass}
                        disabled={!!actionLoading}
                        variant="outline"
                        className="flex-1 border-[#6B5B5E] text-[#6B5B5E] hover:bg-[#F5E0E8] rounded-xl py-6"
                      >
                        {actionLoading === "pass" ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <X className="w-5 h-5 mr-2" />}
                        Pass
                      </Button>
                      <Button
                        onClick={handleInterest}
                        disabled={!!actionLoading}
                        className="flex-1 bg-[#7B1E3A] hover:bg-[#5C1229] text-white rounded-xl py-6"
                      >
                        {actionLoading === "interest" ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Heart className="w-5 h-5 mr-2" />}
                        I&apos;m Interested
                      </Button>
                    </div>

                    <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-[#F5E0E8]">
                      <Link href="/messages" className="flex items-center gap-2 text-sm text-[#6B5B5E] hover:text-[#7B1E3A] transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        Ask Matchmaker
                      </Link>
                      <button className="flex items-center gap-2 text-sm text-[#6B5B5E] hover:text-[#7B1E3A] transition-colors">
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                      <button className="flex items-center gap-2 text-sm text-[#6B5B5E] hover:text-[#7B1E3A] transition-colors">
                        <Flag className="w-4 h-4" />
                        Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-8 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              {whyMatched.length > 0 && <WhyMatched items={whyMatched} />}
            </div>
            <div className="lg:col-span-2">
              <ProfileSections profile={profileForSections} />
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#FECDD3] p-4 z-30">
        <div className="flex gap-3">
          <Button onClick={handlePass} disabled={!!actionLoading} variant="outline" className="flex-1 border-[#6B5B5E] text-[#6B5B5E] rounded-xl">
            {actionLoading === "pass" ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <X className="w-5 h-5 mr-2" />}
            Pass
          </Button>
          <Button onClick={handleInterest} disabled={!!actionLoading} className="flex-1 bg-[#7B1E3A] hover:bg-[#5C1229] text-white rounded-xl">
            {actionLoading === "interest" ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Heart className="w-5 h-5 mr-2" />}
            Interested
          </Button>
        </div>
      </div>
      <div className="lg:hidden h-20" />
    </div>
  );
}
