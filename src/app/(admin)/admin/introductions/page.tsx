'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import {
  MessageSquareHeart,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  Heart,
  TrendingUp,
  Loader2,
  AlertCircle,
  User,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error('Failed');
    return r.json();
  });

interface MatchProfile {
  id: string;
  name: string;
  age: number | null;
  location: string;
  occupation: string;
  education: string;
  photoUrl: string;
  isVerified: boolean;
  religion?: string;
  height?: string;
}

interface MatchItem {
  id: string;
  profile: MatchProfile;
  compatibilityScore: number;
  matchedAt: string;
  status: string;
}

interface IntroductionItem {
  id: string;
  matchId: string;
  matchName: string;
  matchPhoto: string;
  status: 'pending' | 'accepted' | 'meeting_scheduled' | 'completed' | 'declined';
  message: string;
  createdAt: string;
  updatedAt: string;
  meetingDetails: unknown;
}

const INTRODUCTION_TEMPLATE = `Dear [Name],

I'm pleased to introduce you to a wonderful match we've carefully selected for you. Based on your shared values, interests, and preferences, we believe this could be a truly meaningful connection.

We encourage you both to take this step with an open heart. Your matchmaker is here to support you throughout this journey.

Warm regards,
Your Matchmaker`;

function statusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    accepted: { label: 'Accepted', className: 'bg-green-100 text-green-800 border-green-200' },
    meeting_scheduled: { label: 'Meeting Scheduled', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    declined: { label: 'Declined', className: 'bg-red-100 text-red-800 border-red-200' },
    sent: { label: 'Sent', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  };
  const info = map[status] || { label: status, className: 'bg-gray-100 text-gray-800 border-gray-200' };
  return (
    <Badge variant="outline" className={info.className}>
      {info.label}
    </Badge>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function IntroductionsPage() {
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [message, setMessage] = useState(INTRODUCTION_TEMPLATE);
  const [sending, setSending] = useState(false);

  // Fetch matches (admin sees all; we filter to mutual client-side)
  const {
    data: matchesData,
    error: matchesError,
    isLoading: matchesLoading,
  } = useSWR<{ matches: MatchItem[] }>('/api/matches', fetcher);

  // Fetch introductions
  const {
    data: introsData,
    error: introsError,
    isLoading: introsLoading,
    mutate: mutateIntros,
  } = useSWR<{ introductions: IntroductionItem[] }>('/api/introductions', fetcher);

  const introductions = introsData?.introductions || [];
  const allMatches = matchesData?.matches || [];
  const mutualMatches = allMatches.filter((m) => m.status === 'interested');

  // Derive stats from introductions
  const stats = useMemo(() => {
    const sent = introductions.filter((i) => i.status === 'pending').length;
    const pending = introductions.filter((i) => i.status === 'pending').length;
    const accepted = introductions.filter(
      (i) => i.status === 'accepted' || i.status === 'meeting_scheduled'
    ).length;
    const completed = introductions.filter((i) => i.status === 'completed').length;
    const declined = introductions.filter((i) => i.status === 'declined').length;
    const total = introductions.length;
    const successRate = total > 0 ? Math.round(((accepted + completed) / total) * 100) : 0;
    return { sent, pending, accepted, completed, declined, successRate };
  }, [introductions]);

  // Find selected match details
  const selectedMatch = mutualMatches.find((m) => m.id === selectedMatchId);

  const handleSendIntroduction = async () => {
    if (!selectedMatchId || !message.trim()) {
      toast.error('Please select a match and write a message.');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/admin/introductions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match_id: selectedMatchId, message: message.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to send introduction');
      }

      toast.success('Introduction sent!', {
        description: 'Both parties have been notified.',
      });

      setSelectedMatchId('');
      setMessage(INTRODUCTION_TEMPLATE);
      mutateIntros();
    } catch (err) {
      toast.error('Failed to send introduction', {
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setSending(false);
    }
  };

  const isLoading = matchesLoading || introsLoading;
  const hasError = matchesError || introsError;

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#7B1E3A] animate-spin mx-auto mb-4" />
          <p className="text-[#6B5B5E]">Loading introductions...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#2D1318] mb-2">Failed to Load</h2>
          <p className="text-[#6B5B5E]">
            Could not load introduction data. Please refresh the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-serif text-[#2D1318] flex items-center gap-3">
            <MessageSquareHeart className="w-8 h-8 text-[#7B1E3A]" />
            Introduction Manager
          </h1>
          <p className="text-[#6B5B5E] mt-1">
            Create personalized introductions and track their progress.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#F5E0E8]/50">
          <div className="flex items-center gap-2 text-[#6B5B5E] mb-1">
            <Send className="w-4 h-4" />
            <span className="text-sm">Sent</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#F5E0E8]/50">
          <div className="flex items-center gap-2 text-[#6B5B5E] mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Pending</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#F5E0E8]/50">
          <div className="flex items-center gap-2 text-[#6B5B5E] mb-1">
            <Heart className="w-4 h-4" />
            <span className="text-sm">Accepted</span>
          </div>
          <p className="text-2xl font-bold text-pink-600">{stats.accepted}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#F5E0E8]/50">
          <div className="flex items-center gap-2 text-[#6B5B5E] mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Completed</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#F5E0E8]/50">
          <div className="flex items-center gap-2 text-[#6B5B5E] mb-1">
            <XCircle className="w-4 h-4" />
            <span className="text-sm">Declined</span>
          </div>
          <p className="text-2xl font-bold text-gray-600">{stats.declined}</p>
        </div>
      </div>

      {/* Success Rate Banner */}
      <div className="bg-gradient-to-r from-[#C9956B] to-[#E3C4A8] rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Introduction Success Rate
              </h2>
              <p className="text-white/80 text-sm">
                Based on introductions that led to mutual interest
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-white">{stats.successRate}%</p>
            <p className="text-white/80 text-sm">
              {stats.accepted + stats.completed} of {introductions.length} successful
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="bg-[#F5E0E8]/50 p-1">
          <TabsTrigger
            value="create"
            className="data-[state=active]:bg-white data-[state=active]:text-[#7B1E3A]"
          >
            Create Introduction
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-white data-[state=active]:text-[#7B1E3A]"
          >
            Introduction History
          </TabsTrigger>
        </TabsList>

        {/* Create Tab */}
        <TabsContent value="create">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Introduction Form */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F5E0E8]/50">
              <h3 className="font-semibold font-serif text-[#2D1318] mb-6 text-lg">
                New Introduction
              </h3>

              <div className="space-y-5">
                {/* Match Selection */}
                <div>
                  <label className="text-sm font-medium text-[#2D1318] mb-2 block">
                    Select Match
                  </label>
                  <Select value={selectedMatchId} onValueChange={setSelectedMatchId}>
                    <SelectTrigger className="border-[#E3C4A8] focus:border-[#7B1E3A]">
                      <SelectValue placeholder="Choose a mutual match..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mutualMatches.length > 0 ? (
                        mutualMatches.map((match) => (
                          <SelectItem key={match.id} value={match.id}>
                            {match.profile.name} - {match.compatibilityScore}% compatible
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No mutual matches available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-[#6B5B5E] mt-1">
                    Only matches with mutual interest are shown
                  </p>
                </div>

                {/* Match ID Manual Input */}
                <div>
                  <label className="text-sm font-medium text-[#2D1318] mb-2 block">
                    Or enter Match ID directly
                  </label>
                  <Input
                    placeholder="e.g. abc123-def456..."
                    value={selectedMatchId}
                    onChange={(e) => setSelectedMatchId(e.target.value)}
                    className="border-[#E3C4A8] focus:border-[#7B1E3A]"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="text-sm font-medium text-[#2D1318] mb-2 block">
                    Introduction Message
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="border-[#E3C4A8] focus:border-[#7B1E3A] min-h-[200px] resize-y"
                    placeholder="Write a personalized introduction message..."
                  />
                  <p className="text-xs text-[#6B5B5E] mt-1">
                    {message.length} characters
                  </p>
                </div>

                {/* Send Button */}
                <Button
                  onClick={handleSendIntroduction}
                  disabled={!selectedMatchId || !message.trim() || sending}
                  className="w-full bg-[#7B1E3A] hover:bg-[#5C1229] text-white h-12"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Introduction...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Introduction
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Right Side: Selected Match Preview & Tips */}
            <div className="space-y-6">
              {/* Selected Match Profile Preview */}
              {selectedMatch ? (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F5E0E8]/50">
                  <h3 className="font-semibold text-[#2D1318] mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-[#7B1E3A]" />
                    Match Preview
                  </h3>
                  <div className="bg-[#FFF8F0] rounded-xl p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-[#F5E0E8] flex items-center justify-center text-[#7B1E3A] font-bold text-xl">
                        {selectedMatch.profile.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#2D1318]">
                          {selectedMatch.profile.name}
                        </h4>
                        <p className="text-sm text-[#6B5B5E]">
                          {selectedMatch.profile.age && `${selectedMatch.profile.age} years old`}
                          {selectedMatch.profile.location && ` - ${selectedMatch.profile.location}`}
                        </p>
                        <p className="text-sm text-[#6B5B5E]">
                          {selectedMatch.profile.occupation}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-2 bg-[#F5E0E8] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#7B1E3A] rounded-full"
                          style={{ width: `${selectedMatch.compatibilityScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-[#7B1E3A]">
                        {selectedMatch.compatibilityScore}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {selectedMatch.profile.education && (
                        <div>
                          <span className="text-[#6B5B5E]">Education:</span>
                          <p className="text-[#2D1318] font-medium">
                            {selectedMatch.profile.education}
                          </p>
                        </div>
                      )}
                      {selectedMatch.profile.religion && (
                        <div>
                          <span className="text-[#6B5B5E]">Religion:</span>
                          <p className="text-[#2D1318] font-medium">
                            {selectedMatch.profile.religion}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F5E0E8]/50">
                  <div className="text-center py-6">
                    <User className="w-12 h-12 text-[#F5E0E8] mx-auto mb-3" />
                    <p className="text-[#6B5B5E] text-sm">
                      Select a match to preview both profiles side by side
                    </p>
                  </div>
                </div>
              )}

              {/* Tips Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F5E0E8]/50">
                <h3 className="font-semibold text-[#2D1318] mb-4">
                  Introduction Tips
                </h3>
                <ul className="space-y-3 text-sm text-[#6B5B5E]">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Personalize each introduction with specific compatibility points
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Highlight shared values and lifestyle preferences
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Suggest conversation starters based on common interests
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Keep the tone warm, professional, and encouraging
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Mention the compatibility score to build confidence
                  </li>
                </ul>
              </div>

              {/* Ready to Introduce */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F5E0E8]/50">
                <h3 className="font-semibold text-[#2D1318] mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#7B1E3A]" />
                  Ready to Introduce
                </h3>
                {mutualMatches.length > 0 ? (
                  <div className="space-y-3">
                    {mutualMatches.slice(0, 5).map((match) => (
                      <button
                        key={match.id}
                        onClick={() => setSelectedMatchId(match.id)}
                        className="w-full flex items-center justify-between p-3 bg-[#FFF8F0] rounded-xl hover:bg-[#F5E0E8]/50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#F5E0E8] flex items-center justify-center text-[#7B1E3A] font-semibold text-sm border-2 border-white">
                            {match.profile.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#2D1318]">
                              {match.profile.name}
                            </p>
                            <p className="text-xs text-[#6B5B5E]">
                              {match.compatibilityScore}% compatible
                            </p>
                          </div>
                        </div>
                        <Send className="w-4 h-4 text-[#C9956B]" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#6B5B5E] text-center py-4">
                    No mutual matches waiting for introduction
                  </p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <div className="bg-white rounded-2xl shadow-sm border border-[#F5E0E8]/50 overflow-hidden">
            {introductions.length > 0 ? (
              <div className="divide-y divide-[#F5E0E8]">
                {introductions.map((intro) => (
                  <div
                    key={intro.id}
                    className="p-5 hover:bg-[#FFF8F0]/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#F5E0E8] flex items-center justify-center text-[#7B1E3A] font-bold text-lg">
                          {intro.matchName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#2D1318]">
                            {intro.matchName}
                          </h4>
                          <p className="text-sm text-[#6B5B5E] mt-0.5">
                            Sent on {formatDate(intro.createdAt)}
                          </p>
                          {intro.message && (
                            <p className="text-sm text-[#6B5B5E] mt-1 line-clamp-2 max-w-lg">
                              {intro.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {statusBadge(intro.status)}
                        {intro.updatedAt && intro.updatedAt !== intro.createdAt && (
                          <span className="text-xs text-[#6B5B5E]">
                            Updated {formatDate(intro.updatedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <MessageSquareHeart className="w-16 h-16 text-[#F5E0E8] mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-[#2D1318] mb-2">
                  No Introductions Yet
                </h2>
                <p className="text-[#6B5B5E] max-w-md mx-auto">
                  Create your first introduction from the Create tab to get started.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
