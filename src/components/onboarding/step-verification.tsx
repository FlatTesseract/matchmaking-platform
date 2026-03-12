"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Shield, ChevronLeft, Upload, X, FileCheck, Lock, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const verificationSchema = z.object({
  documentType: z.enum(["national-id", "passport"], {
    error: "Please select a document type",
  }),
  documentImage: z.string().min(1, "Please upload your verification document"),
});

export type VerificationValues = z.infer<typeof verificationSchema>;

interface StepVerificationProps {
  defaultValues?: Partial<VerificationValues>;
  onNext: (data: VerificationValues) => void;
  onBack: () => void;
}

const ALLOWED_DOC_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_DOC_SIZE_MB = 10;
const MAX_DOC_SIZE_BYTES = MAX_DOC_SIZE_MB * 1024 * 1024;

function validateDocumentFile(file: File): boolean {
  if (!ALLOWED_DOC_TYPES.includes(file.type)) {
    toast.error("Unsupported document format", {
      description: "Please upload JPG, PNG, WebP, or PDF.",
    });
    return false;
  }

  if (file.size > MAX_DOC_SIZE_BYTES) {
    toast.error("Document too large", {
      description: `Please upload a document under ${MAX_DOC_SIZE_MB}MB.`,
    });
    return false;
  }

  return true;
}

export function StepVerification({ defaultValues, onNext, onBack }: StepVerificationProps) {
  const [documentPreview, setDocumentPreview] = useState<string | null>(defaultValues?.documentImage || null);
  const [dragOver, setDragOver] = useState(false);

  const form = useForm<VerificationValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      documentType: defaultValues?.documentType || "national-id",
      documentImage: defaultValues?.documentImage || "",
    },
  });

  const documentType = form.watch("documentType");

  const handleDocument = useCallback((file: File) => {
    if (!file || !validateDocumentFile(file)) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setDocumentPreview(result);
      form.setValue("documentImage", result, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  }, [form]);

  const removeDocument = () => {
    setDocumentPreview(null);
    form.setValue("documentImage", "", { shouldValidate: true });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleDocument(file);
  }, [handleDocument]);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-soft-rose mb-4">
          <Shield className="w-8 h-8 text-burgundy" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-dark">
          Identity Verification
        </h2>
        <p className="text-warm-gray mt-2 max-w-md mx-auto">
          Verification builds trust. Help us ensure everyone on the platform is genuine.
        </p>
      </div>

      {/* Why Verify Section */}
      <div className="bg-soft-rose/50 rounded-[16px] p-6 border border-rose-muted space-y-4">
        <h3 className="font-semibold text-dark flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-burgundy" />
          Why we verify identities
        </h3>
        <div className="grid gap-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-success-bg flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="font-medium text-dark">Builds Trust</p>
              <p className="text-warm-gray">Every verified profile has been confirmed as a real person.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-success-bg flex items-center justify-center flex-shrink-0">
              <Eye className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="font-medium text-dark">Serious Matches Only</p>
              <p className="text-warm-gray">Verification ensures everyone is committed to finding a partner.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-success-bg flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="font-medium text-dark">Your Document is Private</p>
              <p className="text-warm-gray">Only seen by our verification team. Never shown to matches.</p>
            </div>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-8">
          {/* Document Type Selection */}
          <FormField
            control={form.control}
            name="documentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-dark font-medium text-base">
                  Select Document Type
                </FormLabel>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <label
                    className={cn(
                      "flex flex-col items-center p-6 rounded-[12px] border-2 cursor-pointer transition-all",
                      field.value === "national-id"
                        ? "border-burgundy bg-soft-rose/50"
                        : "border-gold-light hover:border-burgundy/50"
                    )}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      value="national-id"
                      checked={field.value === "national-id"}
                      onChange={() => field.onChange("national-id")}
                    />
                    <div className="w-12 h-12 rounded-full bg-soft-rose flex items-center justify-center mb-3">
                      <FileCheck className={cn("w-6 h-6", field.value === "national-id" ? "text-burgundy" : "text-warm-gray")} />
                    </div>
                    <span className="font-medium text-dark">National ID</span>
                    <span className="text-xs text-warm-gray mt-1">NID Card</span>
                  </label>
                  
                  <label
                    className={cn(
                      "flex flex-col items-center p-6 rounded-[12px] border-2 cursor-pointer transition-all",
                      field.value === "passport"
                        ? "border-burgundy bg-soft-rose/50"
                        : "border-gold-light hover:border-burgundy/50"
                    )}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      value="passport"
                      checked={field.value === "passport"}
                      onChange={() => field.onChange("passport")}
                    />
                    <div className="w-12 h-12 rounded-full bg-soft-rose flex items-center justify-center mb-3">
                      <FileCheck className={cn("w-6 h-6", field.value === "passport" ? "text-burgundy" : "text-warm-gray")} />
                    </div>
                    <span className="font-medium text-dark">Passport</span>
                    <span className="text-xs text-warm-gray mt-1">Valid passport</span>
                  </label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Document Upload */}
          <FormField
            control={form.control}
            name="documentImage"
            render={() => (
              <FormItem>
                <FormLabel className="text-dark font-medium text-base">
                  Upload {documentType === "national-id" ? "National ID" : "Passport"}
                </FormLabel>
                <FormDescription className="text-warm-gray text-sm mb-3">
                  Please upload a clear photo or scan of your {documentType === "national-id" ? "NID (front side)" : "passport photo page"}.
                </FormDescription>

                {documentPreview ? (
                  <div className="relative max-w-sm mx-auto">
                    <div className="aspect-[3/2] rounded-[12px] border-2 border-gold overflow-hidden bg-white flex items-center justify-center">
                      {documentPreview.startsWith("data:application/pdf") ? (
                        <div className="text-center px-4">
                          <FileCheck className="w-10 h-10 text-burgundy mx-auto mb-2" />
                          <p className="text-sm text-dark font-medium">PDF selected</p>
                          <p className="text-xs text-warm-gray">Document ready for upload</p>
                        </div>
                      ) : (
                        <img
                          src={documentPreview}
                          alt="Document preview"
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={removeDocument}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-destructive text-white rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-success text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                      <FileCheck className="w-3 h-3" />
                      Uploaded
                    </div>
                  </div>
                ) : (
                  <label
                    className={cn(
                      "flex flex-col items-center justify-center max-w-sm mx-auto aspect-[3/2] border-2 border-dashed rounded-[12px] cursor-pointer transition-all",
                      dragOver
                        ? "border-burgundy bg-soft-rose/50"
                        : "border-gold-light hover:border-burgundy hover:bg-soft-rose/30"
                    )}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-10 h-10 text-warm-gray mb-3" />
                    <span className="text-sm font-medium text-dark">
                      Drag & drop or click to upload
                    </span>
                    <span className="text-xs text-warm-gray mt-1">
                      JPG, PNG, or PDF up to 10MB
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDocument(file);
                      }}
                    />
                  </label>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Privacy Assurance */}
          <div className="bg-cream rounded-[12px] p-4 border border-gold-light flex items-start gap-3">
            <Lock className="w-5 h-5 text-burgundy mt-0.5 flex-shrink-0" />
            <p className="text-sm text-warm-gray">
              <span className="font-medium text-dark">Privacy guaranteed:</span> Your document is encrypted and stored securely. It is only accessed by our verification team and is never shared with other users or third parties.
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1 h-12 border-2 border-burgundy text-burgundy hover:bg-burgundy hover:text-white font-semibold rounded-[8px] transition-all"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 bg-burgundy hover:bg-burgundy-dark text-white font-semibold rounded-[8px] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]"
            >
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
