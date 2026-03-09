'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  User,
  Calendar,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VerificationProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  location: string;
  verification_status: string;
  document_type: 'nid' | 'passport';
  document_url: string;
  created_at: string;
}

interface VerificationStats {
  pending: number;
  approvedToday: number;
  rejectedToday: number;
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
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-[#F5E0E8]/50">
      <div className="flex items-center gap-2 text-[#6B5B5E] mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{label}</span>
      </div>
      <p className={cn('text-2xl font-bold', color)}>{value}</p>
    </div>
  );
}

function VerificationCard({
  profile,
  onApprove,
  onReject,
}: {
  profile: VerificationProfile;
  onApprove: (id: string, notes: string) => Promise<void>;
  onReject: (id: string, notes: string) => Promise<void>;
}) {
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeSinceSubmission = (dateString: string) => {
    const submitted = new Date(dateString);
    const now = new Date();
    const hours = Math.floor(
      (now.getTime() - submitted.getTime()) / (1000 * 60 * 60)
    );

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(profile.id, notes);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await onReject(profile.id, notes);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#F5E0E8]/50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-[#FFF8F0] border-b border-[#F5E0E8]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#F5E0E8] flex items-center justify-center text-[#7B1E3A] font-bold text-lg">
              {profile.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-[#2D1318]">{profile.name}</h3>
              <p className="text-sm text-[#6B5B5E]">
                {profile.age} years old &bull;{' '}
                {profile.gender === 'male' ? 'Male' : 'Female'}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-200"
          >
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#F5E0E8]">
        {/* Profile Info */}
        <div className="p-6">
          <h4 className="text-sm font-semibold text-[#7B1E3A] uppercase tracking-wider mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile Information
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[#6B5B5E] w-24">ID:</span>
              <span className="text-[#2D1318] font-medium font-mono text-xs">
                {profile.id.slice(0, 8)}...
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[#6B5B5E] w-24">Name:</span>
              <span className="text-[#2D1318] font-medium">{profile.name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[#6B5B5E] w-24">Age:</span>
              <span className="text-[#2D1318] font-medium">{profile.age}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[#6B5B5E] w-24">Gender:</span>
              <span className="text-[#2D1318] font-medium capitalize">
                {profile.gender}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[#6B5B5E] w-24">Location:</span>
              <span className="text-[#2D1318] font-medium">
                {profile.location}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[#6B5B5E] w-24">Submitted:</span>
              <span className="text-[#2D1318] font-medium">
                {getTimeSinceSubmission(profile.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Document Preview */}
        <div className="p-6">
          <h4 className="text-sm font-semibold text-[#7B1E3A] uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Document ({profile.document_type.toUpperCase()})
          </h4>
          <div className="aspect-[3/2] bg-[#F5E0E8] rounded-xl flex items-center justify-center border-2 border-dashed border-[#C9956B]">
            <div className="text-center">
              <FileText className="w-12 h-12 text-[#7B1E3A] mx-auto mb-2" />
              <p className="text-sm text-[#6B5B5E]">
                {profile.document_type === 'nid'
                  ? 'National ID Card'
                  : 'Passport'}
              </p>
              {profile.document_url && (
                <Button
                  variant="link"
                  className="text-[#7B1E3A] hover:text-[#5C1229] mt-2"
                  asChild
                >
                  <a href={profile.document_url} target="_blank" rel="noreferrer">
                    View Full Document
                  </a>
                </Button>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-[#6B5B5E]">
            <Calendar className="w-3 h-3" />
            Uploaded: {formatDate(profile.created_at)}
          </div>
        </div>
      </div>

      {/* Notes & Actions */}
      <div className="p-6 bg-[#FFF8F0]/50 border-t border-[#F5E0E8]">
        <div className="mb-4">
          <label className="text-sm font-medium text-[#2D1318] mb-2 block">
            Review Notes (Optional)
          </label>
          <Textarea
            placeholder="Add notes about this verification (visible to admin only)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border-[#E3C4A8] focus:border-[#7B1E3A] focus:ring-[#7B1E3A]/20 resize-none"
            rows={2}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleApprove}
            disabled={isProcessing}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Approve
          </Button>
          <Button
            onClick={handleReject}
            disabled={isProcessing}
            variant="outline"
            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            Reject
          </Button>
        </div>

        <div className="mt-3 flex items-start gap-2 text-xs text-[#6B5B5E]">
          <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
          <p>
            Please verify that the name and photo on the document match the
            profile information before approving.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton loaders
// ---------------------------------------------------------------------------

function StatSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-[#F5E0E8]/50 animate-pulse">
      <div className="h-4 w-20 bg-[#F5E0E8] rounded mb-2" />
      <div className="h-7 w-10 bg-[#F5E0E8] rounded" />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#F5E0E8]/50 shadow-sm overflow-hidden animate-pulse">
      <div className="px-6 py-4 bg-[#FFF8F0] border-b border-[#F5E0E8]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#F5E0E8]" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-[#F5E0E8] rounded" />
            <div className="h-3 w-24 bg-[#F5E0E8] rounded" />
          </div>
        </div>
      </div>
      <div className="p-6 space-y-3">
        <div className="h-4 w-full bg-[#F5E0E8] rounded" />
        <div className="h-4 w-3/4 bg-[#F5E0E8] rounded" />
        <div className="h-4 w-1/2 bg-[#F5E0E8] rounded" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function VerificationPage() {
  const [statsLocal, setStatsLocal] = useState<VerificationStats>({
    pending: 0,
    approvedToday: 0,
    rejectedToday: 0,
  });

  // Fetch pending verification profiles
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<{ profiles: VerificationProfile[] }>(
    '/api/admin/profiles?verification_status=pending',
    fetcher,
    { revalidateOnFocus: false }
  );

  const profiles = data?.profiles ?? [];

  // Keep local stat counts in sync with fetched data
  const pendingCount = profiles.length;
  const approvedToday = statsLocal.approvedToday;
  const rejectedToday = statsLocal.rejectedToday;

  // ------- Actions ------- //

  const handleApprove = async (id: string, notes: string) => {
    try {
      const res = await fetch(`/api/admin/profiles/${id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', notes }),
      });

      if (!res.ok) throw new Error('Failed to approve');

      toast.success('Profile verification approved', {
        description:
          'The user has been notified and their profile is now active.',
      });

      setStatsLocal((prev) => ({
        ...prev,
        approvedToday: prev.approvedToday + 1,
      }));

      // Optimistically remove from list and revalidate
      mutate(
        (current) =>
          current
            ? { profiles: current.profiles.filter((p) => p.id !== id) }
            : current,
        { revalidate: true }
      );
    } catch {
      toast.error('Failed to approve verification', {
        description: 'Please try again or contact support.',
      });
    }
  };

  const handleReject = async (id: string, notes: string) => {
    try {
      const res = await fetch(`/api/admin/profiles/${id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', notes }),
      });

      if (!res.ok) throw new Error('Failed to reject');

      toast.error('Profile verification rejected', {
        description:
          'The user has been notified to resubmit their documents.',
      });

      setStatsLocal((prev) => ({
        ...prev,
        rejectedToday: prev.rejectedToday + 1,
      }));

      mutate(
        (current) =>
          current
            ? { profiles: current.profiles.filter((p) => p.id !== id) }
            : current,
        { revalidate: true }
      );
    } catch {
      toast.error('Failed to reject verification', {
        description: 'Please try again or contact support.',
      });
    }
  };

  // ------- Render ------- //

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-serif text-[#2D1318] flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-[#7B1E3A]" />
            Verification Queue
          </h1>
          <p className="text-[#6B5B5E] mt-1">
            Review and verify user identity documents to activate their profiles.
          </p>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={Clock}
            label="Pending"
            value={pendingCount}
            color="text-yellow-600"
          />
          <StatCard
            icon={CheckCircle}
            label="Approved Today"
            value={approvedToday}
            color="text-green-600"
          />
          <StatCard
            icon={XCircle}
            label="Rejected Today"
            value={rejectedToday}
            color="text-red-600"
          />
        </div>
      )}

      {/* Verification Guidelines */}
      <div className="bg-[#F5E0E8]/30 rounded-2xl p-6 mb-8 border border-[#F5E0E8]">
        <h2 className="font-semibold text-[#7B1E3A] mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Verification Guidelines
        </h2>
        <ul className="grid md:grid-cols-2 gap-2 text-sm text-[#6B5B5E]">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            Name on document must match profile name
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            Photo should be clearly visible and match profile photos
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            Document should not be expired
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            All text and details should be legible
          </li>
          <li className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            Reject if document appears altered or tampered
          </li>
          <li className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            Reject if age doesn&apos;t match stated profile age
          </li>
        </ul>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center mb-8">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-red-800 mb-1">
            Failed to load verifications
          </h2>
          <p className="text-red-600 text-sm mb-4">
            There was an error fetching the verification queue. Please try again.
          </p>
          <Button
            onClick={() => mutate()}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {/* Verification Cards */}
      {!isLoading && !error && profiles.length > 0 && (
        <div className="space-y-6">
          {profiles.map((profile) => (
            <VerificationCard
              key={profile.id}
              profile={profile}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && profiles.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-[#F5E0E8]/50">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-[#2D1318] mb-2">
            All Caught Up!
          </h2>
          <p className="text-[#6B5B5E] max-w-md mx-auto">
            There are no pending verifications at the moment. New submissions
            will appear here automatically.
          </p>
          <Button
            variant="outline"
            className="mt-6 border-[#E3C4A8] text-[#7B1E3A] hover:bg-[#F5E0E8]"
            onClick={() => mutate()}
          >
            Refresh Queue
          </Button>
        </div>
      )}
    </div>
  );
}
