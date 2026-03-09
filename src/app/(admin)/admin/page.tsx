'use client';

import { StatsCard } from '@/components/admin/stats-card';
import {
  Users,
  ShieldCheck,
  Heart,
  TrendingUp,
  DollarSign,
  UserPlus,
  Send,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import useSWR from 'swr';

interface AdminStats {
  totalProfiles: number;
  totalProfilesTrend: number;
  pendingVerifications: number;
  pendingVerificationsTrend: number;
  activeMatches: number;
  activeMatchesTrend: number;
  successRate: number;
  successRateTrend: number;
  revenue: number;
  revenueTrend: number;
  newSignupsThisWeek: number;
  introductionsSent: number;
  meetingsScheduled: number;
}

interface StatsResponse {
  stats: AdminStats;
}

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
});

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(amount);
}

function QuickActionCard({
  title,
  count,
  description,
  href,
  icon: Icon,
  color,
}: {
  title: string;
  count: number;
  description: string;
  href: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl p-5 shadow-sm border border-[#F5E0E8]/50 hover:shadow-md transition-all group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <ArrowRight className="w-5 h-5 text-[#6B5B5E] group-hover:text-[#7B1E3A] transition-colors" />
      </div>
      <h3 className="font-semibold text-[#2D1318] font-serif">{title}</h3>
      <p className="text-2xl font-bold text-[#7B1E3A] mt-1">{count}</p>
      <p className="text-xs text-[#6B5B5E] mt-1">{description}</p>
    </Link>
  );
}

function StatsLoadingSkeleton() {
  return (
    <div className="p-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-9 w-80 bg-[#F5E0E8]/60 rounded-lg animate-pulse" />
        <div className="h-5 w-96 bg-[#F5E0E8]/40 rounded-lg animate-pulse mt-2" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 shadow-sm border border-[#F5E0E8]/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-4 w-24 bg-[#F5E0E8]/60 rounded animate-pulse" />
                <div className="h-8 w-20 bg-[#F5E0E8]/80 rounded animate-pulse mt-3" />
                <div className="h-3 w-28 bg-[#F5E0E8]/40 rounded animate-pulse mt-3" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#F5E0E8]/50 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 shadow-sm border border-[#F5E0E8]/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#F5E0E8]/50 animate-pulse" />
              <div className="w-5 h-5 rounded bg-[#F5E0E8]/30 animate-pulse" />
            </div>
            <div className="h-5 w-32 bg-[#F5E0E8]/60 rounded animate-pulse" />
            <div className="h-7 w-12 bg-[#F5E0E8]/80 rounded animate-pulse mt-2" />
            <div className="h-3 w-24 bg-[#F5E0E8]/40 rounded animate-pulse mt-2" />
          </div>
        ))}
      </div>

      {/* Overview sidebar skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-[#F5E0E8]/50 p-6">
          <div className="h-6 w-40 bg-[#F5E0E8]/60 rounded animate-pulse mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#FFF8F0] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F5E0E8]/50 animate-pulse" />
                  <div className="h-4 w-28 bg-[#F5E0E8]/50 rounded animate-pulse" />
                </div>
                <div className="h-5 w-8 bg-[#F5E0E8]/70 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-[#F5E0E8]/50 p-6">
          <div className="h-6 w-36 bg-[#F5E0E8]/60 rounded animate-pulse mb-4" />
          <div className="aspect-[4/3] bg-[#FFF8F0] rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="p-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-[#F5E0E8]/50 text-center max-w-md">
          <div className="p-4 rounded-full bg-red-50 w-fit mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-[#2D1318] font-serif mb-2">
            Failed to Load Dashboard
          </h2>
          <p className="text-[#6B5B5E] mb-6">
            We couldn&apos;t fetch the latest stats. Please check your connection and try again.
          </p>
          <Button
            onClick={onRetry}
            className="bg-[#7B1E3A] hover:bg-[#5C1229] text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data, error, isLoading, mutate } = useSWR<StatsResponse>(
    '/api/admin/stats',
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 60000, // refresh every 60s
    }
  );

  // Time-of-day greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (isLoading) {
    return <StatsLoadingSkeleton />;
  }

  if (error || !data) {
    return <ErrorState onRetry={() => mutate()} />;
  }

  const stats = data.stats;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2D1318] font-serif">
          {greeting}, Matchmaker!
        </h1>
        <p className="text-[#6B5B5E] mt-1">
          Here&apos;s what&apos;s happening with your matchmaking service today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatsCard
          title="Total Profiles"
          value={stats.totalProfiles}
          icon={Users}
          trend={stats.totalProfilesTrend}
        />
        <StatsCard
          title="Pending Verification"
          value={stats.pendingVerifications}
          icon={ShieldCheck}
          trend={stats.pendingVerificationsTrend}
        />
        <StatsCard
          title="Active Matches"
          value={stats.activeMatches}
          icon={Heart}
          trend={stats.activeMatchesTrend}
        />
        <StatsCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          icon={TrendingUp}
          trend={stats.successRateTrend}
        />
        <StatsCard
          title="Revenue"
          value={formatCurrency(stats.revenue)}
          icon={DollarSign}
          trend={stats.revenueTrend}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <QuickActionCard
          title="Verification Queue"
          count={stats.pendingVerifications}
          description="Profiles awaiting verification"
          href="/admin/verification"
          icon={ShieldCheck}
          color="bg-yellow-100 text-yellow-600"
        />
        <QuickActionCard
          title="New Signups"
          count={stats.newSignupsThisWeek}
          description="This week"
          href="/admin/profiles"
          icon={UserPlus}
          color="bg-blue-100 text-blue-600"
        />
        <QuickActionCard
          title="Introductions Sent"
          count={stats.introductionsSent}
          description="This month"
          href="/admin/introductions"
          icon={Send}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-[#F5E0E8]/50 p-6">
          <h2 className="font-semibold text-[#2D1318] mb-4 flex items-center gap-2 font-serif">
            <Calendar className="w-5 h-5 text-[#7B1E3A]" />
            Today&apos;s Overview
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#FFF8F0] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-[#2D1318]">Active Matches</span>
              </div>
              <span className="font-bold text-[#2D1318]">{stats.activeMatches}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#FFF8F0] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                </div>
                <span className="text-sm text-[#2D1318]">Pending Reviews</span>
              </div>
              <span className="font-bold text-[#2D1318]">{stats.pendingVerifications}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#FFF8F0] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm text-[#2D1318]">New Signups This Week</span>
              </div>
              <span className="font-bold text-[#2D1318]">{stats.newSignupsThisWeek}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#FFF8F0] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Send className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm text-[#2D1318]">Meetings Scheduled</span>
              </div>
              <span className="font-bold text-[#2D1318]">{stats.meetingsScheduled}</span>
            </div>
          </div>
        </div>

        {/* Performance Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-[#F5E0E8]/50 p-6">
            <h2 className="font-semibold text-[#2D1318] mb-4 flex items-center gap-2 font-serif">
              <TrendingUp className="w-5 h-5 text-[#7B1E3A]" />
              Match Performance
            </h2>
            <div className="aspect-[4/3] bg-[#FFF8F0] rounded-xl flex items-center justify-center border-2 border-dashed border-[#E3C4A8]">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-[#C9956B] mx-auto mb-2" />
                <p className="text-sm text-[#6B5B5E]">Chart Coming Soon</p>
                <p className="text-xs text-[#6B5B5E] mt-1">
                  Match success trends over time
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#F5E0E8]/50 p-6">
            <h2 className="font-semibold text-[#2D1318] mb-3 flex items-center gap-2 font-serif">
              <Clock className="w-5 h-5 text-[#7B1E3A]" />
              Quick Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#6B5B5E]">Success Rate</span>
                <span className="font-bold text-[#7B1E3A]">{stats.successRate}%</span>
              </div>
              <div className="w-full bg-[#F5E0E8] rounded-full h-2">
                <div
                  className="bg-[#7B1E3A] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.successRate}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-[#6B5B5E]">Introductions Sent</span>
                <span className="font-bold text-[#C9956B]">{stats.introductionsSent}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#7B1E3A] to-[#5C1229] rounded-2xl p-6 text-white">
          <Heart className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-sm opacity-80">Success Rate</p>
          <p className="text-3xl font-bold mt-1">{stats.successRate}%</p>
          <p className="text-sm mt-2 opacity-70">Overall match success</p>
        </div>
        <div className="bg-gradient-to-br from-[#C9956B] to-[#A67744] rounded-2xl p-6 text-white">
          <Users className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-sm opacity-80">Total Profiles</p>
          <p className="text-3xl font-bold mt-1">{stats.totalProfiles}</p>
          <p className="text-sm mt-2 opacity-70">Registered members</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#F5E0E8]/50">
          <Calendar className="w-8 h-8 text-[#7B1E3A] mb-3" />
          <p className="text-sm text-[#6B5B5E]">Scheduled Meetings</p>
          <p className="text-3xl font-bold text-[#2D1318] mt-1">{stats.meetingsScheduled}</p>
          <p className="text-sm text-[#6B5B5E] mt-2">This week</p>
        </div>
      </div>
    </div>
  );
}
