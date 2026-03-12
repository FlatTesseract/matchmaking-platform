"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ProgressBar } from "./progress-bar";
import { StepBasicInfo, type BasicInfoValues } from "./step-basic-info";
import { StepEducation, type EducationValues } from "./step-education";
import { StepFamily, type FamilyValues } from "./step-family";
import { StepValues, type ValuesValues } from "./step-values";
import { StepLifestyle, type LifestyleValues } from "./step-lifestyle";
import { StepPersonality, type PersonalityValues } from "./step-personality";
import { StepPreferences, type PreferencesValues } from "./step-preferences";
import { StepPhotos, type PhotosValues } from "./step-photos";
import { StepVerification, type VerificationValues } from "./step-verification";
import { StepReview } from "./step-review";
import { useProfile } from "@/hooks/useProfile";

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

function mapBasicInfo(data: BasicInfoValues) {
  return {
    created_by: data.profileCreatedBy,
    basic_info: {
      name: data.fullName,
      date_of_birth:
        data.dateOfBirth instanceof Date
          ? data.dateOfBirth.toISOString().split("T")[0]
          : undefined,
      gender: data.gender,
      location: data.city,
    },
  };
}

function mapEducation(data: EducationValues) {
  return {
    education_career: {
      education_level: data.highestEducation,
      institution: data.institution,
      field_of_study: data.fieldOfStudy,
      occupation: data.occupation,
      company: data.company || undefined,
      years_of_experience: data.yearsExperience,
      career_aspiration: data.careerAspiration,
      work_life_balance: String(data.workLifeBalance),
    },
  };
}

function mapFamily(data: FamilyValues) {
  const parsedSiblings = Number.parseInt(data.siblingsCount, 10);
  return {
    family_background: {
      family_type: data.familyType,
      father_occupation: data.fatherOccupation,
      mother_occupation: data.motherOccupation,
      siblings: Number.isNaN(parsedSiblings) ? data.siblingsCount : String(parsedSiblings),
      religious_practice: data.religiousPractice,
      socioeconomic: data.socioeconomic || undefined,
    },
  };
}

function mapValues(data: ValuesValues) {
  return {
    values_beliefs: {
      religious_observance: data.religiousObservance,
      gender_roles: data.genderRoles,
      financial_management: data.financialManagement,
      decision_making: data.decisionMaking,
      living_with_inlaws: data.livingWithInLaws,
      working_after_marriage: data.workingAfterMarriage,
    },
  };
}

function mapLifestyle(data: LifestyleValues) {
  return {
    lifestyle: {
      routine: data.dailyRoutine,
      social_style: data.socialStyle,
      hobbies: data.hobbies,
      health_fitness: data.healthFitness,
      travel: data.travelPreference,
      diet: data.dietaryPreference,
    },
  };
}

function mapPersonality(data: PersonalityValues) {
  const wordsSource = typeof data.threeWords === "string" ? data.threeWords : "";

  return {
    personality: {
      self_description: data.selfDescription,
      communication_style: data.communicationStyle,
      conflict_resolution: data.conflictResolution,
      love_language: data.loveLanguage,
      friend_words: wordsSource
        .split(",")
        .map((word) => word.trim())
        .filter(Boolean)
        .slice(0, 3),
    },
  };
}

function mapPreferences(data: PreferencesValues) {
  return {
    partner_preferences: {
      age_min: data.ageRange[0],
      age_max: data.ageRange[1],
      education_min: data.educationMinimum,
      location_preferences: data.locationPreferences,
      must_haves: data.mustHaves,
      deal_breakers: data.dealBreakers,
      nice_to_haves: data.niceToHaves,
      openness: String(data.openness),
    },
  };
}

