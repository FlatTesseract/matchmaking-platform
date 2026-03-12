"use client";

import { useRef } from "react";
import { 
  CheckCircle, 
  ChevronLeft, 
  Edit, 
  User, 
  GraduationCap, 
  Users, 
  Heart, 
  Coffee, 
  Sparkles, 
  Target, 
  Camera, 
  Shield,
  CreditCard,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import type { BasicInfoValues } from "./step-basic-info";
import type { EducationValues } from "./step-education";
import type { FamilyValues } from "./step-family";
import type { ValuesValues } from "./step-values";
import type { LifestyleValues } from "./step-lifestyle";
import type { PersonalityValues } from "./step-personality";
import type { PreferencesValues } from "./step-preferences";
import type { PhotosValues } from "./step-photos";
import type { VerificationValues } from "./step-verification";

interface ProfileData {
  basicInfo?: BasicInfoValues;
  education?: EducationValues;
  family?: FamilyValues;
  values?: ValuesValues;
  lifestyle?: LifestyleValues;
  personality?: PersonalityValues;
  preferences?: PreferencesValues;
  photos?: PhotosValues;
  verification?: VerificationValues;
}

interface StepReviewProps {
  profileData: ProfileData;
  onEdit: (step: number) => void;
  onSubmit: () => Promise<void> | void;
  onBack: () => void;
  isSubmitting?: boolean;
}

function ReviewSection({
  title,
  icon: Icon,
  step,
  onEdit,
  children,
}: {
  title: string;
  icon: React.ElementType;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[12px] border border-rose-muted/50 overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-soft-rose/30 border-b border-rose-muted/50">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-burgundy" />
          <h3 className="font-semibold text-dark">{title}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(step)}
          className="text-burgundy hover:text-burgundy-dark hover:bg-soft-rose"
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-2">
      <span className="text-warm-gray text-sm sm:w-1/3">{label}</span>
      <span className="text-dark font-medium sm:w-2/3">{value}</span>
    </div>
  );
}

