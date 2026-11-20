# Componentes 01C §17
| Componente | Ubicación |
|---|---|
| OnboardingStepper, VisitCompletionChecklist | screens/c01.tsx |
| MFASetupPanel | screens/c01.tsx (TOTP real) |
| PrivacyRequestForm, ConsentReviewPanel | RecordBook(kind=privacidad) / Toggles en client.tsx |
| CaregiverPermissionMatrix | CaregiverAuths (c01) + CaregiversManager (other) |
| CalendarConnectionCard, CalendarConflictResolver | CalendarConnections, Conflicts (c01) |
| AppointmentHoldTimer | HoldView (c01) |
| QuickBookingCallSummary | RecordBook llamada (c01) |
| RecurrenceExceptionPanel | recurrencias (c01) |
| PostVisitCommitmentSheet | NewCommitment (c01) |
| MemoryCorrectionForm | MemoryTab (c01) |
| SimulationRevalidationPanel / ExecutionTimeline | sim.tsx + sim_* records |
| SpecialistCredentialsPanel, ReferralDocumentApproval, ExternalBookingConfirmation, ReferralOutcomeReview | ReferralStep / RefDocs (c01) |
| PaymentVerificationCard | PaymentVerification (c01) |
| InventoryLotCard, StockMovementForm | Lot, StockMovementForm (c01) |
| TrainingProgressCard | PendingTraining (c01) |
| IntegrationDiagnostics | IntegrationEvents (c01) |
| ProjectRequirementsCoverage | Coverage (c01) |
| Genéricos | screens/records.tsx (RecordBook, RecordView) |
