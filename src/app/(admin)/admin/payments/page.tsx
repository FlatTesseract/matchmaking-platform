'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Receipt,
  Filter,
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

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error('Failed');
    return r.json();
  });

interface PaymentItem {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  method: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  type: string;
  date: string;
  reference: string;
}

interface PaymentsResponse {
  payments: PaymentItem[];
  total: number;
  page: number;
  limit: number;
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    completed: { label: 'Completed', className: 'bg-green-100 text-green-800 border-green-200' },
    pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    failed: { label: 'Failed', className: 'bg-red-100 text-red-800 border-red-200' },
    refunded: { label: 'Refunded', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  };
  const info = map[status] || { label: status, className: 'bg-gray-100 text-gray-800 border-gray-200' };
  return (
    <Badge variant="outline" className={info.className}>
      {info.label}
    </Badge>
  );
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(amount / 100);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatPaymentType(type: string) {
  const map: Record<string, string> = {
    subscription: 'Subscription',
    one_time: 'One-Time',
    introduction_fee: 'Introduction Fee',
    premium: 'Premium',
    refund: 'Refund',
  };
  return map[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatMethod(method: string) {
  const map: Record<string, string> = {
    stripe: 'Stripe',
    paypal: 'PayPal',
    bank_transfer: 'Bank Transfer',
    card: 'Card',
    unknown: 'Unknown',
  };
  return map[method] || method.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const limit = 20;

  // Build query params
  const queryParams = new URLSearchParams();
  queryParams.set('page', String(page));
  queryParams.set('limit', String(limit));
  if (statusFilter !== 'all') queryParams.set('status', statusFilter);
  if (typeFilter !== 'all') queryParams.set('type', typeFilter);

  const {
    data,
    error,
    isLoading,
  } = useSWR<PaymentsResponse>(`/api/admin/payments?${queryParams.toString()}`, fetcher);

  const payments = data?.payments || [];
  const totalPayments = data?.total || 0;
  const totalPages = Math.ceil(totalPayments / limit);

  // Revenue stats computed from current page data
  // For a full implementation, these would come from a dedicated stats endpoint
  const revenueStats = useMemo(() => {
    const completedPayments = payments.filter((p) => p.status === 'completed');
    const pendingPayments = payments.filter((p) => p.status === 'pending');

    const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    const pendingRevenue = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

    const now = new Date();
    const thisMonth = completedPayments.filter((p) => {
      const d = new Date(p.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthlyRevenue = thisMonth.reduce((sum, p) => sum + p.amount, 0);

    const currency = payments[0]?.currency || 'USD';

    return {
      total: totalRevenue,
      monthly: monthlyRevenue,
      pending: pendingRevenue,
      currency,
    };
  }, [payments]);

  // Loading state
  if (isLoading && payments.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#7B1E3A] animate-spin mx-auto mb-4" />
          <p className="text-[#6B5B5E]">Loading payments...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#2D1318] mb-2">Failed to Load</h2>
          <p className="text-[#6B5B5E]">
            Could not load payment data. Please refresh the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif text-[#2D1318] flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-[#7B1E3A]" />
          Payments & Billing
        </h1>
        <p className="text-[#6B5B5E] mt-1">
          Track all transactions, manage billing, and view revenue reports.
        </p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#F5E0E8]/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-green-100 rounded-xl">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-[#6B5B5E]">Total Revenue</span>
          </div>
          <p className="text-3xl font-bold text-[#2D1318]">
            {formatCurrency(revenueStats.total, revenueStats.currency)}
          </p>
          <p className="text-xs text-[#6B5B5E] mt-1">
            From {payments.filter((p) => p.status === 'completed').length} completed payments
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#F5E0E8]/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-[#F5E0E8] rounded-xl">
              <TrendingUp className="w-5 h-5 text-[#7B1E3A]" />
            </div>
            <span className="text-sm text-[#6B5B5E]">This Month</span>
          </div>
          <p className="text-3xl font-bold text-[#2D1318]">
            {formatCurrency(revenueStats.monthly, revenueStats.currency)}
          </p>
          <p className="text-xs text-[#6B5B5E] mt-1">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#F5E0E8]/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-yellow-100 rounded-xl">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm text-[#6B5B5E]">Pending</span>
          </div>
          <p className="text-3xl font-bold text-[#2D1318]">
            {formatCurrency(revenueStats.pending, revenueStats.currency)}
          </p>
          <p className="text-xs text-[#6B5B5E] mt-1">
            {payments.filter((p) => p.status === 'pending').length} pending transactions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#F5E0E8]/50 mb-6">
        <div className="p-4 border-b border-[#F5E0E8] flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-[#6B5B5E]">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[160px] border-[#E3C4A8]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={(val) => {
                setTypeFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px] border-[#E3C4A8]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
                <SelectItem value="one_time">One-Time</SelectItem>
                <SelectItem value="introduction_fee">Introduction Fee</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>

            {(statusFilter !== 'all' || typeFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setPage(1);
                }}
                className="text-[#7B1E3A] hover:bg-[#F5E0E8]"
              >
                Clear Filters
              </Button>
            )}
          </div>
          <p className="text-sm text-[#6B5B5E]">
            {totalPayments} total payment{totalPayments !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Payments Table */}
        {payments.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow className="border-[#F5E0E8] hover:bg-transparent">
                  <TableHead className="text-[#6B5B5E] font-semibold">User</TableHead>
                  <TableHead className="text-[#6B5B5E] font-semibold">Amount</TableHead>
                  <TableHead className="text-[#6B5B5E] font-semibold">Method</TableHead>
                  <TableHead className="text-[#6B5B5E] font-semibold">Type</TableHead>
                  <TableHead className="text-[#6B5B5E] font-semibold">Status</TableHead>
                  <TableHead className="text-[#6B5B5E] font-semibold">Date</TableHead>
                  <TableHead className="text-[#6B5B5E] font-semibold">Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    className="border-[#F5E0E8] hover:bg-[#FFF8F0]/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#F5E0E8] flex items-center justify-center text-[#7B1E3A] font-semibold text-sm flex-shrink-0">
                          {payment.userName.charAt(0)}
                        </div>
                        <span className="font-medium text-[#2D1318]">
                          {payment.userName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-[#2D1318]">
                      {formatCurrency(payment.amount, payment.currency)}
                    </TableCell>
                    <TableCell className="text-[#6B5B5E]">
                      {formatMethod(payment.method)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-[#6B5B5E] bg-[#FFF8F0] px-2 py-1 rounded-md">
                        {formatPaymentType(payment.type)}
                      </span>
                    </TableCell>
                    <TableCell>{statusBadge(payment.status)}</TableCell>
                    <TableCell className="text-[#6B5B5E]">
                      {formatDate(payment.date)}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-[#6B5B5E] font-mono">
                        {payment.reference
                          ? payment.reference.length > 16
                            ? `${payment.reference.slice(0, 16)}...`
                            : payment.reference
                          : '-'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-[#F5E0E8] flex items-center justify-between">
                <p className="text-sm text-[#6B5B5E]">
                  Showing {(page - 1) * limit + 1}-{Math.min(page * limit, totalPayments)} of{' '}
                  {totalPayments}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="border-[#E3C4A8] text-[#7B1E3A] hover:bg-[#F5E0E8]"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className={
                            page === pageNum
                              ? 'bg-[#7B1E3A] hover:bg-[#5C1229] text-white'
                              : 'border-[#E3C4A8] text-[#6B5B5E] hover:bg-[#F5E0E8]'
                          }
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="border-[#E3C4A8] text-[#7B1E3A] hover:bg-[#F5E0E8]"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <Receipt className="w-16 h-16 text-[#F5E0E8] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#2D1318] mb-2">
              No Payments Found
            </h2>
            <p className="text-[#6B5B5E] max-w-md mx-auto">
              {statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No payments match the selected filters. Try adjusting your filters.'
                : 'No payment records yet. Payments will appear here once transactions are made.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
