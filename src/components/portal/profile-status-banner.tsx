"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  FileEdit,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type ProfileStatus = "draft" | "pending_payment" | "pending_verification" | "active" | "suspended";

interface ProfileStatusBannerProps {
  status: ProfileStatus;
  className?: string;
}

const statusConfig: Record<
  ProfileStatus,
  {
    icon: typeof FileEdit;
    title: string;
    description: string;
    bgClass: string;
    textClass: string;
    action?: { label: string; href: string };
  }
> = {
  draft: {
    icon: FileEdit,
    title: "Complete your profile to get started",
    description: "Fill in your details and upload photos to submit your profile for review.",
    bgClass: "bg-[#C9956B]/10 border-[#C9956B]/30",
    textClass: "text-[#C9956B]",
    action: { label: "Complete Profile", href: "/create-profile" },
  },
  pending_payment: {
    icon: CreditCard,
    title: "Pay to submit your profile for review",
    description: "Complete your payment to activate your profile and start receiving matches.",
    bgClass: "bg-yellow-50 border-yellow-200",
    textClass: "text-yellow-700",
    action: { label: "Make Payment", href: "/payment" },
  },
  pending_verification: {
    icon: Clock,
    title: "Your profile is being reviewed by our team",
    description: "We're verifying your documents. This usually takes 2-3 business days.",
    bgClass: "bg-blue-50 border-blue-200",
    textClass: "text-blue-700",
  },
  active: {
    icon: CheckCircle,
    title: "Your profile is active!",
    description: "Check your matches and start connecting with potential partners.",
    bgClass: "bg-emerald-50 border-emerald-200",
    textClass: "text-emerald-700",
    action: { label: "View Matches", href: "/matches" },
  },
  suspended: {
    icon: AlertTriangle,
    title: "Your profile has been suspended",
    description: "Please contact support for more information about your account status.",
    bgClass: "bg-red-50 border-red-200",
    textClass: "text-red-700",
  },
};

export function ProfileStatusBanner({ status, className }: ProfileStatusBannerProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn("rounded-2xl border p-5", config.bgClass, className)}>
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0", config.bgClass)}>
          <Icon className={cn("w-6 h-6", config.textClass)} />
        </div>
        <div className="flex-1">
          <h3 className={cn("font-semibold font-serif text-lg", config.textClass)}>
            {config.title}
          </h3>
          <p className="text-sm text-[#6B5B5E] mt-0.5">{config.description}</p>
        </div>
        {config.action && (
          <Link href={config.action.href}>
            <Button
              className={cn(
                "rounded-lg whitespace-nowrap",
                status === "active"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-[#7B1E3A] hover:bg-[#5C1229] text-white"
              )}
            >
              {config.action.label}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
