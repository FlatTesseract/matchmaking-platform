export interface ProfileData {
  id: string;
  user_id: string;
  basic_info: {
    name?: string;
    date_of_birth?: string;
    gender?: string;
    location?: string;
    height?: string;
    religion?: string;
  };
  education_career: {
    education_level?: string;
    institution?: string;
    field_of_study?: string;
    occupation?: string;
    company?: string;
    career_aspiration?: string;
    work_life_balance?: string;
  };
  family_background: {
    family_type?: string;
    father_occupation?: string;
    mother_occupation?: string;
    siblings?: string;
    religious_practice?: string;
  };
  values_beliefs: {
    religious_observance?: string;
    gender_roles?: string;
    financial_management?: string;
    decision_making?: string;
    living_with_inlaws?: string;
    working_after_marriage?: string;
  };
  lifestyle: {
    routine?: string;
    social_style?: string;
    hobbies?: string[];
    health_fitness?: string;
    travel?: string;
    diet?: string;
  };
  personality: {
    self_description?: string;
    communication_style?: string;
    conflict_resolution?: string;
    love_language?: string;
    friend_words?: string[];
  };
  partner_preferences: {
    age_min?: number;
    age_max?: number;
    height_min?: string;
    height_max?: string;
    education_min?: string;
    location_preferences?: string[];
    must_haves?: string[];
    deal_breakers?: string[];
    nice_to_haves?: string[];
    openness?: string;
  };
}

export interface CompatibilityBreakdown {
  values: number;
  lifestyle: number;
  family: number;
  personality: number;
  practical: number;
}

export interface WhyMatchedItem {
  area: string;
  description: string;
  icon: string;
}

export interface MatchSuggestion {
  profileId: string;
  compatibilityScore: number;
  breakdown: CompatibilityBreakdown;
  whyMatched: WhyMatchedItem[];
  dealBreakersPassed: boolean;
}

export interface DimensionWeight {
  values: number;
  lifestyle: number;
  family: number;
  personality: number;
  practical: number;
}

export const DEFAULT_WEIGHTS: DimensionWeight = {
  values: 0.3,
  lifestyle: 0.25,
  family: 0.2,
  personality: 0.15,
  practical: 0.1,
};
