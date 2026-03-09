"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Eye, EyeOff, UserPlus, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  profileFor: z.enum(["self", "family"], {
    error: "Please select who this profile is for",
  }),
  acceptTerms: z.literal(true, {
    error: "You must accept the terms and conditions",
  }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      profileFor: "self",
      acceptTerms: false as unknown as true,
    },
  });

  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        form.setError("root", { message: result.error || "Signup failed" });
        return;
      }

      // Redirect to profile creation
      window.location.href = "/create-profile";
    } catch {
      form.setError("root", { message: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-serif text-2xl font-bold text-dark">
          Begin Your Journey
        </h1>
        <p className="text-warm-gray">
          Create an account to find your perfect match
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {form.formState.errors.root && (
            <div className="p-3 rounded-[8px] bg-red-50 border border-red-200 text-red-700 text-sm">
              {form.formState.errors.root.message}
            </div>
          )}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-dark font-medium">
                  Full Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your full name"
                    className="h-12 border-gold-light focus:border-burgundy"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-dark font-medium">
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="h-12 border-gold-light focus:border-burgundy"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-dark font-medium">
                  Phone Number
                </FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="+880 1XXX-XXXXXX"
                    className="h-12 border-gold-light focus:border-burgundy"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-dark font-medium">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className="h-12 border-gold-light focus:border-burgundy pr-12"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray hover:text-dark transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Profile For Radio Group */}
          <FormField
            control={form.control}
            name="profileFor"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-dark font-medium">
                  Creating profile for
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                  >
                    <label
                      className={`flex-1 flex items-center gap-3 p-4 rounded-[8px] border-2 cursor-pointer transition-all ${
                        field.value === "self"
                          ? "border-burgundy bg-soft-rose/50"
                          : "border-gold-light hover:border-burgundy/50"
                      }`}
                    >
                      <RadioGroupItem value="self" id="self" />
                      <div>
                        <p className="font-medium text-dark">Myself</p>
                        <p className="text-sm text-warm-gray">
                          I&apos;m looking for my partner
                        </p>
                      </div>
                    </label>
                    <label
                      className={`flex-1 flex items-center gap-3 p-4 rounded-[8px] border-2 cursor-pointer transition-all ${
                        field.value === "family"
                          ? "border-burgundy bg-soft-rose/50"
                          : "border-gold-light hover:border-burgundy/50"
                      }`}
                    >
                      <RadioGroupItem value="family" id="family" />
                      <div>
                        <p className="font-medium text-dark">Family Member</p>
                        <p className="text-sm text-warm-gray">
                          For my child/sibling
                        </p>
                      </div>
                    </label>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Terms Checkbox */}
          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-1 border-gold data-[state=checked]:bg-burgundy data-[state=checked]:border-burgundy"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm text-warm-gray font-normal cursor-pointer">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-burgundy hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-burgundy hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-burgundy hover:bg-burgundy-dark text-white font-semibold rounded-[8px] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Create Account
              </span>
            )}
          </Button>
        </form>
      </Form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-rose-muted" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-warm-gray">
            Already have an account?
          </span>
        </div>
      </div>

      {/* Login Link */}
      <div className="text-center">
        <Link
          href="/login"
          className="text-burgundy font-semibold hover:text-burgundy-dark transition-colors"
        >
          Sign in instead
        </Link>
      </div>
    </div>
  );
}
