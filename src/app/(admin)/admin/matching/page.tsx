'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Heart,
  Search,
  Sparkles,
  User,
  ChevronRight,
  ShieldCheck,
  Check,
  Send,
  Loader2,
  Users,
  Home,
  Smile,
  Briefcase,
  MapPin,
  GraduationCap,
  Building2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ActiveProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  location: string;
  education?: string;
  occupation?: string;
  verification_status?: string;
}

interface CompatibilityBreakdown {
  values: number;
  lifestyle: number;
  family: number;
  personality: number;
  practical: number;
}

interface MatchSuggestion {
  profileId: string;
  name: string;
  age: number;
  location: string;
  education: string;
  occupation: string;
  compatibility_score: number;
  compatibility_breakdown: CompatibilityBreakdown;
  why_matched: string[];
}

interface ApprovedMatch {
  id: string;
  profile_1_id: string;
  profile_2_id: string;
  profile_1_name?: string;
  profile_2_name?: string;
  compatibility_score?: number;
  matchmaker_notes?: string;
  status: string;
}

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error('Failed');
    return r.json();
  });

// ---------------------------------------------------------------------------
// Dimension display config
// ---------------------------------------------------------------------------

const dimensionConfig = {
  values: { icon: Heart, label: 'Values Alignment' },
  lifestyle: { icon: Users, label: 'Lifestyle Compatibility' },
  family: { icon: Home, label: 'Family Expectations' },
  personality: { icon: Smile, label: 'Personality Fit' },
  practical: { icon: Briefcase, label: 'Practical Factors' },
} as const;

type Dimension = keyof typeof dimensionConfig;

// ---------------------------------------------------------------------------
// Score colour helpers
// ---------------------------------------------------------------------------

function getScoreColor(score: number) {
  if (score >= 85) return 'bg-green-500';
  if (score >= 70) return 'bg-[#C9956B]';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-400';
}

