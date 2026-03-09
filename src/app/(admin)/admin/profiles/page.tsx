'use client';

import { useState, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Download,
  Search,
  MoreVertical,
  Eye,
  ShieldCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import useSWR from 'swr';

interface AdminProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  location: string;
  education: string;
  occupation: string;
  status: 'active' | 'pending' | 'inactive' | 'suspended';
  verificationStatus: 'verified' | 'pending' | 'rejected' | 'unsubmitted';
  signupDate: string;
  email: string;
  phone: string;
  photo: string;
}

interface ProfilesResponse {
  profiles: AdminProfile[];
  total: number;
}

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch profiles');
  return res.json();
});

const statusStyles: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  suspended: 'bg-red-100 text-red-800 border-red-200',
};

const verificationStyles: Record<string, string> = {
  verified: 'bg-[#C9956B]/20 text-[#A67744] border-[#C9956B]',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  unsubmitted: 'bg-gray-100 text-gray-600 border-gray-200',
};

const ITEMS_PER_PAGE = 10;

function TableLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filter bar skeleton */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 h-10 bg-[#F5E0E8]/40 rounded-md animate-pulse" />
        <div className="w-full md:w-40 h-10 bg-[#F5E0E8]/40 rounded-md animate-pulse" />
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl border border-[#F5E0E8]/50 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-[#FFF8F0] px-4 py-3 flex gap-4">
          {['w-48', 'w-12', 'w-16', 'w-32', 'w-24', 'w-20', 'w-24', 'w-20'].map((w, i) => (
            <div key={i} className={`h-4 ${w} bg-[#F5E0E8]/60 rounded animate-pulse`} />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="px-4 py-4 border-t border-[#F5E0E8]/30 flex items-center gap-4">
            <div className="flex items-center gap-3 w-48">
              <div className="w-10 h-10 rounded-full bg-[#F5E0E8]/50 animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-4 w-28 bg-[#F5E0E8]/60 rounded animate-pulse" />
                <div className="h-3 w-36 bg-[#F5E0E8]/40 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-4 w-8 bg-[#F5E0E8]/50 rounded animate-pulse" />
            <div className="h-4 w-14 bg-[#F5E0E8]/50 rounded animate-pulse" />
            <div className="h-4 w-28 bg-[#F5E0E8]/50 rounded animate-pulse" />
            <div className="h-4 w-20 bg-[#F5E0E8]/50 rounded animate-pulse" />
            <div className="h-6 w-16 bg-[#F5E0E8]/50 rounded-full animate-pulse" />
            <div className="h-6 w-18 bg-[#F5E0E8]/50 rounded-full animate-pulse" />
            <div className="h-8 w-8 bg-[#F5E0E8]/30 rounded animate-pulse ml-auto" />
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-48 bg-[#F5E0E8]/40 rounded animate-pulse" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-9 h-9 bg-[#F5E0E8]/40 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProfilesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Build the API URL with query params
  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (debouncedSearch) params.set('search', debouncedSearch);
    params.set('page', String(currentPage));
    params.set('limit', String(ITEMS_PER_PAGE));
    return `/api/admin/profiles?${params.toString()}`;
  }, [statusFilter, debouncedSearch, currentPage]);

  const { data, error, isLoading, mutate } = useSWR<ProfilesResponse>(
    buildUrl(),
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Debounce the search to avoid spamming API
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1);
    }, 400);
    setSearchTimeout(timeout);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const profiles = data?.profiles ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Quick stats derived from API response
  const activeCount = profiles.filter((p) => p.status === 'active').length;
  const pendingCount = profiles.filter((p) => p.status === 'pending').length;
  const verifiedCount = profiles.filter((p) => p.verificationStatus === 'verified').length;

  if (error) {
    return (
      <div className="p-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-[#F5E0E8]/50 text-center max-w-md">
            <div className="p-4 rounded-full bg-red-50 w-fit mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-[#2D1318] font-serif mb-2">
              Failed to Load Profiles
            </h2>
            <p className="text-[#6B5B5E] mb-6">
              We couldn&apos;t fetch profiles data. Please check your connection and try again.
            </p>
            <Button
              onClick={() => mutate()}
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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#2D1318] flex items-center gap-3 font-serif">
            <Users className="w-8 h-8 text-[#7B1E3A]" />
            Profiles
          </h1>
          <p className="text-[#6B5B5E] mt-1">
            Manage all user profiles, verification status, and account settings.
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Button
            variant="outline"
            className="border-[#E3C4A8] text-[#7B1E3A] hover:bg-[#F5E0E8]"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-[#7B1E3A] hover:bg-[#5C1229] text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Profile
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#F5E0E8]/50">
          <p className="text-sm text-[#6B5B5E]">Total Profiles</p>
          <p className="text-2xl font-bold text-[#2D1318] mt-1">{total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#F5E0E8]/50">
          <p className="text-sm text-[#6B5B5E]">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#F5E0E8]/50">
          <p className="text-sm text-[#6B5B5E]">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#F5E0E8]/50">
          <p className="text-sm text-[#6B5B5E]">Verified</p>
          <p className="text-2xl font-bold text-[#C9956B] mt-1">{verifiedCount}</p>
        </div>
      </div>

      {/* Filters and Table */}
      {isLoading && !data ? (
        <TableLoadingSkeleton />
      ) : (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5B5E]" />
              <Input
                placeholder="Search by name, email, or location..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 border-[#E3C4A8] focus:border-[#7B1E3A] focus:ring-[#7B1E3A]/20"
              />
            </div>

            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full md:w-40 border-[#E3C4A8]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-[#F5E0E8]/50 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#FFF8F0] hover:bg-[#FFF8F0]">
                  <TableHead className="text-[#2D1318] font-semibold">Name</TableHead>
                  <TableHead className="text-[#2D1318] font-semibold">Age</TableHead>
                  <TableHead className="text-[#2D1318] font-semibold">Gender</TableHead>
                  <TableHead className="text-[#2D1318] font-semibold">Location</TableHead>
                  <TableHead className="text-[#2D1318] font-semibold">Education</TableHead>
                  <TableHead className="text-[#2D1318] font-semibold">Occupation</TableHead>
                  <TableHead className="text-[#2D1318] font-semibold">Status</TableHead>
                  <TableHead className="text-[#2D1318] font-semibold">Verification</TableHead>
                  <TableHead className="text-[#2D1318] font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="w-10 h-10 text-[#6B5B5E]/40" />
                        <p className="text-[#6B5B5E] font-medium">No profiles found</p>
                        <p className="text-sm text-[#6B5B5E]/70">
                          Try adjusting your search or filter criteria.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  profiles.map((profile) => (
                    <TableRow key={profile.id} className="hover:bg-[#FFF8F0]/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#F5E0E8] flex items-center justify-center text-[#7B1E3A] font-semibold shrink-0">
                            {profile.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-[#2D1318] truncate">{profile.name}</p>
                            <p className="text-sm text-[#6B5B5E] truncate">{profile.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#2D1318]">{profile.age}</TableCell>
                      <TableCell className="text-[#2D1318] capitalize">{profile.gender}</TableCell>
                      <TableCell className="text-[#6B5B5E]">{profile.location}</TableCell>
                      <TableCell className="text-[#6B5B5E] max-w-[160px] truncate">
                        {profile.education}
                      </TableCell>
                      <TableCell className="text-[#6B5B5E] max-w-[160px] truncate">
                        {profile.occupation}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('capitalize', statusStyles[profile.status])}
                        >
                          {profile.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('capitalize', verificationStyles[profile.verificationStatus])}
                        >
                          {profile.verificationStatus === 'verified' && (
                            <ShieldCheck className="w-3 h-3 mr-1" />
                          )}
                          {profile.verificationStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4 text-[#6B5B5E]" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="cursor-pointer">
                              <Eye className="w-4 h-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <ShieldCheck className="w-4 h-4 mr-2" />
                              Verify
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-red-600">
                              <UserX className="w-4 h-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#6B5B5E]">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total} profiles
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-[#E3C4A8] hover:bg-[#F5E0E8]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first, last, current, and neighbors
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .reduce<(number | 'ellipsis')[]>((acc, page, idx, arr) => {
                    if (idx > 0) {
                      const prev = arr[idx - 1];
                      if (page - prev > 1) {
                        acc.push('ellipsis');
                      }
                    }
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === 'ellipsis' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-[#6B5B5E]">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={item}
                        variant={currentPage === item ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setCurrentPage(item)}
                        className={cn(
                          currentPage === item
                            ? 'bg-[#7B1E3A] hover:bg-[#5C1229]'
                            : 'border-[#E3C4A8] hover:bg-[#F5E0E8]'
                        )}
                      >
                        {item}
                      </Button>
                    )
                  )}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-[#E3C4A8] hover:bg-[#F5E0E8]"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
