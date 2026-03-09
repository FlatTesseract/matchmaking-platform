"use client";

import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-[#F5E0E8]/60",
        className
      )}
    />
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white rounded-2xl shadow-sm border border-[#FECDD3]/50 overflow-hidden", className)}>
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function MatchCardSkeleton() {
  return <CardSkeleton />;
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#FECDD3]/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-16 mb-1" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-4 lg:p-8 space-y-8">
      <Skeleton className="h-32 rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <MatchCardSkeleton key={i} />
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-[#FECDD3]/50 p-4">
          <Skeleton className="h-6 w-32 mb-4" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 py-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MatchesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <MatchCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="p-4 lg:p-8">
      <div className="bg-white rounded-3xl shadow-sm border border-[#FECDD3]/50 overflow-hidden mb-8">
        <Skeleton className="h-32 rounded-none" />
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row gap-6 -mt-16">
            <Skeleton className="w-32 h-32 rounded-full" />
            <div className="flex-1 pt-8 space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full max-w-md" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function IntroductionsSkeleton() {
  return (
    <div className="p-4 lg:p-8 space-y-8">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="max-w-3xl space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-32 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MessagesSkeleton() {
  return (
    <div className="h-[calc(100vh-64px)] lg:h-screen flex flex-col">
      <div className="bg-white border-b border-[#FECDD3]/50 p-4 lg:p-6">
        <Skeleton className="h-7 w-32 mb-1" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={cn("flex gap-2", i % 2 === 0 ? "justify-start" : "justify-end")}>
            {i % 2 === 0 && <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />}
            <Skeleton className={cn("h-16 rounded-2xl", i % 2 === 0 ? "w-3/5" : "w-2/5")} />
            {i % 2 !== 0 && <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-[#FECDD3]/50 overflow-hidden">
        <div className="p-4 border-b border-[#F5E0E8]">
          <div className="flex gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-4 border-b border-[#F5E0E8] last:border-0">
            <div className="flex gap-4 items-center">
              <Skeleton className="w-10 h-10 rounded-full" />
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="h-4 flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { Skeleton };