export function StepReview({ profileData, onEdit, onSubmit, onBack, isSubmitting = false }: StepReviewProps) {
  const submitLockRef = useRef(false);

  const handleSubmit = async () => {
    if (isSubmitting || submitLockRef.current) return;

    submitLockRef.current = true;
    try {
      await onSubmit();
    } finally {
      // Keep a tiny delay to absorb accidental rapid re-clicks
      setTimeout(() => {
        submitLockRef.current = false;
      }, 400);
    }
  };

  const formatLabel = (value: unknown) => {
    if (typeof value !== "string") return "-";

    return value
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-bg mb-4">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-dark">
          Review Your Profile
        </h2>
        <p className="text-warm-gray mt-2 max-w-md mx-auto">
          Almost there! Please review your information before submitting.
        </p>
      </div>

      <div className="space-y-4">
        {/* Basic Info */}
        {profileData.basicInfo && (
          <ReviewSection title="Basic Information" icon={User} step={1} onEdit={onEdit}>
            <div className="divide-y divide-rose-muted/30">
              <InfoRow label="Full Name" value={profileData.basicInfo.fullName} />
              <InfoRow 
                label="Date of Birth" 
                value={profileData.basicInfo.dateOfBirth ? format(profileData.basicInfo.dateOfBirth, "PPP") : "-"} 
              />
              <InfoRow label="Gender" value={formatLabel(profileData.basicInfo.gender || "")} />
              <InfoRow label="City" value={formatLabel(profileData.basicInfo.city)} />
              <InfoRow label="Phone" value={profileData.basicInfo.phone} />
              <InfoRow label="Profile Created By" value={formatLabel(profileData.basicInfo.profileCreatedBy)} />
            </div>
          </ReviewSection>
        )}

        {/* Education & Career */}
        {profileData.education && (
          <ReviewSection title="Education & Career" icon={GraduationCap} step={2} onEdit={onEdit}>
            <div className="divide-y divide-rose-muted/30">
              <InfoRow label="Education" value={formatLabel(profileData.education.highestEducation)} />
              <InfoRow label="Institution" value={profileData.education.institution} />
              <InfoRow label="Field of Study" value={profileData.education.fieldOfStudy} />
              <InfoRow label="Occupation" value={profileData.education.occupation} />
              {profileData.education.company && (
                <InfoRow label="Company" value={profileData.education.company} />
              )}
              <InfoRow label="Experience" value={`${profileData.education.yearsExperience} years`} />
              <InfoRow label="Career Aspiration" value={formatLabel(profileData.education.careerAspiration || "")} />
            </div>
          </ReviewSection>
        )}

        {/* Family */}
        {profileData.family && (
          <ReviewSection title="Family Background" icon={Users} step={3} onEdit={onEdit}>
            <div className="divide-y divide-rose-muted/30">
              <InfoRow label="Family Type" value={formatLabel(profileData.family.familyType || "")} />
              <InfoRow label="Father's Occupation" value={profileData.family.fatherOccupation} />
              <InfoRow label="Mother's Occupation" value={profileData.family.motherOccupation} />
              <InfoRow label="Siblings" value={profileData.family.siblingsCount} />
              <InfoRow label="Religious Practice" value={formatLabel(profileData.family.religiousPractice || "")} />
            </div>
          </ReviewSection>
        )}

        {/* Values */}
        {profileData.values && (
          <ReviewSection title="Values & Beliefs" icon={Heart} step={4} onEdit={onEdit}>
            <div className="divide-y divide-rose-muted/30">
              <InfoRow label="Religious Observance" value={formatLabel(profileData.values.religiousObservance || "")} />
              <InfoRow label="Gender Roles" value={formatLabel(profileData.values.genderRoles || "")} />
              <InfoRow label="Financial Management" value={formatLabel(profileData.values.financialManagement || "")} />
              <InfoRow label="Decision Making" value={formatLabel(profileData.values.decisionMaking || "")} />
              <InfoRow label="Living with In-Laws" value={formatLabel(profileData.values.livingWithInLaws || "")} />
              <InfoRow label="Working After Marriage" value={formatLabel(profileData.values.workingAfterMarriage || "")} />
            </div>
          </ReviewSection>
        )}

        {/* Lifestyle */}
        {profileData.lifestyle && (
          <ReviewSection title="Lifestyle" icon={Coffee} step={5} onEdit={onEdit}>
            <div className="divide-y divide-rose-muted/30">
              <InfoRow label="Daily Routine" value={formatLabel(profileData.lifestyle.dailyRoutine || "")} />
              <InfoRow label="Social Style" value={formatLabel(profileData.lifestyle.socialStyle || "")} />
              <InfoRow 
                label="Hobbies" 
                value={
                  <div className="flex flex-wrap gap-1 mt-1 sm:mt-0">
                    {profileData.lifestyle.hobbies.map((hobby) => (
                      <Badge key={hobby} variant="secondary" className="bg-soft-rose text-dark text-xs">
                        {hobby}
                      </Badge>
                    ))}
                  </div>
                } 
              />
              <InfoRow label="Health & Fitness" value={formatLabel(profileData.lifestyle.healthFitness || "")} />
              <InfoRow label="Travel" value={formatLabel(profileData.lifestyle.travelPreference || "")} />
              <InfoRow label="Diet" value={formatLabel(profileData.lifestyle.dietaryPreference)} />
            </div>
          </ReviewSection>
        )}

        {/* Personality */}
        {profileData.personality && (
          <ReviewSection title="Personality" icon={Sparkles} step={6} onEdit={onEdit}>
            <div className="divide-y divide-rose-muted/30">
              <InfoRow label="3 Words" value={profileData.personality.threeWords} />
              <InfoRow label="Communication" value={formatLabel(profileData.personality.communicationStyle || "")} />
              <InfoRow label="Conflict Resolution" value={formatLabel(profileData.personality.conflictResolution || "")} />
              <InfoRow label="Love Language" value={formatLabel(profileData.personality.loveLanguage || "")} />
              <div className="py-2">
                <span className="text-warm-gray text-sm block mb-2">About Me</span>
                <p className="text-dark text-sm leading-relaxed bg-soft-rose/30 rounded-[8px] p-3">
                  {profileData.personality.selfDescription}
                </p>
              </div>
            </div>
          </ReviewSection>
        )}

        {/* Preferences */}
        {profileData.preferences && (
          <ReviewSection title="Partner Preferences" icon={Target} step={7} onEdit={onEdit}>
            <div className="divide-y divide-rose-muted/30">
              <InfoRow label="Age Range" value={`${profileData.preferences.ageRange[0]} - ${profileData.preferences.ageRange[1]} years`} />
              <InfoRow label="Min Education" value={formatLabel(profileData.preferences.educationMinimum)} />
              <InfoRow 
                label="Locations" 
                value={
                  <div className="flex flex-wrap gap-1 mt-1 sm:mt-0">
                    {profileData.preferences.locationPreferences.map((loc) => (
                      <Badge key={loc} variant="secondary" className="bg-soft-rose text-dark text-xs">
                        {loc}
                      </Badge>
                    ))}
                  </div>
                } 
              />
              <InfoRow 
                label="Must-Haves" 
                value={
                  <div className="flex flex-wrap gap-1 mt-1 sm:mt-0">
                    {profileData.preferences.mustHaves.map((item) => (
                      <Badge key={item} variant="secondary" className="bg-burgundy/10 text-burgundy text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                } 
              />
              {profileData.preferences.dealBreakers.length > 0 && (
                <InfoRow 
                  label="Deal-Breakers" 
                  value={
                    <div className="flex flex-wrap gap-1 mt-1 sm:mt-0">
                      {profileData.preferences.dealBreakers.map((item) => (
                        <Badge key={item} variant="secondary" className="bg-destructive/10 text-destructive text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  } 
                />
              )}
            </div>
          </ReviewSection>
        )}

        {/* Photos */}
        {profileData.photos && (
          <ReviewSection title="Photos" icon={Camera} step={8} onEdit={onEdit}>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {profileData.photos.primaryPhoto && (
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-[8px] overflow-hidden border-2 border-gold">
                    <img 
                      src={profileData.photos.primaryPhoto} 
                      alt="Primary" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <p className="text-xs text-center text-gold-dark mt-1">Primary</p>
                </div>
              )}
              {profileData.photos.additionalPhotos.map((photo, index) => (
                <div key={index} className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-[8px] overflow-hidden border border-gold-light">
                    <img 
                      src={photo} 
                      alt={`Photo ${index + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </ReviewSection>
        )}

        {/* Verification */}
        {profileData.verification && (
          <ReviewSection title="Verification" icon={Shield} step={9} onEdit={onEdit}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success-bg flex items-center justify-center">
                <Shield className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-medium text-dark">
                  {profileData.verification.documentType === "national-id" ? "National ID" : "Passport"} uploaded
                </p>
                <p className="text-sm text-warm-gray">Ready for verification</p>
              </div>
            </div>
          </ReviewSection>
        )}
      </div>

      {/* Payment Notice */}
      <div className="bg-gold-light/30 rounded-[16px] p-6 border border-gold">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-6 h-6 text-gold-dark" />
          </div>
          <div>
            <h3 className="font-semibold text-dark mb-1">Profile Submission Fee</h3>
            <p className="text-sm text-warm-gray mb-3">
              A one-time fee of <span className="font-semibold text-dark">৳2,000</span> is required to submit your profile for review. This helps ensure serious participants only.
            </p>
            <p className="text-xs text-warm-gray">
              Payment will be processed after submission via bKash, Nagad, or card.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 h-12 border-2 border-burgundy text-burgundy hover:bg-burgundy hover:text-white font-semibold rounded-[8px] transition-all"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 h-12 bg-gradient-to-r from-burgundy to-burgundy-dark hover:from-burgundy-dark hover:to-burgundy text-white font-semibold rounded-[8px] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </span>
          ) : (
            "Submit Profile"
          )}
        </Button>
      </div>
    </div>
  );
}
