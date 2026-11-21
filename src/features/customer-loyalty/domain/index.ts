// A single evaluator governs all contact purposes; never create a marketing consent shortcut.
export {
  evaluateCommunicationEligibility,
  evaluateFrequencyLimit,
  validateReviewRequest,
  validateReferralRequest,
  evaluatePreventiveReminder,
  approvedEducation,
  validateTestimonialConsent,
  purposeLabels,
  Purposes,
} from "@/features/customer-experience/domain";
export type {
  ContactContext,
  EligibilityDecision,
  ConsentPurpose,
  EducationArticle,
} from "@/features/customer-experience/domain";
