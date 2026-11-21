// Quality operations share the complaint machine and the same source-backed finding model.
export {
  evaluateQualityFindings,
  groupOperationalFindings,
  validateComplaintTransition,
  transitionComplaint,
  prepareEscalation,
  evaluateRecoveryActions,
  detectJourneyBottlenecks,
  prepareCorrectiveAction,
  calculateSurveyMetrics,
} from "@/features/customer-experience/domain";
export type {
  Complaint,
  ComplaintEvent,
  QualityFinding,
  CorrectiveAction,
  Survey,
  SurveyResponse,
} from "@/features/customer-experience/domain";
