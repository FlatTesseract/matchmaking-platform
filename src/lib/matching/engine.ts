import {
  type ProfileData,
  type CompatibilityBreakdown,
  type WhyMatchedItem,
  type MatchSuggestion,
  type DimensionWeight,
  DEFAULT_WEIGHTS,
} from "./types";

// ============================================================
// Deal-Breaker Filtering
// ============================================================
function passesDealBreakers(
  profile: ProfileData,
  candidate: ProfileData
): boolean {
  const prefs = profile.partner_preferences;
  const candidateInfo = candidate.basic_info;

  if (!prefs) return true;

  // Check age range
  if (prefs.age_min || prefs.age_max) {
    if (candidateInfo.date_of_birth) {
      const age = calculateAge(candidateInfo.date_of_birth);
      if (prefs.age_min && age < prefs.age_min) return false;
      if (prefs.age_max && age > prefs.age_max) return false;
    }
  }

  // Check deal-breakers from both sides
  const dealBreakers = prefs.deal_breakers || [];
  for (const breaker of dealBreakers) {
    const normalized = breaker.toLowerCase();

    // Religion-based deal-breakers
    if (
      normalized.includes("religion") ||
      normalized.includes("same faith")
    ) {
      if (
        candidateInfo.religion &&
        profile.basic_info.religion &&
        candidateInfo.religion !== profile.basic_info.religion
      ) {
        return false;
      }
    }

    // Location-based deal-breakers
    if (
      normalized.includes("location") ||
      normalized.includes("same city")
    ) {
      if (
        candidateInfo.location &&
        profile.basic_info.location &&
        !candidateInfo.location
          .toLowerCase()
          .includes(getCityToken(profile.basic_info.location))
      ) {
        return false;
      }
    }
  }

  return true;
}

function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function getCityToken(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.split(",")[0]?.toLowerCase().trim() || "";
}

// ============================================================
// Dimension Scoring (0-100 each)
// ============================================================
function scoreValues(a: ProfileData, b: ProfileData): number {
  let score = 50; // Base score
  const aVals = a.values_beliefs || {};
  const bVals = b.values_beliefs || {};

  // Religious observance alignment
  if (aVals.religious_observance && bVals.religious_observance) {
    if (aVals.religious_observance === bVals.religious_observance) {
      score += 20;
    } else {
      const levels = ["cultural", "moderate", "practicing"];
      const diff = Math.abs(
        levels.indexOf(aVals.religious_observance.toLowerCase()) -
          levels.indexOf(bVals.religious_observance.toLowerCase())
      );
      score += diff === 1 ? 10 : 0;
    }
  }

  // Gender roles alignment
  if (aVals.gender_roles && bVals.gender_roles) {
    if (aVals.gender_roles === bVals.gender_roles) score += 15;
    else score += 5;
  }

  // Financial management
  if (aVals.financial_management && bVals.financial_management) {
    if (aVals.financial_management === bVals.financial_management) score += 10;
    else score += 3;
  }

  // Decision-making style
  if (aVals.decision_making && bVals.decision_making) {
    if (aVals.decision_making === bVals.decision_making) score += 5;
    else score += 2;
  }

  return Math.min(100, score);
}

function scoreLifestyle(a: ProfileData, b: ProfileData): number {
  let score = 50;
  const aLife = a.lifestyle || {};
  const bLife = b.lifestyle || {};

  // Daily routine
  if (aLife.routine && bLife.routine) {
    if (aLife.routine === bLife.routine) score += 15;
    else score += 5;
  }

  // Social style
  if (aLife.social_style && bLife.social_style) {
    if (aLife.social_style === bLife.social_style) score += 10;
    else if (
      aLife.social_style === "Ambivert" ||
      bLife.social_style === "Ambivert"
    ) {
      score += 7;
    }
  }

  // Hobbies overlap
  if (aLife.hobbies?.length && bLife.hobbies?.length) {
    const aSet = new Set(aLife.hobbies.map((h) => h.toLowerCase()));
    const overlap = bLife.hobbies.filter((h) => aSet.has(h.toLowerCase()));
    const overlapRatio =
      overlap.length / Math.max(aLife.hobbies.length, bLife.hobbies.length);
    score += Math.round(overlapRatio * 20);
  }

  // Diet compatibility
  if (aLife.diet && bLife.diet) {
    if (aLife.diet === bLife.diet) score += 5;
  }

  return Math.min(100, score);
}

