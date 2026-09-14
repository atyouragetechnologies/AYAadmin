/**
 * crisisDetection.ts
 *
 * Client-side fast crisis language detection for AYA.
 *
 * PURPOSE:
 * - Provides immediate UX response (no network required)
 * - Runs before the check-in is submitted
 * - Does NOT position AYA as therapy or clinical diagnosis
 * - High-risk detections prevent the recommendation engine from running
 *
 * IMPORTANT SAFETY PRINCIPLES:
 * - This system is supplementary UX — not a clinical screening tool
 * - It should never claim to diagnose or treat
 * - False positives are acceptable and expected (medium risk has an "I'm okay" override)
 * - High-risk content is NEVER routed to normal story recommendations
 * - Crisis resources are real Indian helplines (iCall, Vandrevala, AASRA)
 *
 * Phase 2: Check-in + Recommendation Engine
 */

import { CRISIS_PATTERNS } from '../config/recommendationConfig';
import type { CrisisRiskLevel } from '../types/ayaTypes';

export interface CrisisDetectionResult {
  riskLevel: CrisisRiskLevel;
  isCrisis: boolean;
  /** Which pattern triggered (for server-side logging — never shown to user) */
  triggeredPattern?: string;
}

/**
 * Scan a text string for crisis language patterns.
 * Uses exact substring matching (fast, no regex complexity).
 *
 * Returns:
 * - 'high'   → block recommendation, show SafetyCard with crisis resources
 * - 'medium' → show SafetyCard with soft message + "I'm okay, continue" option
 * - 'low'    → proceed normally (no SafetyCard)
 * - 'none'   → proceed normally
 */
export function detectCrisisLanguage(text: string): CrisisDetectionResult {
  if (!text || text.trim().length < 3) {
    return { riskLevel: 'none', isCrisis: false };
  }

  const normalized = text.toLowerCase().trim();

  // Check high-risk patterns first
  for (const pattern of CRISIS_PATTERNS.high_risk) {
    if (normalized.includes(pattern)) {
      return {
        riskLevel: 'high',
        isCrisis: true,
        triggeredPattern: pattern,
      };
    }
  }

  // Check medium-risk patterns
  for (const pattern of CRISIS_PATTERNS.medium_risk) {
    if (normalized.includes(pattern)) {
      return {
        riskLevel: 'medium',
        isCrisis: false, // Medium: show card but don't fully block
        triggeredPattern: pattern,
      };
    }
  }

  return { riskLevel: 'none', isCrisis: false };
}

/**
 * Scan an array of tags for crisis-related values.
 * Useful for checking selected chips in addition to free text.
 */
export function detectCrisisInTags(tags: string[]): CrisisDetectionResult {
  const text = tags.join(' ');
  return detectCrisisLanguage(text);
}

/**
 * Combined check: scan both free text AND selected tags.
 * Returns the higher risk level found between the two.
 */
export function detectCrisis(freeText: string, tags: string[]): CrisisDetectionResult {
  const textResult = detectCrisisLanguage(freeText);
  const tagResult = detectCrisisInTags(tags);

  const riskOrder: Record<CrisisRiskLevel, number> = {
    none: 0,
    low: 1,
    medium: 2,
    high: 3,
  };

  if (riskOrder[textResult.riskLevel] >= riskOrder[tagResult.riskLevel]) {
    return textResult;
  }
  return tagResult;
}