export function ProfileWizard() {
  const router = useRouter();
  const { profile, updateProfile, uploadPhoto, uploadDocument, submitProfile } = useProfile();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [isSaving, setIsSaving] = useState(false);

  // Pre-fill from existing profile data
  useEffect(() => {
    if (profile) {
      const data: ProfileData = {};
      if (profile.basic_info && Object.keys(profile.basic_info).length > 0) {
        data.basicInfo = profile.basic_info;
      }
      if (profile.education_career && Object.keys(profile.education_career).length > 0) {
        data.education = profile.education_career;
      }
      if (profile.family_background && Object.keys(profile.family_background).length > 0) {
        data.family = profile.family_background;
      }
      if (profile.values_beliefs && Object.keys(profile.values_beliefs).length > 0) {
        data.values = profile.values_beliefs;
      }
      if (profile.lifestyle && Object.keys(profile.lifestyle).length > 0) {
        data.lifestyle = profile.lifestyle;
      }
      if (profile.personality && Object.keys(profile.personality).length > 0) {
        data.personality = profile.personality;
      }
      if (profile.partner_preferences && Object.keys(profile.partner_preferences).length > 0) {
        data.preferences = profile.partner_preferences;
      }
      setProfileData(data);
    }
  }, [profile]);

  const updateProfileData = useCallback(<K extends keyof ProfileData>(
    key: K,
    data: ProfileData[K]
  ) => {
    setProfileData((prev) => ({ ...prev, [key]: data }));
  }, []);

  const markStepComplete = useCallback((step: number) => {
    setCompletedSteps((prev) =>
      prev.includes(step) ? prev : [...prev, step]
    );
  }, []);

  const goToNextStep = useCallback(() => {
    markStepComplete(currentStep);
    setCurrentStep((prev) => Math.min(prev + 1, 10));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep, markStepComplete]);

  const goToPrevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Save draft to the database
  const handleSaveDraft = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const updatePayload: Record<string, unknown> = {};
      if (profileData.basicInfo) Object.assign(updatePayload, mapBasicInfo(profileData.basicInfo));
      if (profileData.education) Object.assign(updatePayload, mapEducation(profileData.education));
      if (profileData.family) Object.assign(updatePayload, mapFamily(profileData.family));
      if (profileData.values) Object.assign(updatePayload, mapValues(profileData.values));
      if (profileData.lifestyle) Object.assign(updatePayload, mapLifestyle(profileData.lifestyle));
      if (profileData.personality) Object.assign(updatePayload, mapPersonality(profileData.personality));
      if (profileData.preferences) Object.assign(updatePayload, mapPreferences(profileData.preferences));

      if (Object.keys(updatePayload).length > 0) {
        await updateProfile(updatePayload);
      }
      toast.success("Draft saved successfully!", {
        description: "You can continue later from where you left off.",
      });
    } catch {
      toast.error("Failed to save draft. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Save step data to the server
  const saveStepToServer = async (payload: Record<string, unknown>) => {
    try {
      await updateProfile(payload);
    } catch {
      // Silently fail on auto-save - user can manually save draft
    }
  };

  const handleSubmit = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      // Save all data first
      const updatePayload: Record<string, unknown> = {};
      if (profileData.basicInfo) Object.assign(updatePayload, mapBasicInfo(profileData.basicInfo));
      if (profileData.education) Object.assign(updatePayload, mapEducation(profileData.education));
      if (profileData.family) Object.assign(updatePayload, mapFamily(profileData.family));
      if (profileData.values) Object.assign(updatePayload, mapValues(profileData.values));
      if (profileData.lifestyle) Object.assign(updatePayload, mapLifestyle(profileData.lifestyle));
      if (profileData.personality) Object.assign(updatePayload, mapPersonality(profileData.personality));
      if (profileData.preferences) Object.assign(updatePayload, mapPreferences(profileData.preferences));

      if (Object.keys(updatePayload).length > 0) {
        await updateProfile(updatePayload);
      }

      // Submit the profile
      await submitProfile();

      toast.success("Profile submitted!", {
        description: "Redirecting to payment...",
      });

      router.push("/payment");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit profile";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Step handlers
  const handleBasicInfo = (data: BasicInfoValues) => {
    updateProfileData("basicInfo", data);
    saveStepToServer(mapBasicInfo(data));
    goToNextStep();
  };

  const handleEducation = (data: EducationValues) => {
    updateProfileData("education", data);
    saveStepToServer(mapEducation(data));
    goToNextStep();
  };

  const handleFamily = (data: FamilyValues) => {
    updateProfileData("family", data);
    saveStepToServer(mapFamily(data));
    goToNextStep();
  };

  const handleValues = (data: ValuesValues) => {
    updateProfileData("values", data);
    saveStepToServer(mapValues(data));
    goToNextStep();
  };

  const handleLifestyle = (data: LifestyleValues) => {
    updateProfileData("lifestyle", data);
    saveStepToServer(mapLifestyle(data));
    goToNextStep();
  };

  const handlePersonality = (data: PersonalityValues) => {
    updateProfileData("personality", data);
    saveStepToServer(mapPersonality(data));
    goToNextStep();
  };

  const handlePreferences = (data: PreferencesValues) => {
    updateProfileData("preferences", data);
    saveStepToServer(mapPreferences(data));
    goToNextStep();
  };

  const dataUrlToFile = (dataUrl: unknown, filename: string): File => {
    if (typeof dataUrl !== "string") {
      throw new Error("Invalid file data");
    }

    const [header, base64] = dataUrl.split(",");

    if (!header || !base64) {
      throw new Error("Invalid file data");
    }

    const mime = header.match(/:(.*?);/)?.[1] || "image/jpeg";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new File([bytes], filename, { type: mime });
  };

  const handlePhotos = async (data: PhotosValues) => {
    updateProfileData("photos", data);
    if (data.primaryPhoto) {
      try {
        const file = dataUrlToFile(data.primaryPhoto, "primary.jpg");
        await uploadPhoto(file);
        toast.success("Photo uploaded!");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to upload photo";
        toast.error(message);
      }
    }
    if (data.additionalPhotos) {
      for (let i = 0; i < data.additionalPhotos.length; i++) {
        const photoData = data.additionalPhotos[i];
        if (typeof photoData !== "string") continue;

        try {
          const file = dataUrlToFile(photoData, `additional-${i}.jpg`);
          await uploadPhoto(file);
        } catch {
          // Continue uploading remaining photos
        }
      }
    }
    goToNextStep();
  };

  const handleVerification = async (data: VerificationValues) => {
    updateProfileData("verification", data);

    const apiDocumentType = data.documentType === "national-id" ? "nid" : data.documentType;

    if (data.documentImage) {
      try {
        const file = dataUrlToFile(data.documentImage, "verification-doc.jpg");
        await uploadDocument(file, apiDocumentType);
        toast.success("Document uploaded!");
        goToNextStep();
        return;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to upload document";
        toast.error(message);
        return;
      }
    }

    goToNextStep();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepBasicInfo defaultValues={profileData.basicInfo} onNext={handleBasicInfo} />;
      case 2:
        return <StepEducation defaultValues={profileData.education} onNext={handleEducation} onBack={goToPrevStep} />;
      case 3:
        return <StepFamily defaultValues={profileData.family} onNext={handleFamily} onBack={goToPrevStep} />;
      case 4:
        return <StepValues defaultValues={profileData.values} onNext={handleValues} onBack={goToPrevStep} />;
      case 5:
        return <StepLifestyle defaultValues={profileData.lifestyle} onNext={handleLifestyle} onBack={goToPrevStep} />;
      case 6:
        return <StepPersonality defaultValues={profileData.personality} onNext={handlePersonality} onBack={goToPrevStep} />;
      case 7:
        return <StepPreferences defaultValues={profileData.preferences} onNext={handlePreferences} onBack={goToPrevStep} />;
      case 8:
        return <StepPhotos defaultValues={profileData.photos} onNext={handlePhotos} onBack={goToPrevStep} />;
      case 9:
        return <StepVerification defaultValues={profileData.verification} onNext={handleVerification} onBack={goToPrevStep} />;
      case 10:
        return (
          <StepReview
            profileData={profileData}
            onEdit={goToStep}
            onSubmit={handleSubmit}
            onBack={goToPrevStep}
            isSubmitting={isSaving}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="mb-8">
        <ProgressBar currentStep={currentStep} completedSteps={completedSteps} />
      </div>

      <div className="flex justify-end mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSaveDraft}
          disabled={isSaving}
          className="text-warm-gray hover:text-burgundy hover:bg-soft-rose"
        >
          {isSaving ? (
            <>
              <span className="h-4 w-4 border-2 border-warm-gray/30 border-t-warm-gray rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </>
          )}
        </Button>
      </div>

      <div className="bg-white rounded-[16px] shadow-[var(--shadow-md)] border border-rose-muted/50 p-6 md:p-8">
        {renderStep()}
      </div>

      <div className="mt-6 text-center text-sm text-warm-gray md:hidden">
        Step {currentStep} of 10
      </div>
    </div>
  );
}
