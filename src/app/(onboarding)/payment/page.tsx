"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CreditCard,
  Smartphone,
  CheckCircle,
  ArrowRight,
  Shield,
  Star,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Plan = "basic" | "premium";
type PaymentMethod = "bkash" | "nagad" | "card";

export default function PaymentPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<Plan>("basic");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const plans = [
    {
      id: "basic" as Plan,
      name: "Basic",
      price: "৳2,000",
      priceValue: 2000,
      description: "One-time signup fee",
      features: [
        "Curated matches by matchmaker",
        "Up to 5 matches per batch",
        "Introduction facilitation",
        "Basic messaging",
      ],
    },
    {
      id: "premium" as Plan,
      name: "Premium",
      price: "৳10,000",
      priceValue: 10000,
      description: "Enhanced matchmaking experience",
      features: [
        "Everything in Basic",
        "Priority matching",
        "Unlimited matches",
        "Dedicated matchmaker support",
        "Profile boost",
        "See who viewed your profile",
      ],
      recommended: true,
    },
  ];

  const methods = [
    { id: "bkash" as PaymentMethod, name: "bKash", icon: Smartphone, color: "bg-pink-500" },
    { id: "nagad" as PaymentMethod, name: "Nagad", icon: Smartphone, color: "bg-orange-500" },
    { id: "card" as PaymentMethod, name: "Card", icon: CreditCard, color: "bg-blue-500" },
  ];

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error("Please select a payment method");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch("/api/payment/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan, method: selectedMethod }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Payment failed");
      }

      setSuccess(true);
      toast.success("Payment successful!");

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Payment failed";
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#2D1318] mb-3">Payment Successful!</h1>
          <p className="text-[#6B5B5E] mb-2">
            Your profile has been submitted for review.
          </p>
          <p className="text-sm text-[#6B5B5E] mb-8">
            Our team will verify your documents within 2-3 business days. You&apos;ll be notified once your profile is active.
          </p>
          <Button
            onClick={() => router.push("/dashboard")}
            className="bg-[#7B1E3A] hover:bg-[#5C1229] text-white rounded-lg px-8"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-[#2D1318] mb-3">
            Choose Your Plan
          </h1>
          <p className="text-[#6B5B5E] max-w-lg mx-auto">
            Complete your payment to submit your profile for review and start receiving curated matches.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={cn(
                "relative text-left rounded-2xl border-2 p-6 transition-all",
                selectedPlan === plan.id
                  ? "border-[#7B1E3A] bg-white shadow-lg"
                  : "border-[#FECDD3]/50 bg-white hover:border-[#C9956B]"
              )}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#C9956B] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" /> Recommended
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#2D1318]">{plan.name}</h3>
                  <p className="text-sm text-[#6B5B5E]">{plan.description}</p>
                </div>
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                  selectedPlan === plan.id ? "border-[#7B1E3A] bg-[#7B1E3A]" : "border-[#E3C4A8]"
                )}>
                  {selectedPlan === plan.id && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-[#2D1318]">{plan.price}</span>
                <span className="text-[#6B5B5E] text-sm ml-1">BDT</span>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-[#6B5B5E]">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#FECDD3]/50 p-6 mb-8">
          <h2 className="text-xl font-serif font-bold text-[#2D1318] mb-4">Payment Method</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {methods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                    selectedMethod === method.id
                      ? "border-[#7B1E3A] bg-[#F5E0E8]"
                      : "border-[#FECDD3]/50 hover:border-[#C9956B]"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white", method.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-[#2D1318]">{method.name}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-sm text-[#6B5B5E] mb-6">
            <Shield className="w-4 h-4 text-emerald-500" />
            This is a simulated payment for demo purposes. No real charges will be made.
          </div>

          <Button
            onClick={handlePayment}
            disabled={!selectedMethod || processing}
            className="w-full bg-[#7B1E3A] hover:bg-[#5C1229] text-white rounded-xl py-6 text-lg"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Simulate Payment - {plans.find((p) => p.id === selectedPlan)?.price}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
