"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Target, ChevronLeft, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const preferencesSchema = z.object({
  ageRange: z.tuple([z.number().min(18), z.number().max(70)]),
  educationMinimum: z.string().min(1, "Please select minimum education"),
  locationPreferences: z.array(z.string()).min(1, "Please select at least one location"),
  mustHaves: z.array(z.string()).min(1, "Please select at least one must-have"),
  dealBreakers: z.array(z.string()),
  niceToHaves: z.array(z.string()),
  openness: z.number().min(1).max(5),
});

export type PreferencesValues = z.infer<typeof preferencesSchema>;

const locations = [
  "Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Abroad (USA/Canada)",
  "Abroad (UK/Europe)", "Abroad (Middle East)", "Abroad (Other)", "Open to anywhere",
];

const mustHaveOptions = [
  "Religious compatibility",
  "Similar education level",
  "Career-oriented",
  "Family-oriented",
  "Good communication",
  "Financial stability",
  "Similar values",
  "Supportive of my career",
  "Emotionally mature",
  "Sense of humor",
];

const dealBreakerOptions = [
  "Smoking",
  "Drinking alcohol",
  "Previous marriage",
  "Has children",
  "Long distance",
  "Different religion",
  "Different sect",
  "Unwilling to relocate",
  "Not family-approved",
];

const niceToHaveOptions = [
  "Similar hobbies",
  "Travel enthusiast",
  "Foodie",
  "Fitness-oriented",
  "Tech-savvy",
  "Artistic",
  "Musical",
  "Good cook",
  "Pet-friendly",
  "Entrepreneurial",
];

interface StepPreferencesProps {
  defaultValues?: Partial<PreferencesValues>;
  onNext: (data: PreferencesValues) => void;
  onBack: () => void;
}