function scoreFamily(a: ProfileData, b: ProfileData): number {
  let score = 50;
  const aFam = a.family_background || {};
  const bFam = b.family_background || {};

  // Family type compatibility
  if (aFam.family_type && bFam.family_type) {
    if (aFam.family_type === bFam.family_type) score += 20;
    else score += 8;
  }

  // Religious practice level
  if (aFam.religious_practice && bFam.religious_practice) {
    if (aFam.religious_practice === bFam.religious_practice) score += 15;
    else score += 5;
  }

  // Both have professional parents (socioeconomic indicator)
  const professionalKeywords = [
    "doctor",
    "engineer",
    "professor",
    "manager",
    "officer",
    "business",
    "lawyer",
    "banker",
  ];
  const aParentPro =
    professionalKeywords.some(
      (k) =>
        aFam.father_occupation?.toLowerCase().includes(k) ||
        aFam.mother_occupation?.toLowerCase().includes(k)
    ) || false;
  const bParentPro =
    professionalKeywords.some(
      (k) =>
        bFam.father_occupation?.toLowerCase().includes(k) ||
        bFam.mother_occupation?.toLowerCase().includes(k)
    ) || false;

  if (aParentPro && bParentPro) score += 15;
  else if (aParentPro || bParentPro) score += 7;

  return Math.min(100, score);
}

function scorePersonality(a: ProfileData, b: ProfileData): number {
  let score = 50;
  const aPers = a.personality || {};
  const bPers = b.personality || {};

  // Communication style
  if (aPers.communication_style && bPers.communication_style) {
    if (aPers.communication_style === bPers.communication_style) score += 15;
    else score += 5;
  }

  // Conflict resolution
  if (aPers.conflict_resolution && bPers.conflict_resolution) {
    if (aPers.conflict_resolution === bPers.conflict_resolution) score += 10;
    else score += 3;
  }

  // Love language
  if (aPers.love_language && bPers.love_language) {
    if (aPers.love_language === bPers.love_language) score += 10;
    else score += 5;
  }

  // Friend words overlap
  if (aPers.friend_words?.length && bPers.friend_words?.length) {
    const aSet = new Set(aPers.friend_words.map((w) => w.toLowerCase()));
    const overlap = bPers.friend_words.filter((w) =>
      aSet.has(w.toLowerCase())
    );
    score += overlap.length * 5;
  }

  return Math.min(100, score);
}

function scorePractical(a: ProfileData, b: ProfileData): number {
  let score = 50;

  // Education alignment
  const aEdu = a.education_career || {};
  const bEdu = b.education_career || {};

  const eduLevels = [
    "secondary",
    "higher secondary",
    "diploma",
    "bachelor",
    "master",
    "phd",
  ];

  if (aEdu.education_level && bEdu.education_level) {
    const aLevel = eduLevels.findIndex((l) =>
      aEdu.education_level!.toLowerCase().includes(l)
    );
    const bLevel = eduLevels.findIndex((l) =>
      bEdu.education_level!.toLowerCase().includes(l)
    );
    if (aLevel >= 0 && bLevel >= 0) {
      const diff = Math.abs(aLevel - bLevel);
      if (diff === 0) score += 15;
      else if (diff === 1) score += 10;
      else score += 3;
    }
  }

  // Location compatibility
  if (a.basic_info.location && b.basic_info.location) {
    const aCity = getCityToken(a.basic_info.location);
    const bCity = getCityToken(b.basic_info.location);
    if (aCity && bCity && aCity === bCity) score += 20;
    // Both in same country
    else if (
      (a.basic_info.location.toLowerCase().includes("dhaka") &&
        b.basic_info.location.toLowerCase().includes("dhaka")) ||
      (a.basic_info.location.toLowerCase().includes("bangladesh") &&
        b.basic_info.location.toLowerCase().includes("bangladesh"))
    ) {
      score += 10;
    }
  }

  // Career aspiration alignment
  if (aEdu.career_aspiration && bEdu.career_aspiration) {
    if (aEdu.career_aspiration === bEdu.career_aspiration) score += 10;
    else score += 3;
  }

  // Meets partner preference education minimum
  const aMinEdu = a.partner_preferences?.education_min;
  if (aMinEdu && bEdu.education_level) {
    const minIdx = eduLevels.findIndex((l) =>
      aMinEdu.toLowerCase().includes(l)
    );
    const candIdx = eduLevels.findIndex((l) =>
      bEdu.education_level!.toLowerCase().includes(l)
    );
    if (minIdx >= 0 && candIdx >= 0 && candIdx >= minIdx) {
      score += 5;
    }
  }

  return Math.min(100, score);
}

