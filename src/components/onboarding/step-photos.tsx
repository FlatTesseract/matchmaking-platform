"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Camera, ChevronLeft, Upload, X, Star, Image as ImageIcon, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const photosSchema = z.object({
  primaryPhoto: z.string().min(1, "Please upload a primary photo"),
  additionalPhotos: z.array(z.string()).max(5, "Maximum 5 additional photos"),
});

export type PhotosValues = z.infer<typeof photosSchema>;

interface StepPhotosProps {
  defaultValues?: Partial<PhotosValues>;
  onNext: (data: PhotosValues) => void;
  onBack: () => void;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function validateImageFile(file: File): boolean {
  if (!ALLOWED_TYPES.includes(file.type)) {
    toast.error("Unsupported image format", {
      description: "Please upload JPG, PNG, or WebP images.",
    });
    return false;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    toast.error("Image too large", {
      description: `Please upload an image under ${MAX_FILE_SIZE_MB}MB.`,
    });
    return false;
  }

  return true;
}

export function StepPhotos({ defaultValues, onNext, onBack }: StepPhotosProps) {
  const [primaryPreview, setPrimaryPreview] = useState<string | null>(defaultValues?.primaryPhoto || null);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>(defaultValues?.additionalPhotos || []);
  const [dragOver, setDragOver] = useState(false);

  const form = useForm<PhotosValues>({
    resolver: zodResolver(photosSchema),
    defaultValues: {
      primaryPhoto: defaultValues?.primaryPhoto || "",
      additionalPhotos: defaultValues?.additionalPhotos || [],
    },
  });

  const handlePrimaryPhoto = useCallback((file: File) => {
    if (!file || !validateImageFile(file)) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPrimaryPreview(result);
      form.setValue("primaryPhoto", result, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  }, [form]);

  const handleAdditionalPhoto = useCallback((file: File) => {
    if (!file || additionalPreviews.length >= 5 || !validateImageFile(file)) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const newPreviews = [...additionalPreviews, result];
      setAdditionalPreviews(newPreviews);
      form.setValue("additionalPhotos", newPreviews, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  }, [additionalPreviews, form]);

  const removeAdditionalPhoto = (index: number) => {
    const newPreviews = additionalPreviews.filter((_, i) => i !== index);
    setAdditionalPreviews(newPreviews);
    form.setValue("additionalPhotos", newPreviews, { shouldValidate: true });
  };

  const removePrimaryPhoto = () => {
    setPrimaryPreview(null);
    form.setValue("primaryPhoto", "", { shouldValidate: true });
  };

  const handleDrop = useCallback((e: React.DragEvent, type: "primary" | "additional") => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (type === "primary") {
      handlePrimaryPhoto(file);
    } else {
      handleAdditionalPhoto(file);
    }
  }, [handlePrimaryPhoto, handleAdditionalPhoto]);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-soft-rose mb-4">
          <Camera className="w-8 h-8 text-burgundy" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-dark">
          Add Your Photos
        </h2>
        <p className="text-warm-gray mt-2 max-w-md mx-auto">
          A picture speaks a thousand words. Upload photos that show the real you.
        </p>
      </div>

      {/* Photo Guidelines */}
      <div className="bg-soft-rose/50 rounded-[12px] p-4 border border-rose-muted">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-burgundy mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-dark mb-1">Photo Guidelines</p>
            <ul className="text-warm-gray space-y-0.5">
              <li>• Recent photos (within last 6 months)</li>
              <li>• Face clearly visible, good lighting</li>
              <li>• Smart casual or traditional attire</li>
              <li>• No heavy filters or sunglasses</li>
            </ul>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-8">
          {/* Primary Photo */}
          <FormField
            control={form.control}
            name="primaryPhoto"
            render={() => (
              <FormItem>
                <FormLabel className="text-dark font-medium text-base flex items-center gap-2">
                  <Star className="w-4 h-4 text-gold" />
                  Primary Photo
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormDescription className="text-warm-gray text-sm mb-3">
                  This will be the first photo potential matches see.
                </FormDescription>
                
                {primaryPreview ? (
                  <div className="relative w-48 h-48 mx-auto">
                    <img
                      src={primaryPreview}
                      alt="Primary photo preview"
                      className="w-full h-full object-cover rounded-[12px] border-2 border-gold"
                    />
                    <button
                      type="button"
                      onClick={removePrimaryPhoto}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-destructive text-white rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-gold text-dark text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Primary
                    </div>
                  </div>
                ) : (
                  <label
                    className={cn(
                      "flex flex-col items-center justify-center w-48 h-48 mx-auto border-2 border-dashed rounded-[12px] cursor-pointer transition-all",
                      dragOver
                        ? "border-burgundy bg-soft-rose/50"
                        : "border-gold-light hover:border-burgundy hover:bg-soft-rose/30"
                    )}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => handleDrop(e, "primary")}
                  >
                    <Upload className="w-8 h-8 text-warm-gray mb-2" />
                    <span className="text-sm text-warm-gray text-center px-4">
                      Drag & drop or click to upload
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePrimaryPhoto(file);
                      }}
                    />
                  </label>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Additional Photos */}
          <FormField
            control={form.control}
            name="additionalPhotos"
            render={() => (
              <FormItem>
                <FormLabel className="text-dark font-medium text-base flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-burgundy" />
                  Additional Photos
                  <span className="text-warm-gray font-normal">(up to 5)</span>
                </FormLabel>
                <FormDescription className="text-warm-gray text-sm mb-3">
                  Add more photos to showcase different sides of you.
                </FormDescription>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {/* Existing photos */}
                  {additionalPreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={preview}
                        alt={`Additional photo ${index + 1}`}
                        className="w-full h-full object-cover rounded-[8px] border border-gold-light"
                      />
                      <button
                        type="button"
                        onClick={() => removeAdditionalPhoto(index)}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Upload placeholder */}
                  {additionalPreviews.length < 5 && (
                    <label
                      className={cn(
                        "aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-[8px] cursor-pointer transition-all",
                        "border-gold-light hover:border-burgundy hover:bg-soft-rose/30"
                      )}
                    >
                      <Upload className="w-5 h-5 text-warm-gray mb-1" />
                      <span className="text-xs text-warm-gray">Add</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAdditionalPhoto(file);
                        }}
                      />
                    </label>
                  )}

                  {/* Empty slots */}
                  {Array.from({ length: Math.max(0, 4 - additionalPreviews.length) }).map((_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="aspect-square border border-dashed border-rose-muted rounded-[8px] bg-soft-rose/20"
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Privacy Note */}
          <div className="bg-cream rounded-[12px] p-4 border border-gold-light">
            <p className="text-sm text-warm-gray">
              <span className="font-medium text-dark">Privacy note:</span> Your photos are only shown to matches curated by the matchmaker, never in public search results.
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