export function StepPreferences({ defaultValues, onNext, onBack }: StepPreferencesProps) {
  const form = useForm<PreferencesValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      ageRange: defaultValues?.ageRange || [24, 32],
      educationMinimum: defaultValues?.educationMinimum || "",
      locationPreferences: defaultValues?.locationPreferences || [],
      mustHaves: defaultValues?.mustHaves || [],
      dealBreakers: defaultValues?.dealBreakers || [],
      niceToHaves: defaultValues?.niceToHaves || [],
      openness: defaultValues?.openness || 3,
    },
  });

  const watchedAgeRange = form.watch("ageRange");
  const ageRange = Array.isArray(watchedAgeRange) && watchedAgeRange.length >= 2 ? watchedAgeRange : [24, 32];
  const openness = form.watch("openness");
  const selectedLocationsRaw = form.watch("locationPreferences");
  const selectedMustHavesRaw = form.watch("mustHaves");
  const selectedDealBreakersRaw = form.watch("dealBreakers");
  const selectedNiceToHavesRaw = form.watch("niceToHaves");

  const selectedLocations = Array.isArray(selectedLocationsRaw) ? selectedLocationsRaw : [];
  const selectedMustHaves = Array.isArray(selectedMustHavesRaw) ? selectedMustHavesRaw : [];
  const selectedDealBreakers = Array.isArray(selectedDealBreakersRaw) ? selectedDealBreakersRaw : [];
  const selectedNiceToHaves = Array.isArray(selectedNiceToHavesRaw) ? selectedNiceToHavesRaw : [];

  const toggleArrayField = (field: "locationPreferences" | "mustHaves" | "dealBreakers" | "niceToHaves", value: string) => {
    const currentRaw = form.getValues(field);
    const current = Array.isArray(currentRaw) ? currentRaw : [];
    if (current.includes(value)) {
      form.setValue(field, current.filter((v) => v !== value), { shouldValidate: true });
    } else {
      form.setValue(field, [...current, value], { shouldValidate: true });
    }
  };

  const getOpennessLabel = (value: number) => {
    const labels = [
      "",
      "Very specific",
      "Somewhat specific",
      "Open to suggestions",
      "Quite flexible",
      "Very flexible",
    ];
    return labels[value] || "Open to suggestions";
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-soft-rose mb-4">
          <Target className="w-8 h-8 text-burgundy" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-dark">
          Partner Preferences
        </h2>
        <p className="text-warm-gray mt-2 max-w-md mx-auto">
          Tell us what you&apos;re looking for. Be honest — it helps us find better matches for you.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-8">
          {/* Age Range */}
          <FormField
            control={form.control}
            name="ageRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-dark font-medium text-base">
                  Preferred Age Range: {ageRange[0]} - {ageRange[1]} years
                </FormLabel>
                <FormControl>
                  <div className="pt-6 pb-2 px-2">
                    <Slider
                      min={18}
                      max={70}
                      step={1}
                      value={field.value}
                      onValueChange={field.onChange}
                      className="w-full"
                    />
                  </div>
                </FormControl>
                <div className="flex justify-between text-sm text-warm-gray">
                  <span>18</span>
                  <span>70</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Education Minimum */}
          <FormField
            control={form.control}
            name="educationMinimum"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-dark font-medium text-base">
                  Minimum Education Level
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 border-gold-light">
                      <SelectValue placeholder="Select minimum education" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="any">Any education level</SelectItem>
                    <SelectItem value="high-school">High School</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="bachelors">Bachelor&apos;s Degree</SelectItem>
                    <SelectItem value="masters">Master&apos;s Degree</SelectItem>
                    <SelectItem value="phd">PhD or higher</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location Preferences */}
          <FormField
            control={form.control}
            name="locationPreferences"
            render={() => (
              <FormItem>
                <FormLabel className="text-dark font-medium text-base">
                  Location Preferences
                </FormLabel>
                <FormDescription className="text-warm-gray text-sm mb-2">
                  Where are you open to finding a match?
                </FormDescription>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {locations.map((location) => (
                      <Badge
                        key={location}
                        variant="outline"
                        className={`cursor-pointer px-3 py-1.5 transition-all ${
                          selectedLocations.includes(location)
                            ? "bg-burgundy text-white border-burgundy"
                            : "border-gold-light text-warm-gray hover:border-burgundy hover:text-burgundy"
                        }`}
                        onClick={() => toggleArrayField("locationPreferences", location)}
                      >
                        {location}
                        {selectedLocations.includes(location) && (
                          <X className="w-3 h-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Must-Haves */}
          <FormField
            control={form.control}
            name="mustHaves"
            render={() => (
              <FormItem>
                <FormLabel className="text-dark font-medium text-base">
                  Must-Haves{" "}
                  <span className="text-warm-gray font-normal">
                    (Select your top priorities)
                  </span>
                </FormLabel>
                <FormDescription className="text-warm-gray text-sm mb-2">
                  What qualities are absolutely essential in your partner?
                </FormDescription>
                <FormControl>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {mustHaveOptions.map((option) => (
                      <label
                        key={option}
                        className={`flex items-center gap-3 p-3 rounded-[8px] border cursor-pointer transition-all ${
                          selectedMustHaves.includes(option)
                            ? "border-burgundy bg-soft-rose/50"
                            : "border-gold-light hover:border-burgundy/50"
                        }`}
                      >
                        <Checkbox
                          checked={selectedMustHaves.includes(option)}
                          onCheckedChange={() => toggleArrayField("mustHaves", option)}
                          className="border-gold data-[state=checked]:bg-burgundy data-[state=checked]:border-burgundy"
                        />
                        <span className="text-sm text-dark">{option}</span>
                      </label>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Deal-Breakers */}
          <FormField
            control={form.control}
            name="dealBreakers"
            render={() => (
              <FormItem>
                <FormLabel className="text-dark font-medium text-base">
                  Deal-Breakers{" "}
                  <span className="text-warm-gray font-normal">(optional)</span>
                </FormLabel>
                <FormDescription className="text-warm-gray text-sm mb-2">
                  Is there anything that&apos;s an absolute no for you?
                </FormDescription>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {dealBreakerOptions.map((option) => (
                      <Badge
                        key={option}
                        variant="outline"
                        className={`cursor-pointer px-3 py-1.5 transition-all ${
                          selectedDealBreakers.includes(option)
                            ? "bg-destructive text-white border-destructive"
                            : "border-gold-light text-warm-gray hover:border-destructive hover:text-destructive"
                        }`}
                        onClick={() => toggleArrayField("dealBreakers", option)}
                      >
                        {option}
                      </Badge>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nice-to-Haves */}
          <FormField
            control={form.control}
            name="niceToHaves"
            render={() => (
              <FormItem>
                <FormLabel className="text-dark font-medium text-base">
                  Nice-to-Haves{" "}
                  <span className="text-warm-gray font-normal">(optional)</span>
                </FormLabel>
                <FormDescription className="text-warm-gray text-sm mb-2">
                  What would be a bonus but isn&apos;t essential?
                </FormDescription>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {niceToHaveOptions.map((option) => (
                      <Badge
                        key={option}
                        variant="outline"
                        className={`cursor-pointer px-3 py-1.5 transition-all ${
                          selectedNiceToHaves.includes(option)
                            ? "bg-gold text-dark border-gold"
                            : "border-gold-light text-warm-gray hover:border-gold hover:text-gold-dark"
                        }`}
                        onClick={() => toggleArrayField("niceToHaves", option)}
                      >
                        {option}
                      </Badge>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Openness Slider */}
          <FormField
            control={form.control}
            name="openness"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-dark font-medium text-base">
                  How flexible are you with these preferences?
                </FormLabel>
                <FormDescription className="text-warm-gray text-sm mb-2">
                  Would you be open to matches outside your stated preferences if they&apos;re a great fit otherwise?
                </FormDescription>
                <FormControl>
                  <div className="pt-2">
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      value={[field.value]}
                      onValueChange={([value]) => field.onChange(value)}
                      className="py-4"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-warm-gray">Strict</span>
                      <span className="text-burgundy font-medium">
                        {getOpennessLabel(openness)}
                      </span>
                      <span className="text-warm-gray">Flexible</span>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