// ============================================================
// "Why You Matched" Explanation Generator
// ============================================================
function generateWhyMatched(
  a: ProfileData,
  b: ProfileData,
  breakdown: CompatibilityBreakdown
): WhyMatchedItem[] {
  const items: WhyMatchedItem[] = [];

  // Sort dimensions by score to pick top areas
  const dimensions = Object.entries(breakdown).sort(
    ([, scoreA], [, scoreB]) => scoreB - scoreA
  );

  for (const [dim, score] of dimensions) {
    if (items.length >= 3) break;
    if (score < 60) continue;

    switch (dim) {
      case "values":
        if (
          a.values_beliefs?.religious_observance ===
          b.values_beliefs?.religious_observance
        ) {
          items.push({
            area: "Shared Values",
            description:
              "You both share similar religious observance and core values about life and relationships",
            icon: "heart",
          });
        } else {
          items.push({
            area: "Values Alignment",
            description:
              "Your perspectives on family, finances, and decision-making are well-aligned",
            icon: "heart-handshake",
          });
        }
        break;

      case "lifestyle":
        if (a.lifestyle?.routine === b.lifestyle?.routine) {
          items.push({
            area: "Lifestyle Match",
            description: `Both ${a.lifestyle?.routine?.toLowerCase()}s who share compatible daily rhythms`,
            icon: "sun",
          });
        } else {
          const aHobbies = a.lifestyle?.hobbies || [];
          const bHobbies = b.lifestyle?.hobbies || [];
          const shared = aHobbies.filter((h) =>
            bHobbies.map((x) => x.toLowerCase()).includes(h.toLowerCase())
          );
          items.push({
            area: "Common Interests",
            description:
              shared.length > 0
                ? `Shared interests in ${shared.slice(0, 3).join(", ")}`
                : "Compatible lifestyle preferences and social styles",
            icon: "sparkles",
          });
        }
        break;

      case "family":
        items.push({
          area: "Family Compatibility",
          description:
            a.family_background?.family_type ===
            b.family_background?.family_type
              ? `Both from ${a.family_background?.family_type?.toLowerCase()} families with compatible backgrounds`
              : "Compatible family backgrounds and expectations",
          icon: "home",
        });
        break;

      case "personality":
        items.push({
          area: "Personality Fit",
          description:
            "Your communication styles and conflict resolution approaches complement each other",
          icon: "message-circle",
        });
        break;

      case "practical":
        items.push({
          area: "Practical Alignment",
          description:
            "Education levels, career paths, and location preferences align well",
          icon: "briefcase",
        });
        break;
    }
  }

  // Ensure at least one reason
  if (items.length === 0) {
    items.push({
      area: "Potential Connection",
      description:
        "Our matchmakers see potential for a meaningful connection between you two",
      icon: "sparkles",
    });
  }

  return items;
}

// ============================================================
// Main Matching Engine
// ============================================================
export function calculateCompatibility(
  profile: ProfileData,
  candidate: ProfileData,
  weights: DimensionWeight = DEFAULT_WEIGHTS
): MatchSuggestion | null {
  // Check deal-breakers (mutual)
  if (
    !passesDealBreakers(profile, candidate) ||
    !passesDealBreakers(candidate, profile)
  ) {
    return null;
  }

  // Calculate dimension scores
  const breakdown: CompatibilityBreakdown = {
    values: scoreValues(profile, candidate),
    lifestyle: scoreLifestyle(profile, candidate),
    family: scoreFamily(profile, candidate),
    personality: scorePersonality(profile, candidate),
    practical: scorePractical(profile, candidate),
  };

  // Calculate weighted overall score
  const overallScore = Math.round(
    breakdown.values * weights.values +
      breakdown.lifestyle * weights.lifestyle +
      breakdown.family * weights.family +
      breakdown.personality * weights.personality +
      breakdown.practical * weights.practical
  );

  // Generate explanations
  const whyMatched = generateWhyMatched(profile, candidate, breakdown);

  return {
    profileId: candidate.id,
    compatibilityScore: overallScore,
    breakdown,
    whyMatched,
    dealBreakersPassed: true,
  };
}

export function findMatches(
  profile: ProfileData,
  candidates: ProfileData[],
  weights: DimensionWeight = DEFAULT_WEIGHTS,
  limit = 20
): MatchSuggestion[] {
  const suggestions: MatchSuggestion[] = [];

  for (const candidate of candidates) {
    if (candidate.id === profile.id) continue;
    if (candidate.user_id === profile.user_id) continue;

    const result = calculateCompatibility(profile, candidate, weights);
    if (result) {
      suggestions.push(result);
    }
  }

  // Sort by score descending and limit
  return suggestions
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, limit);
}
