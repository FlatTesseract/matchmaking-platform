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
    setIsSaving(true);
    try {
      const updatePayload: Record<string, unknown> = {};
      if (profileData.basicInfo) updatePayload.basic_info = profileData.basicInfo;
      if (profileData.education) updatePayload.education_career = profileData.education;
      if (profileData.family) updatePayload.family_background = profileData.family;
      if (profileData.values) updatePayload.values_beliefs = profileData.values;
      if (profileData.lifestyle) updatePayload.lifestyle = profileData.lifestyle;
      if (profileData.personality) updatePayload.personality = profileData.personality;
      if (profileData.preferences) updatePayload.partner_preferences = profileData.preferences;

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
  const saveStepToServer = async (section: string, data: unknown) => {
    try {
      await updateProfile({ [section]: data });
    } catch {
      // Silently fail on auto-save - user can manually save draft
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      // Save all data first
      const updatePayload: Record<string, unknown> = {};
      if (profileData.basicInfo) updatePayload.basic_info = profileData.basicInfo;
      if (profileData.education) updatePayload.education_career = profileData.education;
      if (profileData.family) updatePayload.family_background = profileData.family;
      if (profileData.values) updatePayload.values_beliefs = profileData.values;
      if (profileData.lifestyle) updatePayload.lifestyle = profileData.lifestyle;
      if (profileData.personality) updatePayload.personality = profileData.personality;
      if (profileData.preferences) updatePayload.partner_preferences = profileData.preferences;

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
    saveStepToServer("basic_info", data);
    goToNextStep();
  };

  const handleEducation = (data: EducationValues) => {
    updateProfileData("education", data);
    saveStepToServer("education_career", data);
    goToNextStep();
  };

  const handleFamily = (data: FamilyValues) => {
    updateProfileData("family", data);
    saveStepToServer("family_background", data);
    goToNextStep();
  };

  const handleValues = (data: ValuesValues) => {
    updateProfileData("values", data);
    saveStepToServer("values_beliefs", data);
    goToNextStep();
  };

  const handleLifestyle = (data: LifestyleValues) => {
    updateProfileData("lifestyle", data);
    saveStepToServer("lifestyle", data);
    goToNextStep();
  };

  const handlePersonality = (data: PersonalityValues) => {
    updateProfileData("personality", data);
    saveStepToServer("personality", data);
    goToNextStep();
  };

  const handlePreferences = (data: PreferencesValues) => {
    updateProfileData("preferences", data);
    saveStepToServer("partner_preferences", data);
    goToNextStep();
  };

  const dataUrlToFile = (dataUrl: string, filename: string): File => {
    const [header, base64] = dataUrl.split(",");

    if (!header || !base64) {
      throw new Error("Invalid image data");
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
        try {
          const file = dataUrlToFile(data.additionalPhotos[i], `additional-${i}.jpg`);
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
    if (data.documentImage) {
      try {
        const file = dataUrlToFile(data.documentImage, "verification-doc.jpg");
        await uploadDocument(file, data.documentType || "nid");
        toast.success("Document uploaded!");
      } catch {
        toast.error("Failed to upload document");
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
        return <StepReview profileData={profileData} onEdit={goToStep} onSubmit={handleSubmit} onBack={goToPrevStep} />;
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