function getScoreTextColor(score: number) {
  if (score >= 85) return 'text-green-600 bg-green-100 border-green-200';
  if (score >= 70) return 'text-[#A67744] bg-[#C9956B]/20 border-[#C9956B]';
  if (score >= 50) return 'text-amber-700 bg-amber-100 border-amber-200';
  return 'text-red-600 bg-red-100 border-red-200';
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CompatibilityBar({
  dimension,
  score,
}: {
  dimension: Dimension;
  score: number;
}) {
  const config = dimensionConfig[dimension];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-lg bg-[#F5E0E8] flex items-center justify-center flex-shrink-0">
        <Icon className="w-3.5 h-3.5 text-[#7B1E3A]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[#2D1318] font-medium truncate">
            {config.label}
          </span>
          <span className="text-xs font-semibold text-[#2D1318] ml-2">
            {score}%
          </span>
        </div>
        <div className="h-1.5 bg-[#F5E0E8] rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              getScoreColor(score)
            )}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function SuggestionCard({
  suggestion,
  selectedProfileId,
  onApprove,
}: {
  suggestion: MatchSuggestion;
  selectedProfileId: string;
  onApprove: (
    profileId: string,
    notes: string,
    score: number
  ) => Promise<void>;
}) {
  const [notes, setNotes] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove(
        suggestion.profileId,
        notes,
        suggestion.compatibility_score
      );
      setNotes('');
    } finally {
      setIsApproving(false);
    }
  };

  const breakdown = suggestion.compatibility_breakdown;

  return (
    <div className="bg-white rounded-2xl border border-[#F5E0E8]/50 shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="px-6 py-4 bg-[#FFF8F0] border-b border-[#F5E0E8]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#F5E0E8] flex items-center justify-center text-[#7B1E3A] font-bold text-lg">
              {suggestion.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-[#2D1318]">
                {suggestion.name}
              </h3>
              <p className="text-sm text-[#6B5B5E]">
                {suggestion.age} years old &bull; {suggestion.location}
              </p>
            </div>
          </div>
          <div
            className={cn(
              'px-4 py-2 rounded-xl font-bold text-lg border',
              getScoreTextColor(suggestion.compatibility_score)
            )}
          >
            {suggestion.compatibility_score}%
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Profile details */}
        <div className="flex flex-wrap gap-4 mb-5 text-sm text-[#6B5B5E]">
          {suggestion.occupation && (
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#7B1E3A]" />
              {suggestion.occupation}
            </span>
          )}
          {suggestion.education && (
            <span className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#7B1E3A]" />
              {suggestion.education}
            </span>
          )}
          {suggestion.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#7B1E3A]" />
              {suggestion.location}
            </span>
          )}
        </div>

        {/* 5-dimension breakdown */}
        <div className="mb-5">
          <h4 className="text-xs font-semibold text-[#7B1E3A] uppercase tracking-wider mb-3">
            Compatibility Breakdown
          </h4>
          <div className="space-y-3">
            {(Object.keys(dimensionConfig) as Dimension[]).map((dim) => (
              <CompatibilityBar
                key={dim}
                dimension={dim}
                score={breakdown[dim]}
              />
            ))}
          </div>
        </div>

        {/* Why matched - top 3 reasons */}
        {suggestion.why_matched && suggestion.why_matched.length > 0 && (
          <div className="mb-5">
            <h4 className="text-xs font-semibold text-[#7B1E3A] uppercase tracking-wider mb-2">
              Why They Match
            </h4>
            <ul className="space-y-1.5">
              {suggestion.why_matched.slice(0, 3).map((reason, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-[#6B5B5E]"
                >
                  <Sparkles className="w-4 h-4 text-[#C9956B] flex-shrink-0 mt-0.5" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes textarea */}
        <div className="mb-4">
          <label className="text-sm font-medium text-[#2D1318] mb-2 block">
            Matchmaker Notes
          </label>
          <Textarea
            placeholder="Add notes about this match (why you're approving, special considerations...)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border-[#E3C4A8] focus:border-[#7B1E3A] focus:ring-[#7B1E3A]/20 resize-none"
            rows={2}
          />
        </div>

        {/* Approve button */}
        <Button
          onClick={handleApprove}
          disabled={isApproving}
          className="w-full bg-[#7B1E3A] hover:bg-[#5C1229] text-white"
        >
          {isApproving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Check className="w-4 h-4 mr-2" />
          )}
          Approve Match
        </Button>
      </div>
    </div>
  );
}

function ApprovedMatchCard({
  match,
  onSend,
}: {
  match: ApprovedMatch;
  onSend: (matchId: string) => Promise<void>;
}) {
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    try {
      await onSend(match.id);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-[#FFF8F0] rounded-xl border border-[#F5E0E8]">
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full bg-[#F5E0E8] flex items-center justify-center text-[#7B1E3A] font-semibold text-sm border-2 border-white">
            {(match.profile_1_name ?? '?').charAt(0)}
          </div>
          <div className="w-8 h-8 rounded-full bg-[#C9956B]/30 flex items-center justify-center text-[#7B1E3A] font-semibold text-sm border-2 border-white">
            {(match.profile_2_name ?? '?').charAt(0)}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-[#2D1318]">
            {match.profile_1_name ?? 'Profile 1'} &{' '}
            {match.profile_2_name ?? 'Profile 2'}
          </p>
          {match.compatibility_score !== undefined && (
            <p className="text-xs text-[#6B5B5E]">
              {match.compatibility_score}% compatible
            </p>
          )}
        </div>
      </div>
      <Button
        size="sm"
        onClick={handleSend}
        disabled={isSending}
        className="bg-[#C9956B] hover:bg-[#A67744] text-white"
      >
        {isSending ? (
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
        ) : (
          <Send className="w-4 h-4 mr-1" />
        )}
        Send
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeletons
// ---------------------------------------------------------------------------

function ProfileListSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <div className="w-8 h-8 rounded-full bg-[#F5E0E8]" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-24 bg-[#F5E0E8] rounded" />
            <div className="h-2.5 w-16 bg-[#F5E0E8] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SuggestionSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#F5E0E8]/50 shadow-sm overflow-hidden animate-pulse">
      <div className="px-6 py-4 bg-[#FFF8F0] border-b border-[#F5E0E8]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#F5E0E8]" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 bg-[#F5E0E8] rounded" />
            <div className="h-3 w-40 bg-[#F5E0E8] rounded" />
          </div>
          <div className="h-10 w-16 bg-[#F5E0E8] rounded-xl" />
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="h-3 w-full bg-[#F5E0E8] rounded" />
        <div className="h-3 w-3/4 bg-[#F5E0E8] rounded" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#F5E0E8]" />
              <div className="flex-1 h-1.5 bg-[#F5E0E8] rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function MatchingPage() {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [approvedMatches, setApprovedMatches] = useState<ApprovedMatch[]>([]);

  // ---- Fetch active profiles for left panel ---- //
  const {
    data: profilesData,
    error: profilesError,
    isLoading: profilesLoading,
  } = useSWR<{ profiles: ActiveProfile[] }>(
    '/api/admin/profiles?status=active',
    fetcher,
    { revalidateOnFocus: false }
  );

  const activeProfiles = profilesData?.profiles ?? [];

  // ---- Filter profiles by search ---- //
  const filteredProfiles = activeProfiles.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ---- Fetch AI suggestions for selected profile ---- //
  const {
    data: suggestionsData,
    error: suggestionsError,
    isLoading: suggestionsLoading,
    mutate: mutateSuggestions,
  } = useSWR<{ suggestions: MatchSuggestion[] }>(
    selectedProfileId
      ? `/api/admin/matches/suggestions/${selectedProfileId}`
      : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const suggestions = suggestionsData?.suggestions ?? [];

  // ---- Selected profile object ---- //
  const selectedProfile = activeProfiles.find(
    (p) => p.id === selectedProfileId
  );

  // ---- Actions ---- //

  const handleApproveMatch = async (
    suggestedProfileId: string,
    notes: string,
    score: number
  ) => {
    try {
      const res = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_1_id: selectedProfileId,
          profile_2_id: suggestedProfileId,
          matchmaker_notes: notes,
        }),
      });

      if (!res.ok) throw new Error('Failed to create match');

      const data = await res.json();

      const suggestedProfile = suggestions.find(
        (s) => s.profileId === suggestedProfileId
      );

      setApprovedMatches((prev) => [
        ...prev,
        {
          id: data.id ?? `temp-${Date.now()}`,
          profile_1_id: selectedProfileId,
          profile_2_id: suggestedProfileId,
          profile_1_name: selectedProfile?.name,
          profile_2_name: suggestedProfile?.name,
          compatibility_score: score,
          matchmaker_notes: notes,
          status: 'approved',
        },
      ]);

      toast.success('Match approved!', {
        description: 'This match has been added to the introduction queue.',
      });

      // Remove the approved suggestion from the list
      mutateSuggestions(
        (current) =>
          current
            ? {
                suggestions: current.suggestions.filter(
                  (s) => s.profileId !== suggestedProfileId
                ),
              }
            : current,
        { revalidate: false }
      );
    } catch {
      toast.error('Failed to approve match', {
        description: 'Please try again or contact support.',
      });
    }
  };

  const handleSendMatch = async (matchId: string) => {
    try {
      const res = await fetch(`/api/admin/matches/${matchId}/send`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to send match');

      toast.success('Introduction sent!', {
        description: 'Both profiles have been notified of the match.',
      });

      setApprovedMatches((prev) =>
        prev.filter((m) => m.id !== matchId)
      );
    } catch {
      toast.error('Failed to send introduction', {
        description: 'Please try again or contact support.',
      });
    }
  };

  // ---- Render ---- //

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-serif text-[#2D1318] flex items-center gap-3">
            <Heart className="w-8 h-8 text-[#7B1E3A]" />
            Match Management
          </h1>
          <p className="text-[#6B5B5E] mt-1">
            Review AI-generated match suggestions and create introductions.
          </p>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex gap-6" style={{ minHeight: 'calc(100vh - 200px)' }}>
        {/* ================================================================ */}
        {/* LEFT PANEL - Profile sidebar (~350px)                            */}
        {/* ================================================================ */}
        <div className="w-[350px] flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-[#F5E0E8]/50 overflow-hidden sticky top-8">
            <div className="px-4 py-3 bg-[#FFF8F0] border-b border-[#F5E0E8]">
              <h2 className="font-semibold text-[#2D1318] flex items-center gap-2">
                <User className="w-4 h-4 text-[#7B1E3A]" />
                Select Profile
              </h2>
            </div>
            <div className="p-3">
              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5B5E]" />
                <Input
                  placeholder="Search profiles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-sm border-[#E3C4A8]"
                />
              </div>

              {/* Profile list */}
              <div className="max-h-[calc(100vh-340px)] overflow-y-auto space-y-1">
                {profilesLoading && <ProfileListSkeleton />}

                {profilesError && (
                  <div className="p-4 text-center">
                    <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <p className="text-sm text-red-600">
                      Failed to load profiles
                    </p>
                  </div>
                )}

                {!profilesLoading &&
                  !profilesError &&
                  filteredProfiles.length === 0 && (
                    <div className="p-4 text-center text-sm text-[#6B5B5E]">
                      No profiles found.
                    </div>
                  )}

                {!profilesLoading &&
                  !profilesError &&
                  filteredProfiles.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => setSelectedProfileId(profile.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors',
                        selectedProfileId === profile.id
                          ? 'bg-[#F5E0E8]'
                          : 'hover:bg-[#FFF8F0]'
                      )}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#F5E0E8] flex items-center justify-center text-[#7B1E3A] font-semibold text-sm flex-shrink-0">
                        {profile.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#2D1318] truncate">
                          {profile.name}
                        </p>
                        <p className="text-xs text-[#6B5B5E] truncate">
                          {profile.age} &bull; {profile.location}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#6B5B5E] flex-shrink-0" />
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* RIGHT PANEL - Main content                                       */}
        {/* ================================================================ */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* ---- No profile selected ---- */}
          {!selectedProfileId && (
            <div className="bg-gradient-to-r from-[#7B1E3A] to-[#9E3A55] rounded-2xl p-10 text-white text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h2 className="text-xl font-semibold font-serif mb-2">
                AI-Powered Match Suggestions
              </h2>
              <p className="text-white/80 text-sm max-w-lg mx-auto">
                Select a profile from the sidebar to view AI-generated match
                suggestions. Our engine analyses values, lifestyle, personality,
                family expectations, and practical factors to surface the most
                compatible matches.
              </p>
            </div>
          )}

          {/* ---- Profile selected: header ---- */}
          {selectedProfile && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F5E0E8]/50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#F5E0E8] flex items-center justify-center text-[#7B1E3A] font-bold text-2xl">
                  {selectedProfile.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold font-serif text-[#2D1318]">
                      {selectedProfile.name}
                    </h2>
                    {selectedProfile.verification_status === 'verified' && (
                      <Badge
                        variant="outline"
                        className="bg-[#C9956B]/20 text-[#A67744] border-[#C9956B]"
                      >
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-[#6B5B5E]">
                    {selectedProfile.age} years old &bull;{' '}
                    {selectedProfile.location}
                  </p>
                  {selectedProfile.occupation && (
                    <p className="text-sm text-[#6B5B5E]">
                      {selectedProfile.occupation}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#6B5B5E]">Suggestions</p>
                  <p className="text-2xl font-bold text-[#7B1E3A]">
                    {suggestionsLoading ? '...' : suggestions.length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ---- AI Suggestions section ---- */}
          {selectedProfileId && (
            <>
              <div>
                <h3 className="text-lg font-semibold font-serif text-[#2D1318] flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-[#C9956B]" />
                  AI Suggestions
                </h3>

                {/* Loading */}
                {suggestionsLoading && (
                  <div className="space-y-6">
                    <SuggestionSkeleton />
                    <SuggestionSkeleton />
                  </div>
                )}

                {/* Error */}
                {suggestionsError && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                    <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                    <h4 className="text-lg font-semibold text-red-800 mb-1">
                      Failed to load suggestions
                    </h4>
                    <p className="text-red-600 text-sm mb-4">
                      Could not fetch match suggestions for this profile.
                    </p>
                    <Button
                      onClick={() => mutateSuggestions()}
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      Retry
                    </Button>
                  </div>
                )}

                {/* Empty */}
                {!suggestionsLoading &&
                  !suggestionsError &&
                  suggestions.length === 0 && (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-[#F5E0E8]/50">
                      <Heart className="w-16 h-16 text-[#F5E0E8] mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-[#2D1318] mb-2">
                        No Suggestions Available
                      </h4>
                      <p className="text-[#6B5B5E] max-w-md mx-auto text-sm">
                        No match suggestions are currently available for{' '}
                        {selectedProfile?.name}. New suggestions will appear as
                        more profiles join the platform.
                      </p>
                    </div>
                  )}

                {/* Suggestion cards */}
                {!suggestionsLoading &&
                  !suggestionsError &&
                  suggestions.length > 0 && (
                    <div className="space-y-6">
                      {suggestions.map((suggestion) => (
                        <SuggestionCard
                          key={suggestion.profileId}
                          suggestion={suggestion}
                          selectedProfileId={selectedProfileId}
                          onApprove={handleApproveMatch}
                        />
                      ))}
                    </div>
                  )}
              </div>

              {/* ---- Ready to Send queue ---- */}
              {approvedMatches.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold font-serif text-[#2D1318] flex items-center gap-2 mb-4">
                    <Send className="w-5 h-5 text-[#C9956B]" />
                    Ready to Send
                    <Badge
                      variant="outline"
                      className="ml-2 bg-[#C9956B]/20 text-[#A67744] border-[#C9956B]"
                    >
                      {approvedMatches.length}
                    </Badge>
                  </h3>
                  <div className="bg-white rounded-2xl border border-[#F5E0E8]/50 shadow-sm p-4 space-y-3">
                    {approvedMatches.map((match) => (
                      <ApprovedMatchCard
                        key={match.id}
                        match={match}
                        onSend={handleSendMatch}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
