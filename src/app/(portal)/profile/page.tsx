"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Edit,
  MapPin,
  Briefcase,
  GraduationCap,
  Camera,
  Shield,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileSections } from "@/components/portal/profile-sections";
import { StatusBadge } from "@/components/portal/status-badge";
import { ProfileSkeleton } from "@/components/portal/loading-skeleton";
import { ErrorState } from "@/components/portal/error-state";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const { profile, isLoading, isError, mutate } = useProfile();
  const { user } = useAuth();

  if (isLoading) return <ProfileSkeleton />;
  if (isError) return <ErrorState message="Couldn't load your profile." onRetry={() => mutate()} />;

  const name = profile?.basic_info?.name || user?.user_metadata?.name || "User";
  const headline = profile?.personality?.self_description || "";
  const location = profile?.basic_info?.city || "";
  const occupation = profile?.education_career?.occupation || "";
  const education = profile?.education_career?.education_level
    ? `${profile.education_career.education_level}${profile.education_career.institution ? `, ${profile.education_career.institution}` : ""}`
    : "";
  const photoUrl = profile?.photos?.[0] || null;
  const isVerified = profile?.verification_status === "verified";
  const isPremium = profile?.payment_type === "premium";
  const age = profile?.basic_info?.date_of_birth
    ? Math.floor((Date.now() - new Date(profile.basic_info.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;
  const height = profile?.basic_info?.height || "";

  // Calculate profile completion
  const sections = ["basic_info", "education_career", "family_background", "values_beliefs", "lifestyle", "personality", "partner_preferences"];
  let filled = 0;
  for (const section of sections) {
    if (profile?.[section] && Object.keys(profile[section]).length > 0) filled++;
  }
  if (profile?.photos?.length > 0) filled++;
  const profileCompletion = Math.round((filled / (sections.length + 1)) * 100);

  // Build profile object for ProfileSections component
  const profileForSections = {
    id: profile?.id || "",
    name,
    age: age || 0,
    headline,
    about: headline,
    profileCompletion,
    location,
    occupation,
    education,
    photoUrl,
    photos: profile?.photos || [],
    religion: profile?.basic_info?.religion || "",
    familyType: profile?.family_background?.family_type || "",
    height,
    values: [
      profile?.values_beliefs?.religious_observance,
      profile?.values_beliefs?.gender_roles,
      profile?.values_beliefs?.financial_management,
    ].filter(Boolean),
    interests: profile?.lifestyle?.hobbies || [],
    lifestyle: {
      routine: profile?.lifestyle?.routine || "",
      socialStyle: profile?.lifestyle?.social_style || "",
      diet: profile?.lifestyle?.diet || "",
    },
    familyBackground: {
      fatherOccupation: profile?.family_background?.father_occupation || "",
      motherOccupation: profile?.family_background?.mother_occupation || "",
      siblings: profile?.family_background?.siblings_count ? `${profile.family_background.siblings_count} siblings` : "",
    },
    partnerPreferences: {
      ageRange: profile?.partner_preferences?.age_range ? `${profile.partner_preferences.age_range[0]}-${profile.partner_preferences.age_range[1]}` : "",
      educationMin: profile?.partner_preferences?.education_min || "",
      locationPreference: profile?.partner_preferences?.location_preferences?.join(", ") || "",
    },
    isVerified,
    isPremium,
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="bg-white rounded-3xl shadow-sm border border-[#FECDD3]/50 overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-[#7B1E3A] to-[#9E3A55]" />

        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row gap-6 -mt-16">
            <div className="relative">
              {photoUrl ? (
                <img src={photoUrl} alt={name} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-[#7B1E3A] flex items-center justify-center text-white text-4xl font-bold">
                  {name.charAt(0)}
                </div>
              )}
              <button className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-[#7B1E3A] text-white flex items-center justify-center shadow-lg hover:bg-[#5C1229] transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 pt-4 md:pt-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#2D1318]">{name}</h1>
                    <div className="flex gap-2">
                      {isVerified && <StatusBadge type="verified" />}
                      {isPremium && <StatusBadge type="premium" />}
                    </div>
                  </div>
                  {headline && <p className="text-[#6B5B5E] mb-3">{headline}</p>}
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

                <Link href="/create-profile">
                  <Button className="bg-[#7B1E3A] hover:bg-[#5C1229] text-white rounded-lg">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-[#FFF8F0] rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#2D1318]">Profile Completion</span>
              <span className="text-sm font-bold text-[#7B1E3A]">{profileCompletion}%</span>
            </div>
            <div className="h-2 bg-[#F5E0E8] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#7B1E3A] to-[#C9956B] rounded-full transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            {profileCompletion < 100 && (
              <p className="text-xs text-[#6B5B5E] mt-2">
                Complete your profile to get 3x more matches. Add more photos and details!
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-[#F5E0E8] rounded-xl">
              <div className="text-2xl font-bold text-[#7B1E3A]">{age || "—"}</div>
              <div className="text-xs text-[#6B5B5E]">Years Old</div>
            </div>
            <div className="text-center p-4 bg-[#F5E0E8] rounded-xl">
              <div className="text-2xl font-bold text-[#7B1E3A]">{height || "—"}</div>
              <div className="text-xs text-[#6B5B5E]">Height</div>
            </div>
            <div className="text-center p-4 bg-[#F5E0E8] rounded-xl">
              <div className="flex items-center justify-center gap-1">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span className="text-lg font-bold text-emerald-600">{isVerified ? "Yes" : "No"}</span>
              </div>
              <div className="text-xs text-[#6B5B5E]">Verified</div>
            </div>
          </div>
        </div>
      </div>

      <ProfileSections profile={profileForSections} isOwnProfile />

      {!isPremium && (
        <div className="mt-8 bg-gradient-to-r from-[#C9956B] to-[#E3C4A8] rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold">Upgrade to Premium</h3>
                <p className="text-white/80 text-sm">
                  Get priority matching, unlimited messages, and exclusive features.
                </p>
              </div>
            </div>
            <Button className="bg-white text-[#C9956B] hover:bg-white/90 rounded-lg">
              Learn More
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
