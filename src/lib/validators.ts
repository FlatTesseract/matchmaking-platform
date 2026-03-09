import { z } from "zod/v4";

// ============================================================
// Auth Schemas
// ============================================================
export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  profileFor: z.enum(["self", "family"]),
});

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// ============================================================
// Profile Section Schemas
// ============================================================
export const basicInfoSchema = z.object({
  name: z.string().min(2).optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
  location: z.string().optional(),
  height: z.string().optional(),
  religion: z.string().optional(),
});

export const educationCareerSchema = z.object({
  education_level: z.string().optional(),
  institution: z.string().optional(),
  field_of_study: z.string().optional(),
  occupation: z.string().optional(),
  company: z.string().optional(),
  years_of_experience: z.number().optional(),
  career_aspiration: z
    .enum(["ambitious", "stable", "flexible"])
    .optional(),
  work_life_balance: z.string().optional(),
});

export const familyBackgroundSchema = z.object({
  family_type: z.enum(["nuclear", "joint", "extended"]).optional(),
  father_occupation: z.string().optional(),
  mother_occupation: z.string().optional(),
  father_education: z.string().optional(),
  mother_education: z.string().optional(),
  siblings: z.string().optional(),
  religious_practice: z.string().optional(),
  socioeconomic: z.string().optional(),
});

export const valuesBeliefsSchema = z.object({
  religious_observance: z
    .enum(["practicing", "moderate", "cultural"])
    .optional(),
  gender_roles: z.string().optional(),
  financial_management: z
    .enum(["joint", "separate", "hybrid"])
    .optional(),
  decision_making: z
    .enum(["independent", "collaborative", "family-involved"])
    .optional(),
  living_with_inlaws: z.string().optional(),
  working_after_marriage: z.string().optional(),
});

export const lifestyleSchema = z.object({
  routine: z.string().optional(),
  social_style: z.enum(["introvert", "extrovert", "ambivert"]).optional(),
  hobbies: z.array(z.string()).optional(),
  health_fitness: z.string().optional(),
  travel: z.string().optional(),
  diet: z.string().optional(),
});

export const personalitySchema = z.object({
  self_description: z.string().optional(),
  communication_style: z.string().optional(),
  conflict_resolution: z.string().optional(),
  love_language: z.string().optional(),
  friend_words: z.array(z.string()).max(3).optional(),
});

export const partnerPreferencesSchema = z.object({
  age_min: z.number().min(18).optional(),
  age_max: z.number().max(80).optional(),
  height_min: z.string().optional(),
  height_max: z.string().optional(),
  education_min: z.string().optional(),
  location_preferences: z.array(z.string()).optional(),
  must_haves: z.array(z.string()).optional(),
  deal_breakers: z.array(z.string()).optional(),
  nice_to_haves: z.array(z.string()).optional(),
  openness: z.string().optional(),
});

// Full profile update schema
export const profileUpdateSchema = z.object({
  created_by: z.enum(["self", "parent", "sibling", "other"]).optional(),
  basic_info: basicInfoSchema.optional(),
  education_career: educationCareerSchema.optional(),
  family_background: familyBackgroundSchema.optional(),
  values_beliefs: valuesBeliefsSchema.optional(),
  lifestyle: lifestyleSchema.optional(),
  personality: personalitySchema.optional(),
  partner_preferences: partnerPreferencesSchema.optional(),
});

// ============================================================
// Match/Introduction Schemas
// ============================================================
export const expressInterestSchema = z.object({
  note: z.string().optional(),
});

export const passMatchSchema = z.object({
  reason: z.string().optional(),
});

export const respondIntroductionSchema = z.object({
  action: z.enum(["accept", "decline"]),
  preferred_contact: z
    .object({
      method: z.enum(["phone", "video", "meet"]).optional(),
      best_times: z.string().optional(),
    })
    .optional(),
  feedback: z.string().optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
  attachments: z
    .array(
      z.object({
        type: z.string(),
        url: z.string(),
        name: z.string(),
      })
    )
    .optional(),
});

// ============================================================
// Admin Schemas
// ============================================================
export const verifyProfileSchema = z.object({
  action: z.enum(["approve", "reject"]),
  notes: z.string().optional(),
});

export const createMatchSchema = z.object({
  profile_1_id: z.string().uuid(),
  profile_2_id: z.string().uuid(),
  matchmaker_notes: z.string().optional(),
});

export const createIntroductionSchema = z.object({
  match_id: z.string().uuid(),
  message: z.string().min(1, "Introduction message is required"),
  response_deadline_hours: z.number().min(24).max(168).optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ExpressInterestInput = z.infer<typeof expressInterestSchema>;
export type PassMatchInput = z.infer<typeof passMatchSchema>;
export type RespondIntroductionInput = z.infer<
  typeof respondIntroductionSchema
>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type VerifyProfileInput = z.infer<typeof verifyProfileSchema>;
export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type CreateIntroductionInput = z.infer<
  typeof createIntroductionSchema
>;
