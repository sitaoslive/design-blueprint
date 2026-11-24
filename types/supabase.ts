export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          access_instructions: string | null
          address_line: string
          city: string
          created_at: string
          id: string
          is_primary: boolean
          label: string
          latitude: number | null
          longitude: number | null
          neighborhood: string | null
          organization_id: string
          owner_id: string
          postal_code: string | null
          updated_at: string
        }
        Insert: {
          access_instructions?: string | null
          address_line: string
          city?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          label?: string
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          organization_id: string
          owner_id: string
          postal_code?: string | null
          updated_at?: string
        }
        Update: {
          access_instructions?: string | null
          address_line?: string
          city?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          label?: string
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          organization_id?: string
          owner_id?: string
          postal_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "addresses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "addresses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "addresses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
        ]
      }
      ai_action_executions: {
        Row: {
          error_message: string | null
          executed_at: string
          execution_result: Json
          execution_status: string
          id: string
          proposal_id: string
        }
        Insert: {
          error_message?: string | null
          executed_at?: string
          execution_result?: Json
          execution_status: string
          id?: string
          proposal_id: string
        }
        Update: {
          error_message?: string | null
          executed_at?: string
          execution_result?: Json
          execution_status?: string
          id?: string
          proposal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_action_executions_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "ai_action_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_action_proposals: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          assistant_code: string
          confidence_score: number | null
          created_at: string
          id: string
          organization_id: string
          proposal_payload: Json
          proposed_action_type: string
          reasoning_summary: string | null
          status: string
          target_entity_id: string
          target_entity_type: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          assistant_code: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          organization_id: string
          proposal_payload: Json
          proposed_action_type: string
          reasoning_summary?: string | null
          status?: string
          target_entity_id: string
          target_entity_type: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          assistant_code?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          organization_id?: string
          proposal_payload?: Json
          proposed_action_type?: string
          reasoning_summary?: string | null
          status?: string
          target_entity_id?: string
          target_entity_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_action_proposals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_assistant_configs: {
        Row: {
          allowed_tools: Json
          assistant_code: string
          created_at: string
          id: string
          is_active: boolean
          model_name: string
          name: string
          organization_id: string
          requires_human_approval_for: string[]
          temperature: number
          updated_at: string
        }
        Insert: {
          allowed_tools?: Json
          assistant_code: string
          created_at?: string
          id?: string
          is_active?: boolean
          model_name?: string
          name: string
          organization_id: string
          requires_human_approval_for?: string[]
          temperature?: number
          updated_at?: string
        }
        Update: {
          allowed_tools?: Json
          assistant_code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          model_name?: string
          name?: string
          organization_id?: string
          requires_human_approval_for?: string[]
          temperature?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_assistant_configs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_prompt_versions: {
        Row: {
          assistant_config_id: string
          created_at: string
          created_by: string | null
          id: string
          is_current_active: boolean
          system_prompt: string
          version_tag: string
        }
        Insert: {
          assistant_config_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_current_active?: boolean
          system_prompt: string
          version_tag: string
        }
        Update: {
          assistant_config_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_current_active?: boolean
          system_prompt?: string
          version_tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_prompt_versions_assistant_config_id_fkey"
            columns: ["assistant_config_id"]
            isOneToOne: false
            referencedRelation: "ai_assistant_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_duration_overrides: {
        Row: {
          appointment_id: string
          approved_by: string
          created_at: string
          id: string
          original_duration_minutes: number
          overridden_duration_minutes: number
          override_reason: string
        }
        Insert: {
          appointment_id: string
          approved_by: string
          created_at?: string
          id?: string
          original_duration_minutes: number
          overridden_duration_minutes: number
          override_reason: string
        }
        Update: {
          appointment_id?: string
          approved_by?: string
          created_at?: string
          id?: string
          original_duration_minutes?: number
          overridden_duration_minutes?: number
          override_reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_duration_overrides_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_duration_overrides_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "appointment_duration_overrides_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_holds: {
        Row: {
          created_at: string
          end_time: string
          expires_at: string
          hold_session_token: string
          id: string
          is_released: boolean
          organization_id: string
          staff_profile_id: string
          start_time: string
        }
        Insert: {
          created_at?: string
          end_time: string
          expires_at: string
          hold_session_token: string
          id?: string
          is_released?: boolean
          organization_id: string
          staff_profile_id: string
          start_time: string
        }
        Update: {
          created_at?: string
          end_time?: string
          expires_at?: string
          hold_session_token?: string
          id?: string
          is_released?: boolean
          organization_id?: string
          staff_profile_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_holds_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_holds_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_holds_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      appointment_notification_jobs: {
        Row: {
          appointment_id: string
          appointment_version: number
          channel: string
          created_at: string
          dispatch_request_id: string | null
          eligible_after: string
          executed_at: string | null
          expires_at: string
          id: string
          idempotency_key: string
          notification_type: string
          organization_id: string
          plan_id: string
          planned_for: string
          recipient_name: string
          recipient_phone: string
          status: string
          suppression_reason: string | null
          template_code: string
          template_parameters: Json
          updated_at: string
        }
        Insert: {
          appointment_id: string
          appointment_version?: number
          channel?: string
          created_at?: string
          dispatch_request_id?: string | null
          eligible_after: string
          executed_at?: string | null
          expires_at: string
          id?: string
          idempotency_key: string
          notification_type: string
          organization_id: string
          plan_id: string
          planned_for: string
          recipient_name: string
          recipient_phone: string
          status?: string
          suppression_reason?: string | null
          template_code: string
          template_parameters?: Json
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          appointment_version?: number
          channel?: string
          created_at?: string
          dispatch_request_id?: string | null
          eligible_after?: string
          executed_at?: string | null
          expires_at?: string
          id?: string
          idempotency_key?: string
          notification_type?: string
          organization_id?: string
          plan_id?: string
          planned_for?: string
          recipient_name?: string
          recipient_phone?: string
          status?: string
          suppression_reason?: string | null
          template_code?: string
          template_parameters?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_notification_jobs_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_notification_jobs_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "appointment_notification_jobs_dispatch_request_id_fkey"
            columns: ["dispatch_request_id"]
            isOneToOne: false
            referencedRelation: "outbound_dispatch_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_notification_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_notification_jobs_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "appointment_notification_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_notification_plans: {
        Row: {
          appointment_id: string
          appointment_version: number
          created_at: string
          id: string
          organization_id: string
          policy_version: string
          status: string
          updated_at: string
        }
        Insert: {
          appointment_id: string
          appointment_version?: number
          created_at?: string
          id?: string
          organization_id: string
          policy_version?: string
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          appointment_version?: number
          created_at?: string
          id?: string
          organization_id?: string
          policy_version?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_notification_plans_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_notification_plans_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "appointment_notification_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_recovery_tasks: {
        Row: {
          appointment_id: string
          assigned_staff_id: string | null
          created_at: string
          id: string
          incident_type: string
          notes: string | null
          organization_id: string
          resolution_notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          appointment_id: string
          assigned_staff_id?: string | null
          created_at?: string
          id?: string
          incident_type: string
          notes?: string | null
          organization_id: string
          resolution_notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          assigned_staff_id?: string | null
          created_at?: string
          id?: string
          incident_type?: string
          notes?: string | null
          organization_id?: string
          resolution_notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_recovery_tasks_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_recovery_tasks_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "appointment_recovery_tasks_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_recovery_tasks_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "appointment_recovery_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_requests: {
        Row: {
          address_id: string
          created_at: string
          id: string
          metadata: Json
          organization_id: string
          owner_id: string
          pet_id: string
          preferred_date: string
          preferred_time_window: string
          reason_for_consultation: string
          rejection_reason: string | null
          reviewed_by: string | null
          service_id: string
          source_channel: string
          status: string
          triage_level: string
          updated_at: string
        }
        Insert: {
          address_id: string
          created_at?: string
          id?: string
          metadata?: Json
          organization_id: string
          owner_id: string
          pet_id: string
          preferred_date: string
          preferred_time_window?: string
          reason_for_consultation: string
          rejection_reason?: string | null
          reviewed_by?: string | null
          service_id: string
          source_channel?: string
          status?: string
          triage_level?: string
          updated_at?: string
        }
        Update: {
          address_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          organization_id?: string
          owner_id?: string
          pet_id?: string
          preferred_date?: string
          preferred_time_window?: string
          reason_for_consultation?: string
          rejection_reason?: string | null
          reviewed_by?: string | null
          service_id?: string
          source_channel?: string
          status?: string
          triage_level?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_requests_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_requests_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_requests_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "appointment_requests_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "appointment_requests_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_requests_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "appointment_requests_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "appointment_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_reschedule_proposals: {
        Row: {
          appointment_id: string
          client_accepted_at: string | null
          created_at: string
          expires_at: string
          id: string
          okvet_reference: string | null
          okvet_verified_at: string | null
          okvet_verified_by: string | null
          organization_id: string
          original_start_time: string
          proposed_end_time: string
          proposed_start_time: string
          proposed_veterinarian_id: string | null
          reason: string
          requested_by_actor_type: string
          requested_by_user_id: string | null
          source_version: number
          status: string
          updated_at: string
        }
        Insert: {
          appointment_id: string
          client_accepted_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          okvet_reference?: string | null
          okvet_verified_at?: string | null
          okvet_verified_by?: string | null
          organization_id: string
          original_start_time: string
          proposed_end_time: string
          proposed_start_time: string
          proposed_veterinarian_id?: string | null
          reason: string
          requested_by_actor_type?: string
          requested_by_user_id?: string | null
          source_version: number
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          client_accepted_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          okvet_reference?: string | null
          okvet_verified_at?: string | null
          okvet_verified_by?: string | null
          organization_id?: string
          original_start_time?: string
          proposed_end_time?: string
          proposed_start_time?: string
          proposed_veterinarian_id?: string | null
          reason?: string
          requested_by_actor_type?: string
          requested_by_user_id?: string | null
          source_version?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_reschedule_proposals_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_reschedule_proposals_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "appointment_reschedule_proposals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_reschedule_proposals_proposed_veterinarian_id_fkey"
            columns: ["proposed_veterinarian_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_reschedule_proposals_proposed_veterinarian_id_fkey"
            columns: ["proposed_veterinarian_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      appointment_services: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          quantity: number
          service_id: string
          tariff_id: string | null
          unit_price: number
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          quantity?: number
          service_id: string
          tariff_id?: string | null
          unit_price: number
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          quantity?: number
          service_id?: string
          tariff_id?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "appointment_services_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_services_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "appointment_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_services_tariff_id_fkey"
            columns: ["tariff_id"]
            isOneToOne: false
            referencedRelation: "tariffs"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_status_history: {
        Row: {
          appointment_id: string
          changed_by: string | null
          created_at: string
          from_status: string
          id: string
          metadata: Json
          reason: string | null
          to_status: string
        }
        Insert: {
          appointment_id: string
          changed_by?: string | null
          created_at?: string
          from_status: string
          id?: string
          metadata?: Json
          reason?: string | null
          to_status: string
        }
        Update: {
          appointment_id?: string
          changed_by?: string | null
          created_at?: string
          from_status?: string
          id?: string
          metadata?: Json
          reason?: string | null
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_status_history_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_status_history_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
        ]
      }
      appointment_type_versions: {
        Row: {
          administrative_buffer_minutes: number
          allowed_duration_increments: number
          appointment_type_id: string
          approved_by: string | null
          created_at: string
          default_duration_minutes: number
          effective_from: string
          effective_until: string | null
          id: string
          max_duration_minutes: number
          min_duration_minutes: number
          preparation_buffer_minutes: number
          status: string
          version: number
        }
        Insert: {
          administrative_buffer_minutes?: number
          allowed_duration_increments?: number
          appointment_type_id: string
          approved_by?: string | null
          created_at?: string
          default_duration_minutes: number
          effective_from?: string
          effective_until?: string | null
          id?: string
          max_duration_minutes: number
          min_duration_minutes: number
          preparation_buffer_minutes?: number
          status?: string
          version?: number
        }
        Update: {
          administrative_buffer_minutes?: number
          allowed_duration_increments?: number
          appointment_type_id?: string
          approved_by?: string | null
          created_at?: string
          default_duration_minutes?: number
          effective_from?: string
          effective_until?: string | null
          id?: string
          max_duration_minutes?: number
          min_duration_minutes?: number
          preparation_buffer_minutes?: number
          status?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "appointment_type_versions_appointment_type_id_fkey"
            columns: ["appointment_type_id"]
            isOneToOne: false
            referencedRelation: "appointment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_type_versions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_types: {
        Row: {
          active: boolean
          category: string
          clinical_approval_required: boolean
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          requires_auxiliary: boolean
          requires_specialist: boolean
          requires_veterinarian: boolean
          updated_at: string
        }
        Insert: {
          active?: boolean
          category: string
          clinical_approval_required?: boolean
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          requires_auxiliary?: boolean
          requires_specialist?: boolean
          requires_veterinarian?: boolean
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          clinical_approval_required?: boolean
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          requires_auxiliary?: boolean
          requires_specialist?: boolean
          requires_veterinarian?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_waitlist_entries: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          owner_id: string
          pet_id: string
          preferred_date_end: string
          preferred_date_start: string
          preferred_time_windows: string[] | null
          priority: string
          service_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          owner_id: string
          pet_id: string
          preferred_date_end: string
          preferred_date_start: string
          preferred_time_windows?: string[] | null
          priority?: string
          service_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          owner_id?: string
          pet_id?: string
          preferred_date_end?: string
          preferred_date_start?: string
          preferred_time_windows?: string[] | null
          priority?: string
          service_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_waitlist_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_waitlist_entries_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_waitlist_entries_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "appointment_waitlist_entries_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "appointment_waitlist_entries_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_waitlist_entries_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "appointment_waitlist_entries_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "appointment_waitlist_entries_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_waitlist_offers: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          offered_end_time: string
          offered_start_time: string
          offered_veterinarian_id: string
          organization_id: string
          status: string
          updated_at: string
          waitlist_entry_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          offered_end_time: string
          offered_start_time: string
          offered_veterinarian_id: string
          organization_id: string
          status?: string
          updated_at?: string
          waitlist_entry_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          offered_end_time?: string
          offered_start_time?: string
          offered_veterinarian_id?: string
          organization_id?: string
          status?: string
          updated_at?: string
          waitlist_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_waitlist_offers_offered_veterinarian_id_fkey"
            columns: ["offered_veterinarian_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_waitlist_offers_offered_veterinarian_id_fkey"
            columns: ["offered_veterinarian_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "appointment_waitlist_offers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_waitlist_offers_waitlist_entry_id_fkey"
            columns: ["waitlist_entry_id"]
            isOneToOne: false
            referencedRelation: "appointment_waitlist_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          address_id: string
          appointment_type_id: string | null
          appointment_type_version_id: string | null
          assigned_assistant_id: string | null
          assigned_veterinarian_id: string
          cancellation_reason: string | null
          cancelled_by: string | null
          confirmation_evidence: string | null
          created_at: string
          double_book_justification: string | null
          duration_minutes: number
          duration_override_approved_by: string | null
          duration_override_reason: string | null
          duration_source: string | null
          end_time: string
          id: string
          is_double_booked_override: boolean
          metadata: Json
          okvet_appointment_id: string | null
          okvet_sync_status: string
          okvet_verified_at: string | null
          okvet_verified_by: string | null
          organization_id: string
          owner_id: string
          pet_id: string
          planned_duration_minutes: number | null
          request_id: string | null
          scheduled_end_at: string | null
          scheduled_start_at: string | null
          service_id: string
          start_time: string
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          address_id: string
          appointment_type_id?: string | null
          appointment_type_version_id?: string | null
          assigned_assistant_id?: string | null
          assigned_veterinarian_id: string
          cancellation_reason?: string | null
          cancelled_by?: string | null
          confirmation_evidence?: string | null
          created_at?: string
          double_book_justification?: string | null
          duration_minutes?: number
          duration_override_approved_by?: string | null
          duration_override_reason?: string | null
          duration_source?: string | null
          end_time: string
          id?: string
          is_double_booked_override?: boolean
          metadata?: Json
          okvet_appointment_id?: string | null
          okvet_sync_status?: string
          okvet_verified_at?: string | null
          okvet_verified_by?: string | null
          organization_id: string
          owner_id: string
          pet_id: string
          planned_duration_minutes?: number | null
          request_id?: string | null
          scheduled_end_at?: string | null
          scheduled_start_at?: string | null
          service_id: string
          start_time: string
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          address_id?: string
          appointment_type_id?: string | null
          appointment_type_version_id?: string | null
          assigned_assistant_id?: string | null
          assigned_veterinarian_id?: string
          cancellation_reason?: string | null
          cancelled_by?: string | null
          confirmation_evidence?: string | null
          created_at?: string
          double_book_justification?: string | null
          duration_minutes?: number
          duration_override_approved_by?: string | null
          duration_override_reason?: string | null
          duration_source?: string | null
          end_time?: string
          id?: string
          is_double_booked_override?: boolean
          metadata?: Json
          okvet_appointment_id?: string | null
          okvet_sync_status?: string
          okvet_verified_at?: string | null
          okvet_verified_by?: string | null
          organization_id?: string
          owner_id?: string
          pet_id?: string
          planned_duration_minutes?: number | null
          request_id?: string | null
          scheduled_end_at?: string | null
          scheduled_start_at?: string | null
          service_id?: string
          start_time?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "appointments_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_appointment_type_id_fkey"
            columns: ["appointment_type_id"]
            isOneToOne: false
            referencedRelation: "appointment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_appointment_type_version_id_fkey"
            columns: ["appointment_type_version_id"]
            isOneToOne: false
            referencedRelation: "appointment_type_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_assigned_assistant_id_fkey"
            columns: ["assigned_assistant_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_assigned_assistant_id_fkey"
            columns: ["assigned_assistant_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "appointments_assigned_veterinarian_id_fkey"
            columns: ["assigned_veterinarian_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_assigned_veterinarian_id_fkey"
            columns: ["assigned_veterinarian_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "appointments_duration_override_approved_by_fkey"
            columns: ["duration_override_approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "appointments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "appointments_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "appointments_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "appointments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "appointment_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_role: string | null
          actor_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_role?: string | null
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_role?: string | null
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bereavement_records: {
        Row: {
          cause_of_death: string | null
          condolence_card_sent: boolean
          condolence_card_sent_at: string | null
          created_at: string
          deceased_at: string
          id: string
          is_euthanasia: boolean
          notes: string | null
          organization_id: string
          owner_id: string
          pet_id: string
          suppress_marketing_until: string
          suppress_reminders: boolean
          updated_at: string
        }
        Insert: {
          cause_of_death?: string | null
          condolence_card_sent?: boolean
          condolence_card_sent_at?: string | null
          created_at?: string
          deceased_at?: string
          id?: string
          is_euthanasia?: boolean
          notes?: string | null
          organization_id: string
          owner_id: string
          pet_id: string
          suppress_marketing_until?: string
          suppress_reminders?: boolean
          updated_at?: string
        }
        Update: {
          cause_of_death?: string | null
          condolence_card_sent?: boolean
          condolence_card_sent_at?: string | null
          created_at?: string
          deceased_at?: string
          id?: string
          is_euthanasia?: boolean
          notes?: string | null
          organization_id?: string
          owner_id?: string
          pet_id?: string
          suppress_marketing_until?: string
          suppress_reminders?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bereavement_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bereavement_records_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bereavement_records_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "bereavement_records_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "bereavement_records_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bereavement_records_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "bereavement_records_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          city: string
          code: string
          coverage_zones: Json
          created_at: string
          id: string
          is_active: boolean
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string
          code: string
          coverage_zones?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string
          code?: string
          coverage_zones?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_availability_snapshots: {
        Row: {
          available_slots: Json
          busy_slots: Json
          calculated_at: string
          conflicts_count: number | null
          data_freshness: string
          id: string
          is_on_leave: boolean | null
          leave_reason: string | null
          organization_id: string
          shift_end: string | null
          shift_start: string | null
          staff_profile_id: string
          target_date: string
        }
        Insert: {
          available_slots?: Json
          busy_slots?: Json
          calculated_at?: string
          conflicts_count?: number | null
          data_freshness?: string
          id?: string
          is_on_leave?: boolean | null
          leave_reason?: string | null
          organization_id: string
          shift_end?: string | null
          shift_start?: string | null
          staff_profile_id: string
          target_date: string
        }
        Update: {
          available_slots?: Json
          busy_slots?: Json
          calculated_at?: string
          conflicts_count?: number | null
          data_freshness?: string
          id?: string
          is_on_leave?: boolean | null
          leave_reason?: string | null
          organization_id?: string
          shift_end?: string | null
          shift_start?: string | null
          staff_profile_id?: string
          target_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_availability_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_availability_snapshots_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_availability_snapshots_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      calendar_blocked_times: {
        Row: {
          block_type: string
          connection_id: string
          created_at: string
          end_at: string
          id: string
          organization_id: string
          privacy_mode: string
          sanitized_summary: string
          staff_profile_id: string
          start_at: string
          updated_at: string
        }
        Insert: {
          block_type?: string
          connection_id: string
          created_at?: string
          end_at: string
          id?: string
          organization_id: string
          privacy_mode?: string
          sanitized_summary?: string
          staff_profile_id: string
          start_at: string
          updated_at?: string
        }
        Update: {
          block_type?: string
          connection_id?: string
          created_at?: string
          end_at?: string
          id?: string
          organization_id?: string
          privacy_mode?: string
          sanitized_summary?: string
          staff_profile_id?: string
          start_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_blocked_times_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "staff_calendar_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_blocked_times_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_blocked_times_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_blocked_times_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      calendar_change_events: {
        Row: {
          change_source: string
          change_type: string
          connection_id: string
          created_at: string
          external_resource_id: string | null
          id: string
          is_processed: boolean
          organization_id: string
          processed_at: string | null
          raw_payload: Json | null
        }
        Insert: {
          change_source?: string
          change_type?: string
          connection_id: string
          created_at?: string
          external_resource_id?: string | null
          id?: string
          is_processed?: boolean
          organization_id: string
          processed_at?: string | null
          raw_payload?: Json | null
        }
        Update: {
          change_source?: string
          change_type?: string
          connection_id?: string
          created_at?: string
          external_resource_id?: string | null
          id?: string
          is_processed?: boolean
          organization_id?: string
          processed_at?: string | null
          raw_payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_change_events_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "staff_calendar_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_change_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_conflicts: {
        Row: {
          appointment_id: string | null
          calendar_connection_id: string | null
          conflict_end: string
          conflict_start: string
          conflict_type: string
          created_at: string
          detected_at: string | null
          external_event_id: string | null
          id: string
          organization_id: string
          resolution_evidence: string | null
          resolution_owner: string | null
          resolution_status: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          staff_profile_id: string
        }
        Insert: {
          appointment_id?: string | null
          calendar_connection_id?: string | null
          conflict_end: string
          conflict_start: string
          conflict_type: string
          created_at?: string
          detected_at?: string | null
          external_event_id?: string | null
          id?: string
          organization_id: string
          resolution_evidence?: string | null
          resolution_owner?: string | null
          resolution_status?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          staff_profile_id: string
        }
        Update: {
          appointment_id?: string | null
          calendar_connection_id?: string | null
          conflict_end?: string
          conflict_start?: string
          conflict_type?: string
          created_at?: string
          detected_at?: string | null
          external_event_id?: string | null
          id?: string
          organization_id?: string
          resolution_evidence?: string | null
          resolution_owner?: string | null
          resolution_status?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          staff_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_conflicts_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_conflicts_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "calendar_conflicts_calendar_connection_id_fkey"
            columns: ["calendar_connection_id"]
            isOneToOne: false
            referencedRelation: "staff_calendar_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_conflicts_external_event_id_fkey"
            columns: ["external_event_id"]
            isOneToOne: false
            referencedRelation: "external_calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_conflicts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_conflicts_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_conflicts_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      calendar_event_mappings: {
        Row: {
          appointment_id: string
          connection_id: string
          created_at: string
          current_sync_generation: number
          google_calendar_id: string
          google_event_id: string
          id: string
          last_direction: string
          last_published_hash: string
          organization_id: string
          status: string
          updated_at: string
        }
        Insert: {
          appointment_id: string
          connection_id: string
          created_at?: string
          current_sync_generation?: number
          google_calendar_id: string
          google_event_id: string
          id?: string
          last_direction?: string
          last_published_hash: string
          organization_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          connection_id?: string
          created_at?: string
          current_sync_generation?: number
          google_calendar_id?: string
          google_event_id?: string
          id?: string
          last_direction?: string
          last_published_hash?: string
          organization_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_event_mappings_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_event_mappings_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "calendar_event_mappings_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "staff_calendar_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_event_mappings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_reconciliation_tasks: {
        Row: {
          assigned_to: string | null
          connection_id: string
          created_at: string
          description: string
          id: string
          organization_id: string
          priority: string
          resolution_notes: string | null
          resolved_at: string | null
          staff_profile_id: string
          status: string
          task_type: string
        }
        Insert: {
          assigned_to?: string | null
          connection_id: string
          created_at?: string
          description: string
          id?: string
          organization_id: string
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          staff_profile_id: string
          status?: string
          task_type: string
        }
        Update: {
          assigned_to?: string | null
          connection_id?: string
          created_at?: string
          description?: string
          id?: string
          organization_id?: string
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          staff_profile_id?: string
          status?: string
          task_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_reconciliation_tasks_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "staff_calendar_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_reconciliation_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_reconciliation_tasks_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_reconciliation_tasks_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      calendar_sync_audit: {
        Row: {
          action: string
          actor_id: string
          connection_id: string | null
          created_at: string
          details: Json
          id: string
          organization_id: string
        }
        Insert: {
          action: string
          actor_id?: string
          connection_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          organization_id: string
        }
        Update: {
          action?: string
          actor_id?: string
          connection_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_sync_audit_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_sync_leases: {
        Row: {
          acquired_at: string
          connection_id: string
          expires_at: string
          lease_holder: string
          organization_id: string
        }
        Insert: {
          acquired_at?: string
          connection_id: string
          expires_at: string
          lease_holder: string
          organization_id: string
        }
        Update: {
          acquired_at?: string
          connection_id?: string
          expires_at?: string
          lease_holder?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_sync_leases_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: true
            referencedRelation: "staff_calendar_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_sync_leases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_sync_runs: {
        Row: {
          completed_at: string | null
          conflicts_detected: number | null
          connection_id: string
          duration_ms: number | null
          error_message: string | null
          events_processed: number | null
          executed_by: string | null
          id: string
          organization_id: string
          started_at: string
          status: string
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          conflicts_detected?: number | null
          connection_id: string
          duration_ms?: number | null
          error_message?: string | null
          events_processed?: number | null
          executed_by?: string | null
          id?: string
          organization_id: string
          started_at?: string
          status: string
          sync_type: string
        }
        Update: {
          completed_at?: string | null
          conflicts_detected?: number | null
          connection_id?: string
          duration_ms?: number | null
          error_message?: string | null
          events_processed?: number | null
          executed_by?: string | null
          id?: string
          organization_id?: string
          started_at?: string
          status?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_sync_runs_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "staff_calendar_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_sync_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_sync_state: {
        Row: {
          connection_id: string
          created_at: string
          error_message: string | null
          events_synced_count: number
          id: string
          last_full_sync_at: string | null
          last_incremental_sync_at: string | null
          last_reconciliation_at: string | null
          last_sync_at: string
          next_sync_token: string | null
          organization_id: string | null
          stale_after: string | null
          status: string
          sync_generation: number | null
          sync_mode: string | null
        }
        Insert: {
          connection_id: string
          created_at?: string
          error_message?: string | null
          events_synced_count?: number
          id?: string
          last_full_sync_at?: string | null
          last_incremental_sync_at?: string | null
          last_reconciliation_at?: string | null
          last_sync_at?: string
          next_sync_token?: string | null
          organization_id?: string | null
          stale_after?: string | null
          status?: string
          sync_generation?: number | null
          sync_mode?: string | null
        }
        Update: {
          connection_id?: string
          created_at?: string
          error_message?: string | null
          events_synced_count?: number
          id?: string
          last_full_sync_at?: string | null
          last_incremental_sync_at?: string | null
          last_reconciliation_at?: string | null
          last_sync_at?: string
          next_sync_token?: string | null
          organization_id?: string | null
          stale_after?: string | null
          status?: string
          sync_generation?: number | null
          sync_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_sync_state_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "staff_calendar_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_sync_state_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_watch_channels: {
        Row: {
          channel_id: string
          connection_id: string
          created_at: string
          expiration_at: string
          id: string
          last_ping_at: string | null
          organization_id: string
          resource_id: string
          status: string
          token_hash: string
          webhook_url: string
        }
        Insert: {
          channel_id: string
          connection_id: string
          created_at?: string
          expiration_at: string
          id?: string
          last_ping_at?: string | null
          organization_id: string
          resource_id: string
          status?: string
          token_hash: string
          webhook_url: string
        }
        Update: {
          channel_id?: string
          connection_id?: string
          created_at?: string
          expiration_at?: string
          id?: string
          last_ping_at?: string | null
          organization_id?: string
          resource_id?: string
          status?: string
          token_hash?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_watch_channels_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "staff_calendar_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_watch_channels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      capacity_rules: {
        Row: {
          created_at: string
          emergency_slot_buffer_count: number
          id: string
          is_active: boolean
          max_daily_visits_per_vet: number
          organization_id: string
          rule_name: string
          travel_buffer_default_minutes: number
        }
        Insert: {
          created_at?: string
          emergency_slot_buffer_count?: number
          id?: string
          is_active?: boolean
          max_daily_visits_per_vet?: number
          organization_id: string
          rule_name: string
          travel_buffer_default_minutes?: number
        }
        Update: {
          created_at?: string
          emergency_slot_buffer_count?: number
          id?: string
          is_active?: boolean
          max_daily_visits_per_vet?: number
          organization_id?: string
          rule_name?: string
          travel_buffer_default_minutes?: number
        }
        Relationships: [
          {
            foreignKeyName: "capacity_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      caregiver_authorizations: {
        Row: {
          authorization_level: string
          caregiver_email: string | null
          caregiver_name: string
          caregiver_phone: string
          caregiver_user_id: string | null
          created_at: string
          id: string
          is_revoked: boolean
          organization_id: string
          primary_owner_user_id: string
          revocation_reason: string | null
          revoked_at: string | null
          scope_limitations: string | null
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          authorization_level?: string
          caregiver_email?: string | null
          caregiver_name: string
          caregiver_phone: string
          caregiver_user_id?: string | null
          created_at?: string
          id?: string
          is_revoked?: boolean
          organization_id: string
          primary_owner_user_id: string
          revocation_reason?: string | null
          revoked_at?: string | null
          scope_limitations?: string | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          authorization_level?: string
          caregiver_email?: string | null
          caregiver_name?: string
          caregiver_phone?: string
          caregiver_user_id?: string | null
          created_at?: string
          id?: string
          is_revoked?: boolean
          organization_id?: string
          primary_owner_user_id?: string
          revocation_reason?: string | null
          revoked_at?: string | null
          scope_limitations?: string | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "caregiver_authorizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_complaints: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          incident_date: string
          organization_id: string
          owner_id: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          incident_date?: string
          organization_id: string
          owner_id: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          incident_date?: string
          organization_id?: string
          owner_id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_complaints_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_complaints_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_complaints_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "client_complaints_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
        ]
      }
      clinical_constraints: {
        Row: {
          constraint_code: string
          created_at: string
          description: string
          id: string
          is_strict_block: boolean
          min_age_weeks_for_rabies: number
          min_interval_days_between_vaccines: number
          organization_id: string
          species: string
        }
        Insert: {
          constraint_code: string
          created_at?: string
          description: string
          id?: string
          is_strict_block?: boolean
          min_age_weeks_for_rabies?: number
          min_interval_days_between_vaccines?: number
          organization_id: string
          species: string
        }
        Update: {
          constraint_code?: string
          created_at?: string
          description?: string
          id?: string
          is_strict_block?: boolean
          min_age_weeks_for_rabies?: number
          min_interval_days_between_vaccines?: number
          organization_id?: string
          species?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_constraints_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      consents: {
        Row: {
          consent_text_version: string
          consent_type: string
          created_at: string
          granted_at: string
          id: string
          ip_address: string | null
          is_granted: boolean
          metadata: Json
          organization_id: string
          owner_id: string
          pet_id: string | null
          revoked_at: string | null
          signature_url: string | null
        }
        Insert: {
          consent_text_version: string
          consent_type: string
          created_at?: string
          granted_at?: string
          id?: string
          ip_address?: string | null
          is_granted?: boolean
          metadata?: Json
          organization_id: string
          owner_id: string
          pet_id?: string | null
          revoked_at?: string | null
          signature_url?: string | null
        }
        Update: {
          consent_text_version?: string
          consent_type?: string
          created_at?: string
          granted_at?: string
          id?: string
          ip_address?: string | null
          is_granted?: boolean
          metadata?: Json
          organization_id?: string
          owner_id?: string
          pet_id?: string | null
          revoked_at?: string | null
          signature_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consents_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consents_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "consents_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "consents_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consents_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "consents_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
        ]
      }
      contact_restrictions: {
        Row: {
          created_at: string
          do_not_disturb_end: string | null
          do_not_disturb_start: string | null
          id: string
          opt_out_all_automated: boolean
          opt_out_marketing: boolean
          owner_id: string
          restriction_notes: string | null
        }
        Insert: {
          created_at?: string
          do_not_disturb_end?: string | null
          do_not_disturb_start?: string | null
          id?: string
          opt_out_all_automated?: boolean
          opt_out_marketing?: boolean
          owner_id: string
          restriction_notes?: string | null
        }
        Update: {
          created_at?: string
          do_not_disturb_end?: string | null
          do_not_disturb_start?: string | null
          id?: string
          opt_out_all_automated?: boolean
          opt_out_marketing?: boolean
          owner_id?: string
          restriction_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_restrictions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_restrictions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "contact_restrictions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
        ]
      }
      conversation_handoffs: {
        Row: {
          accepted_at: string | null
          assigned_at: string | null
          assigned_user_id: string | null
          conversation_id: string
          created_at: string
          customer_id: string | null
          expires_at: string | null
          first_human_response_at: string | null
          handoff_reason: string
          id: string
          metadata: Json
          organization_id: string
          pet_id: string | null
          priority: string
          requested_role: Database["public"]["Enums"]["app_role_type"]
          requested_team: string
          resolved_at: string | null
          state_version: number
          status: string
          summary: string | null
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          assigned_at?: string | null
          assigned_user_id?: string | null
          conversation_id: string
          created_at?: string
          customer_id?: string | null
          expires_at?: string | null
          first_human_response_at?: string | null
          handoff_reason: string
          id?: string
          metadata?: Json
          organization_id: string
          pet_id?: string | null
          priority?: string
          requested_role?: Database["public"]["Enums"]["app_role_type"]
          requested_team: string
          resolved_at?: string | null
          state_version?: number
          status?: string
          summary?: string | null
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          assigned_at?: string | null
          assigned_user_id?: string | null
          conversation_id?: string
          created_at?: string
          customer_id?: string | null
          expires_at?: string | null
          first_human_response_at?: string | null
          handoff_reason?: string
          id?: string
          metadata?: Json
          organization_id?: string
          pet_id?: string | null
          priority?: string
          requested_role?: Database["public"]["Enums"]["app_role_type"]
          requested_team?: string
          resolved_at?: string | null
          state_version?: number
          status?: string
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_handoffs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_handoffs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_handoffs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "conversation_handoffs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "conversation_handoffs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_handoffs_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_handoffs_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "conversation_handoffs_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
        ]
      }
      conversation_internal_notes: {
        Row: {
          author_id: string
          author_name: string
          author_role: Database["public"]["Enums"]["app_role_type"]
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json
          organization_id: string
        }
        Insert: {
          author_id: string
          author_name: string
          author_role: Database["public"]["Enums"]["app_role_type"]
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json
          organization_id: string
        }
        Update: {
          author_id?: string
          author_name?: string
          author_role?: Database["public"]["Enums"]["app_role_type"]
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_internal_notes_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_internal_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_state_transitions: {
        Row: {
          actor_id: string | null
          actor_type: string
          conversation_id: string
          handoff_id: string | null
          id: string
          metadata: Json
          new_state: string
          occurred_at: string
          organization_id: string
          previous_state: string
          reason: string
          state_version: number
        }
        Insert: {
          actor_id?: string | null
          actor_type: string
          conversation_id: string
          handoff_id?: string | null
          id?: string
          metadata?: Json
          new_state: string
          occurred_at?: string
          organization_id: string
          previous_state: string
          reason: string
          state_version: number
        }
        Update: {
          actor_id?: string | null
          actor_type?: string
          conversation_id?: string
          handoff_id?: string | null
          id?: string
          metadata?: Json
          new_state?: string
          occurred_at?: string
          organization_id?: string
          previous_state?: string
          reason?: string
          state_version?: number
        }
        Relationships: [
          {
            foreignKeyName: "conversation_state_transitions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_state_transitions_handoff_id_fkey"
            columns: ["handoff_id"]
            isOneToOne: false
            referencedRelation: "conversation_handoffs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_state_transitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_transfers: {
        Row: {
          accepted_at: string | null
          conversation_id: string
          id: string
          reason: string
          transferred_at: string
          transferred_from_type: string
          transferred_to_agent_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          conversation_id: string
          id?: string
          reason: string
          transferred_at?: string
          transferred_from_type: string
          transferred_to_agent_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          conversation_id?: string
          id?: string
          reason?: string
          transferred_at?: string
          transferred_from_type?: string
          transferred_to_agent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_transfers_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          ai_generation_version: number | null
          ai_intent: string | null
          assigned_agent_id: string | null
          assigned_role: string | null
          assigned_team: string | null
          channel: string
          created_at: string
          escalation_deadline_at: string | null
          external_conversation_id: string
          handoff_priority: string | null
          human_takeover_at: string | null
          id: string
          is_bot_locked: boolean
          last_message_at: string
          metadata: Json
          organization_id: string
          owner_id: string | null
          sender_name: string | null
          sender_phone: string
          state_version: number
          status: string
          updated_at: string
          window_expires_at: string | null
        }
        Insert: {
          ai_generation_version?: number | null
          ai_intent?: string | null
          assigned_agent_id?: string | null
          assigned_role?: string | null
          assigned_team?: string | null
          channel?: string
          created_at?: string
          escalation_deadline_at?: string | null
          external_conversation_id: string
          handoff_priority?: string | null
          human_takeover_at?: string | null
          id?: string
          is_bot_locked?: boolean
          last_message_at?: string
          metadata?: Json
          organization_id: string
          owner_id?: string | null
          sender_name?: string | null
          sender_phone: string
          state_version?: number
          status?: string
          updated_at?: string
          window_expires_at?: string | null
        }
        Update: {
          ai_generation_version?: number | null
          ai_intent?: string | null
          assigned_agent_id?: string | null
          assigned_role?: string | null
          assigned_team?: string | null
          channel?: string
          created_at?: string
          escalation_deadline_at?: string | null
          external_conversation_id?: string
          handoff_priority?: string | null
          human_takeover_at?: string | null
          id?: string
          is_bot_locked?: boolean
          last_message_at?: string
          metadata?: Json
          organization_id?: string
          owner_id?: string | null
          sender_name?: string | null
          sender_phone?: string
          state_version?: number
          status?: string
          updated_at?: string
          window_expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "conversations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
        ]
      }
      customer_experience_audit: {
        Row: {
          action_type: string
          actor_id: string | null
          actor_type: string
          created_at: string
          details: Json
          entity_id: string
          entity_type: string
          id: string
          organization_id: string
        }
        Insert: {
          action_type: string
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          details?: Json
          entity_id: string
          entity_type: string
          id?: string
          organization_id: string
        }
        Update: {
          action_type?: string
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          details?: Json
          entity_id?: string
          entity_type?: string
          id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_audit_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_experience_complaint_events: {
        Row: {
          actor_user_id: string | null
          complaint_id: string
          created_at: string
          event_type: string
          id: string
          notes: string | null
        }
        Insert: {
          actor_user_id?: string | null
          complaint_id: string
          created_at?: string
          event_type: string
          id?: string
          notes?: string | null
        }
        Update: {
          actor_user_id?: string | null
          complaint_id?: string
          created_at?: string
          event_type?: string
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_complaint_events_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "customer_experience_complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_experience_complaints: {
        Row: {
          category: string
          complaint_code: string
          created_at: string
          customer_id: string | null
          feedback_id: string | null
          id: string
          organization_id: string
          pet_id: string | null
          severity: string
          status: string
          summary: string
          updated_at: string
          visit_id: string | null
        }
        Insert: {
          category?: string
          complaint_code: string
          created_at?: string
          customer_id?: string | null
          feedback_id?: string | null
          id?: string
          organization_id: string
          pet_id?: string | null
          severity?: string
          status?: string
          summary: string
          updated_at?: string
          visit_id?: string | null
        }
        Update: {
          category?: string
          complaint_code?: string
          created_at?: string
          customer_id?: string | null
          feedback_id?: string | null
          id?: string
          organization_id?: string
          pet_id?: string | null
          severity?: string
          status?: string
          summary?: string
          updated_at?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_complaints_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_complaints_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "customer_experience_complaints_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "customer_experience_complaints_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "customer_experience_feedback"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_complaints_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_complaints_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_complaints_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "customer_experience_complaints_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "customer_experience_complaints_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_experience_feedback: {
        Row: {
          created_at: string
          customer_id: string | null
          feedback_text: string
          followup_id: string | null
          id: string
          is_clinical_concern: boolean
          is_complaint: boolean
          is_public_testimonial_eligible: boolean
          is_urgent: boolean
          organization_id: string
          pet_id: string | null
          primary_category: string
          response_id: string | null
          sentiment: string
          status: string
          visit_id: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          feedback_text: string
          followup_id?: string | null
          id?: string
          is_clinical_concern?: boolean
          is_complaint?: boolean
          is_public_testimonial_eligible?: boolean
          is_urgent?: boolean
          organization_id: string
          pet_id?: string | null
          primary_category?: string
          response_id?: string | null
          sentiment?: string
          status?: string
          visit_id?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          feedback_text?: string
          followup_id?: string | null
          id?: string
          is_clinical_concern?: boolean
          is_complaint?: boolean
          is_public_testimonial_eligible?: boolean
          is_urgent?: boolean
          organization_id?: string
          pet_id?: string | null
          primary_category?: string
          response_id?: string | null
          sentiment?: string
          status?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_feedback_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_feedback_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "customer_experience_feedback_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "customer_experience_feedback_followup_id_fkey"
            columns: ["followup_id"]
            isOneToOne: false
            referencedRelation: "customer_experience_followups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_feedback_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_feedback_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_feedback_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "customer_experience_feedback_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "customer_experience_feedback_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "customer_experience_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_feedback_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_experience_feedback_classifications: {
        Row: {
          confidence: number
          confirmed_at: string | null
          confirmed_by_user_id: string | null
          created_at: string
          feedback_id: string
          id: string
          model_provider: string
          proposed_label: string
          rationale: string | null
          requires_human_confirmation: boolean
        }
        Insert: {
          confidence?: number
          confirmed_at?: string | null
          confirmed_by_user_id?: string | null
          created_at?: string
          feedback_id: string
          id?: string
          model_provider?: string
          proposed_label: string
          rationale?: string | null
          requires_human_confirmation?: boolean
        }
        Update: {
          confidence?: number
          confirmed_at?: string | null
          confirmed_by_user_id?: string | null
          created_at?: string
          feedback_id?: string
          id?: string
          model_provider?: string
          proposed_label?: string
          rationale?: string | null
          requires_human_confirmation?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_feedback_classifications_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "customer_experience_feedback"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_experience_feedback_sources: {
        Row: {
          captured_at: string
          external_reference: string | null
          feedback_id: string
          id: string
          source_system: string
        }
        Insert: {
          captured_at?: string
          external_reference?: string | null
          feedback_id: string
          id?: string
          source_system?: string
        }
        Update: {
          captured_at?: string
          external_reference?: string | null
          feedback_id?: string
          id?: string
          source_system?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_feedback_sources_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "customer_experience_feedback"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_experience_followup_attempts: {
        Row: {
          attempt_number: number
          attempted_at: string
          delivered_at: string | null
          error_code: string | null
          error_message: string | null
          followup_id: string
          id: string
          outbound_request_id: string | null
          provider_message_id: string | null
          read_at: string | null
          status: string
        }
        Insert: {
          attempt_number?: number
          attempted_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          followup_id: string
          id?: string
          outbound_request_id?: string | null
          provider_message_id?: string | null
          read_at?: string | null
          status?: string
        }
        Update: {
          attempt_number?: number
          attempted_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          followup_id?: string
          id?: string
          outbound_request_id?: string | null
          provider_message_id?: string | null
          read_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_followup_attempts_followup_id_fkey"
            columns: ["followup_id"]
            isOneToOne: false
            referencedRelation: "customer_experience_followups"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_experience_followup_plans: {
        Row: {
          created_at: string
          followup_id: string
          id: string
          message_template_key: string
          organization_id: string
          plan_type: string
          status: string
          survey_id: string | null
          timing_rule: string
        }
        Insert: {
          created_at?: string
          followup_id: string
          id?: string
          message_template_key?: string
          organization_id: string
          plan_type?: string
          status?: string
          survey_id?: string | null
          timing_rule?: string
        }
        Update: {
          created_at?: string
          followup_id?: string
          id?: string
          message_template_key?: string
          organization_id?: string
          plan_type?: string
          status?: string
          survey_id?: string | null
          timing_rule?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_followup_plans_followup_id_fkey"
            columns: ["followup_id"]
            isOneToOne: false
            referencedRelation: "customer_experience_followups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_followup_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_experience_followups: {
        Row: {
          appointment_id: string | null
          channel: string
          consent_reference: string | null
          correlation_id: string | null
          created_at: string
          customer_id: string | null
          eligible_after: string | null
          expires_at: string | null
          followup_category: string
          id: string
          idempotency_key: string | null
          organization_id: string
          pet_id: string | null
          policy_version: string
          professional_id: string | null
          recipient_name: string | null
          recipient_phone: string | null
          scheduled_at: string | null
          state_version: number
          status: string
          suppression_reason: string | null
          updated_at: string
          visit_id: string | null
        }
        Insert: {
          appointment_id?: string | null
          channel?: string
          consent_reference?: string | null
          correlation_id?: string | null
          created_at?: string
          customer_id?: string | null
          eligible_after?: string | null
          expires_at?: string | null
          followup_category?: string
          id?: string
          idempotency_key?: string | null
          organization_id: string
          pet_id?: string | null
          policy_version?: string
          professional_id?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          scheduled_at?: string | null
          state_version?: number
          status?: string
          suppression_reason?: string | null
          updated_at?: string
          visit_id?: string | null
        }
        Update: {
          appointment_id?: string | null
          channel?: string
          consent_reference?: string | null
          correlation_id?: string | null
          created_at?: string
          customer_id?: string | null
          eligible_after?: string | null
          expires_at?: string | null
          followup_category?: string
          id?: string
          idempotency_key?: string | null
          organization_id?: string
          pet_id?: string | null
          policy_version?: string
          professional_id?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          scheduled_at?: string | null
          state_version?: number
          status?: string
          suppression_reason?: string | null
          updated_at?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_followups_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_followups_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "customer_experience_followups_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_followups_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "customer_experience_followups_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "customer_experience_followups_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_followups_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_followups_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "customer_experience_followups_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "customer_experience_followups_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_followups_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "customer_experience_followups_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_experience_memory: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          id: string
          importance_level: string
          is_active: boolean
          is_verified: boolean
          observation: string
          organization_id: string
          owner_id: string
          pet_id: string | null
          source_type: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          id?: string
          importance_level?: string
          is_active?: boolean
          is_verified?: boolean
          observation: string
          organization_id: string
          owner_id: string
          pet_id?: string | null
          source_type: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          importance_level?: string
          is_active?: boolean
          is_verified?: boolean
          observation?: string
          organization_id?: string
          owner_id?: string
          pet_id?: string | null
          source_type?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_memory_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_memory_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_memory_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "customer_experience_memory_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "customer_experience_memory_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_memory_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "customer_experience_memory_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
        ]
      }
      customer_experience_metrics: {
        Row: {
          average_csat: number | null
          clinical_concerns_transferred: number
          complaints_opened: number
          created_at: string
          eligible_visits: number
          followups_scheduled: number
          followups_suppressed: number
          id: string
          messages_delivered: number
          metric_date: string
          neutral_reviews_invited: number
          organization_id: string
          recovery_cases_reopened: number
          recovery_cases_resolved: number
          responses_received: number
          surveys_completed: number
        }
        Insert: {
          average_csat?: number | null
          clinical_concerns_transferred?: number
          complaints_opened?: number
          created_at?: string
          eligible_visits?: number
          followups_scheduled?: number
          followups_suppressed?: number
          id?: string
          messages_delivered?: number
          metric_date: string
          neutral_reviews_invited?: number
          organization_id: string
          recovery_cases_reopened?: number
          recovery_cases_resolved?: number
          responses_received?: number
          surveys_completed?: number
        }
        Update: {
          average_csat?: number | null
          clinical_concerns_transferred?: number
          complaints_opened?: number
          created_at?: string
          eligible_visits?: number
          followups_scheduled?: number
          followups_suppressed?: number
          id?: string
          messages_delivered?: number
          metric_date?: string
          neutral_reviews_invited?: number
          organization_id?: string
          recovery_cases_reopened?: number
          recovery_cases_resolved?: number
          responses_received?: number
          surveys_completed?: number
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_experience_quality_improvements: {
        Row: {
          approved_at: string | null
          approved_by_user_id: string | null
          assigned_owner_team: string
          cluster_theme: string
          created_at: string
          frequency_count: number
          id: string
          improvement_proposal: string
          organization_id: string
          sample_case_ids: Json
          status: string
          target_core_module: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by_user_id?: string | null
          assigned_owner_team?: string
          cluster_theme: string
          created_at?: string
          frequency_count?: number
          id?: string
          improvement_proposal: string
          organization_id: string
          sample_case_ids?: Json
          status?: string
          target_core_module?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by_user_id?: string | null
          assigned_owner_team?: string
          cluster_theme?: string
          created_at?: string
          frequency_count?: number
          id?: string
          improvement_proposal?: string
          organization_id?: string
          sample_case_ids?: Json
          status?: string
          target_core_module?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_quality_improvements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_experience_recovery_actions: {
        Row: {
          action_details: string
          action_type: string
          evidence_reference: string | null
          id: string
          performed_at: string
          performed_by_user_id: string | null
          recovery_case_id: string
        }
        Insert: {
          action_details: string
          action_type: string
          evidence_reference?: string | null
          id?: string
          performed_at?: string
          performed_by_user_id?: string | null
          recovery_case_id: string
        }
        Update: {
          action_details?: string
          action_type?: string
          evidence_reference?: string | null
          id?: string
          performed_at?: string
          performed_by_user_id?: string | null
          recovery_case_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_recovery_actions_recovery_case_id_fkey"
            columns: ["recovery_case_id"]
            isOneToOne: false
            referencedRelation: "customer_experience_recovery_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_experience_recovery_assignments: {
        Row: {
          accepted_at: string | null
          assigned_at: string
          assigned_by_user_id: string | null
          assigned_role: string
          assigned_user_id: string
          id: string
          recovery_case_id: string
        }
        Insert: {
          accepted_at?: string | null
          assigned_at?: string
          assigned_by_user_id?: string | null
          assigned_role: string
          assigned_user_id: string
          id?: string
          recovery_case_id: string
        }
        Update: {
          accepted_at?: string | null
          assigned_at?: string
          assigned_by_user_id?: string | null
          assigned_role?: string
          assigned_user_id?: string
          id?: string
          recovery_case_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_recovery_assignments_recovery_case_id_fkey"
            columns: ["recovery_case_id"]
            isOneToOne: false
            referencedRelation: "customer_experience_recovery_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_experience_recovery_cases: {
        Row: {
          assigned_user_id: string | null
          complaint_id: string | null
          created_at: string
          customer_id: string | null
          due_at: string | null
          feedback_id: string | null
          id: string
          idempotency_key: string | null
          issue_category: string
          issue_description: string
          next_action: string | null
          organization_id: string
          owner_team: string
          pet_id: string | null
          priority: string
          reopen_count: number
          requires_clinical_review: boolean
          requires_human_review: boolean
          state_version: number
          status: string
          updated_at: string
          visit_id: string | null
        }
        Insert: {
          assigned_user_id?: string | null
          complaint_id?: string | null
          created_at?: string
          customer_id?: string | null
          due_at?: string | null
          feedback_id?: string | null
          id?: string
          idempotency_key?: string | null
          issue_category: string
          issue_description: string
          next_action?: string | null
          organization_id: string
          owner_team?: string
          pet_id?: string | null
          priority?: string
          reopen_count?: number
          requires_clinical_review?: boolean
          requires_human_review?: boolean
          state_version?: number
          status?: string
          updated_at?: string
          visit_id?: string | null
        }
        Update: {
          assigned_user_id?: string | null
          complaint_id?: string | null
          created_at?: string
          customer_id?: string | null
          due_at?: string | null
          feedback_id?: string | null
          id?: string
          idempotency_key?: string | null
          issue_category?: string
          issue_description?: string
          next_action?: string | null
          organization_id?: string
          owner_team?: string
          pet_id?: string | null
          priority?: string
          reopen_count?: number
          requires_clinical_review?: boolean
          requires_human_review?: boolean
          state_version?: number
          status?: string
          updated_at?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_recovery_cases_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "customer_experience_complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_recovery_cases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_recovery_cases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "customer_experience_recovery_cases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "customer_experience_recovery_cases_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "customer_experience_feedback"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_recovery_cases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_recovery_cases_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_recovery_cases_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "customer_experience_recovery_cases_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "customer_experience_recovery_cases_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_experience_recovery_commitments: {
        Row: {
          commitment_description: string
          completed_at: string | null
          created_at: string
          due_at: string
          id: string
          recovery_case_id: string
          responsible_user_id: string
          status: string
        }
        Insert: {
          commitment_description: string
          completed_at?: string | null
          created_at?: string
          due_at: string
          id?: string
          recovery_case_id: string
          responsible_user_id: string
          status?: string
        }
        Update: {
          commitment_description?: string
          completed_at?: string | null
          created_at?: string
          due_at?: string
          id?: string
          recovery_case_id?: string
          responsible_user_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_recovery_commitments_recovery_case_id_fkey"
            columns: ["recovery_case_id"]
            isOneToOne: false
            referencedRelation: "customer_experience_recovery_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_experience_recovery_outcomes: {
        Row: {
          closed_at: string
          closure_summary: string
          customer_confirmed_satisfaction: boolean | null
          id: string
          outcome_type: string
          recovery_case_id: string
          verified_by_user_id: string
        }
        Insert: {
          closed_at?: string
          closure_summary: string
          customer_confirmed_satisfaction?: boolean | null
          id?: string
          outcome_type: string
          recovery_case_id: string
          verified_by_user_id: string
        }
        Update: {
          closed_at?: string
          closure_summary?: string
          customer_confirmed_satisfaction?: boolean | null
          id?: string
          outcome_type?: string
          recovery_case_id?: string
          verified_by_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_recovery_outcomes_recovery_case_id_fkey"
            columns: ["recovery_case_id"]
            isOneToOne: false
            referencedRelation: "customer_experience_recovery_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_experience_responses: {
        Row: {
          customer_id: string | null
          followup_id: string | null
          id: string
          idempotency_key: string | null
          organization_id: string
          pet_id: string | null
          raw_message_text: string
          received_at: string
          response_metadata: Json
          source_channel: string
        }
        Insert: {
          customer_id?: string | null
          followup_id?: string | null
          id?: string
          idempotency_key?: string | null
          organization_id: string
          pet_id?: string | null
          raw_message_text: string
          received_at?: string
          response_metadata?: Json
          source_channel?: string
        }
        Update: {
          customer_id?: string | null
          followup_id?: string | null
          id?: string
          idempotency_key?: string | null
          organization_id?: string
          pet_id?: string | null
          raw_message_text?: string
          received_at?: string
          response_metadata?: Json
          source_channel?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_responses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_responses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "customer_experience_responses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "customer_experience_responses_followup_id_fkey"
            columns: ["followup_id"]
            isOneToOne: false
            referencedRelation: "customer_experience_followups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_responses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_responses_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_responses_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "customer_experience_responses_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
        ]
      }
      customer_experience_review_platforms: {
        Row: {
          created_at: string
          id: string
          is_verified: boolean
          organization_id: string
          platform_key: string
          profile_url: string
          review_link: string
          verified_at: string | null
          verified_by_user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_verified?: boolean
          organization_id: string
          platform_key: string
          profile_url: string
          review_link: string
          verified_at?: string | null
          verified_by_user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_verified?: boolean
          organization_id?: string
          platform_key?: string
          profile_url?: string
          review_link?: string
          verified_at?: string | null
          verified_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_review_platforms_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_experience_review_request_plans: {
        Row: {
          created_at: string
          delay_hours: number
          id: string
          is_active: boolean
          organization_id: string
          plan_name: string
          policy_rules: Json
        }
        Insert: {
          created_at?: string
          delay_hours?: number
          id?: string
          is_active?: boolean
          organization_id: string
          plan_name: string
          policy_rules?: Json
        }
        Update: {
          created_at?: string
          delay_hours?: number
          id?: string
          is_active?: boolean
          organization_id?: string
          plan_name?: string
          policy_rules?: Json
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_review_request_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_experience_review_requests: {
        Row: {
          created_at: string
          customer_id: string
          has_incentive: boolean
          has_score_gating: boolean
          id: string
          idempotency_key: string | null
          is_neutral_language: boolean
          organization_id: string
          pet_id: string | null
          platform_key: string
          requested_at: string | null
          scheduled_at: string | null
          status: string
          suppression_reason: string | null
          visit_id: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          has_incentive?: boolean
          has_score_gating?: boolean
          id?: string
          idempotency_key?: string | null
          is_neutral_language?: boolean
          organization_id: string
          pet_id?: string | null
          platform_key?: string
          requested_at?: string | null
          scheduled_at?: string | null
          status?: string
          suppression_reason?: string | null
          visit_id?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          has_incentive?: boolean
          has_score_gating?: boolean
          id?: string
          idempotency_key?: string | null
          is_neutral_language?: boolean
          organization_id?: string
          pet_id?: string | null
          platform_key?: string
          requested_at?: string | null
          scheduled_at?: string | null
          status?: string
          suppression_reason?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_review_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_review_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "customer_experience_review_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "customer_experience_review_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_review_requests_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_review_requests_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "customer_experience_review_requests_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "customer_experience_review_requests_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_experience_sensitive_suppressions: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          is_active: boolean
          organization_id: string
          pet_id: string | null
          reason: string
          registered_by_user_id: string | null
          suppression_type: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          is_active?: boolean
          organization_id: string
          pet_id?: string | null
          reason: string
          registered_by_user_id?: string | null
          suppression_type: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          is_active?: boolean
          organization_id?: string
          pet_id?: string | null
          reason?: string
          registered_by_user_id?: string | null
          suppression_type?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_sensitive_suppressions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_sensitive_suppressions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "customer_experience_sensitive_suppressions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "customer_experience_sensitive_suppressions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_sensitive_suppressions_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_sensitive_suppressions_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "customer_experience_sensitive_suppressions_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
        ]
      }
      customer_experience_survey_answers: {
        Row: {
          answered_at: string
          answers_payload: Json
          communication_clarity_score: number | null
          customer_id: string | null
          felt_heard_score: number | null
          followup_id: string | null
          id: string
          organization_id: string
          overall_score: number | null
          punctuality_score: number | null
          survey_version_id: string
          visit_id: string | null
        }
        Insert: {
          answered_at?: string
          answers_payload?: Json
          communication_clarity_score?: number | null
          customer_id?: string | null
          felt_heard_score?: number | null
          followup_id?: string | null
          id?: string
          organization_id: string
          overall_score?: number | null
          punctuality_score?: number | null
          survey_version_id: string
          visit_id?: string | null
        }
        Update: {
          answered_at?: string
          answers_payload?: Json
          communication_clarity_score?: number | null
          customer_id?: string | null
          felt_heard_score?: number | null
          followup_id?: string | null
          id?: string
          organization_id?: string
          overall_score?: number | null
          punctuality_score?: number | null
          survey_version_id?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_survey_answers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_survey_answers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "customer_experience_survey_answers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "customer_experience_survey_answers_followup_id_fkey"
            columns: ["followup_id"]
            isOneToOne: false
            referencedRelation: "customer_experience_followups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_survey_answers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_survey_answers_survey_version_id_fkey"
            columns: ["survey_version_id"]
            isOneToOne: false
            referencedRelation: "customer_experience_survey_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_survey_answers_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_experience_survey_versions: {
        Row: {
          created_at: string
          id: string
          is_current: boolean
          questions: Json
          survey_id: string
          version_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_current?: boolean
          questions?: Json
          survey_id: string
          version_number?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_current?: boolean
          questions?: Json
          survey_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_survey_versions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "customer_experience_surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_experience_surveys: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          organization_id: string
          slug: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          organization_id: string
          slug: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string
          slug?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_surveys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_experience_testimonial_consents: {
        Row: {
          allow_customer_name: boolean
          allow_pet_name: boolean
          allow_photo: boolean
          allowed_channels: Json
          consent_notes: string | null
          created_at: string
          customer_id: string
          granted_at: string | null
          id: string
          organization_id: string
          pet_id: string | null
          revoked_at: string | null
          status: string
        }
        Insert: {
          allow_customer_name?: boolean
          allow_pet_name?: boolean
          allow_photo?: boolean
          allowed_channels?: Json
          consent_notes?: string | null
          created_at?: string
          customer_id: string
          granted_at?: string | null
          id?: string
          organization_id: string
          pet_id?: string | null
          revoked_at?: string | null
          status?: string
        }
        Update: {
          allow_customer_name?: boolean
          allow_pet_name?: boolean
          allow_photo?: boolean
          allowed_channels?: Json
          consent_notes?: string | null
          created_at?: string
          customer_id?: string
          granted_at?: string | null
          id?: string
          organization_id?: string
          pet_id?: string | null
          revoked_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_testimonial_consents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_testimonial_consents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "customer_experience_testimonial_consents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "customer_experience_testimonial_consents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_testimonial_consents_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_testimonial_consents_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "customer_experience_testimonial_consents_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
        ]
      }
      customer_experience_testimonials: {
        Row: {
          approved_by_user_id: string | null
          consent_id: string
          content: string
          created_at: string
          feedback_id: string | null
          id: string
          organization_id: string
          published_at: string | null
          status: string
        }
        Insert: {
          approved_by_user_id?: string | null
          consent_id: string
          content: string
          created_at?: string
          feedback_id?: string | null
          id?: string
          organization_id: string
          published_at?: string | null
          status?: string
        }
        Update: {
          approved_by_user_id?: string | null
          consent_id?: string
          content?: string
          created_at?: string
          feedback_id?: string | null
          id?: string
          organization_id?: string
          published_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_experience_testimonials_consent_id_fkey"
            columns: ["consent_id"]
            isOneToOne: false
            referencedRelation: "customer_experience_testimonial_consents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_testimonials_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "customer_experience_feedback"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_experience_testimonials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_tracking_access: {
        Row: {
          access_token_hash: string
          appointment_id: string
          client_id: string
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          max_queries: number
          organization_id: string
          query_count: number
          revoked_at: string | null
          visit_id: string | null
        }
        Insert: {
          access_token_hash: string
          appointment_id: string
          client_id: string
          created_at?: string
          expires_at: string
          id?: string
          is_active?: boolean
          max_queries?: number
          organization_id: string
          query_count?: number
          revoked_at?: string | null
          visit_id?: string | null
        }
        Update: {
          access_token_hash?: string
          appointment_id?: string
          client_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          max_queries?: number
          organization_id?: string
          query_count?: number
          revoked_at?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_tracking_access_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_tracking_access_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "customer_tracking_access_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_tracking_access_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "customer_tracking_access_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "customer_tracking_access_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_tracking_access_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_value_metrics: {
        Row: {
          average_ticket_cop: number
          id: string
          last_visit_date: string | null
          loyalty_tier: string
          organization_id: string
          outstanding_balance_cop: number
          owner_id: string
          total_spent_cop: number
          total_visits_count: number
          updated_at: string
        }
        Insert: {
          average_ticket_cop?: number
          id?: string
          last_visit_date?: string | null
          loyalty_tier?: string
          organization_id: string
          outstanding_balance_cop?: number
          owner_id: string
          total_spent_cop?: number
          total_visits_count?: number
          updated_at?: string
        }
        Update: {
          average_ticket_cop?: number
          id?: string
          last_visit_date?: string | null
          loyalty_tier?: string
          organization_id?: string
          outstanding_balance_cop?: number
          owner_id?: string
          total_spent_cop?: number
          total_visits_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_value_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_value_metrics_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_value_metrics_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "customer_value_metrics_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
        ]
      }
      dead_letter_queue: {
        Row: {
          created_at: string
          event_type: string
          failure_reason: string
          id: string
          outbox_id: string | null
          payload: Json
          resolved_at: string | null
          resolved_by: string | null
          stack_trace: string | null
          status: string
        }
        Insert: {
          created_at?: string
          event_type: string
          failure_reason: string
          id?: string
          outbox_id?: string | null
          payload: Json
          resolved_at?: string | null
          resolved_by?: string | null
          stack_trace?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          event_type?: string
          failure_reason?: string
          id?: string
          outbox_id?: string | null
          payload?: Json
          resolved_at?: string | null
          resolved_by?: string | null
          stack_trace?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "dead_letter_queue_outbox_id_fkey"
            columns: ["outbox_id"]
            isOneToOne: false
            referencedRelation: "transactional_outbox"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dead_letter_queue_outbox_id_fkey"
            columns: ["outbox_id"]
            isOneToOne: false
            referencedRelation: "v_n8n_outbox_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      delay_affected_appointments: {
        Row: {
          appointment_id: string
          created_at: string
          delay_incident_id: string
          delay_minutes: number
          id: string
          original_scheduled_start: string
          predicted_delayed_start: string
          status: string
          stop_order: number
        }
        Insert: {
          appointment_id: string
          created_at?: string
          delay_incident_id: string
          delay_minutes: number
          id?: string
          original_scheduled_start: string
          predicted_delayed_start: string
          status?: string
          stop_order: number
        }
        Update: {
          appointment_id?: string
          created_at?: string
          delay_incident_id?: string
          delay_minutes?: number
          id?: string
          original_scheduled_start?: string
          predicted_delayed_start?: string
          status?: string
          stop_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "delay_affected_appointments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delay_affected_appointments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "delay_affected_appointments_delay_incident_id_fkey"
            columns: ["delay_incident_id"]
            isOneToOne: false
            referencedRelation: "delay_incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      delay_incidents: {
        Row: {
          appointment_id: string
          consecutive_count: number
          created_at: string
          current_delay_minutes: number
          customer_notified: boolean
          detected_at: string
          id: string
          initial_delay_minutes: number
          internal_alert_sent: boolean
          organization_id: string
          recovery_state: string
          resolved_at: string | null
          route_id: string | null
          severity: string
          status: string
          updated_at: string
          visit_id: string | null
        }
        Insert: {
          appointment_id: string
          consecutive_count?: number
          created_at?: string
          current_delay_minutes: number
          customer_notified?: boolean
          detected_at?: string
          id?: string
          initial_delay_minutes: number
          internal_alert_sent?: boolean
          organization_id: string
          recovery_state?: string
          resolved_at?: string | null
          route_id?: string | null
          severity: string
          status?: string
          updated_at?: string
          visit_id?: string | null
        }
        Update: {
          appointment_id?: string
          consecutive_count?: number
          created_at?: string
          current_delay_minutes?: number
          customer_notified?: boolean
          detected_at?: string
          id?: string
          initial_delay_minutes?: number
          internal_alert_sent?: boolean
          organization_id?: string
          recovery_state?: string
          resolved_at?: string | null
          route_id?: string | null
          severity?: string
          status?: string
          updated_at?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delay_incidents_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delay_incidents_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "delay_incidents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delay_incidents_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delay_incidents_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      delay_notification_dispatches: {
        Row: {
          appointment_id: string
          correlation_id: string
          created_at: string
          customer_id: string
          delay_incident_id: string | null
          delay_minutes: number
          delivered_at: string | null
          eta_reference: string
          id: string
          idempotency_key: string
          notification_type: string
          organization_id: string
          policy_version: number
          provider_message_id: string | null
          sent_at: string | null
          status: string
          template_version: string
        }
        Insert: {
          appointment_id: string
          correlation_id: string
          created_at?: string
          customer_id: string
          delay_incident_id?: string | null
          delay_minutes: number
          delivered_at?: string | null
          eta_reference: string
          id?: string
          idempotency_key: string
          notification_type: string
          organization_id: string
          policy_version?: number
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string
          template_version?: string
        }
        Update: {
          appointment_id?: string
          correlation_id?: string
          created_at?: string
          customer_id?: string
          delay_incident_id?: string | null
          delay_minutes?: number
          delivered_at?: string | null
          eta_reference?: string
          id?: string
          idempotency_key?: string
          notification_type?: string
          organization_id?: string
          policy_version?: number
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string
          template_version?: string
        }
        Relationships: [
          {
            foreignKeyName: "delay_notification_dispatches_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delay_notification_dispatches_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "delay_notification_dispatches_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delay_notification_dispatches_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "delay_notification_dispatches_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "delay_notification_dispatches_delay_incident_id_fkey"
            columns: ["delay_incident_id"]
            isOneToOne: false
            referencedRelation: "delay_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delay_notification_dispatches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      delay_notification_policies: {
        Row: {
          approved_by: string | null
          created_at: string
          customer_notification_threshold_minutes: number
          customer_notification_window: Json
          effective_at: string
          enabled: boolean
          escalation_policy_id: string | null
          eta_recalculation_interval_seconds: number
          id: string
          internal_alert_threshold_minutes: number
          location_stale_after_seconds: number
          minimum_eta_change_minutes: number
          minimum_update_interval_minutes: number
          mode: string
          organization_id: string
          required_consecutive_predictions: number
          version: number
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          customer_notification_threshold_minutes?: number
          customer_notification_window?: Json
          effective_at?: string
          enabled?: boolean
          escalation_policy_id?: string | null
          eta_recalculation_interval_seconds?: number
          id?: string
          internal_alert_threshold_minutes?: number
          location_stale_after_seconds?: number
          minimum_eta_change_minutes?: number
          minimum_update_interval_minutes?: number
          mode?: string
          organization_id: string
          required_consecutive_predictions?: number
          version?: number
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          customer_notification_threshold_minutes?: number
          customer_notification_window?: Json
          effective_at?: string
          enabled?: boolean
          escalation_policy_id?: string | null
          eta_recalculation_interval_seconds?: number
          id?: string
          internal_alert_threshold_minutes?: number
          location_stale_after_seconds?: number
          minimum_eta_change_minutes?: number
          minimum_update_interval_minutes?: number
          mode?: string
          organization_id?: string
          required_consecutive_predictions?: number
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "delay_notification_policies_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delay_notification_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_access_events: {
        Row: {
          access_result: string
          access_type: string
          actor_id: string | null
          correlation_id: string | null
          document_id: string
          document_version_id: string
          id: string
          ip_masked: string | null
          occurred_at: string
          recipient_id: string
          user_agent_category: string | null
        }
        Insert: {
          access_result: string
          access_type: string
          actor_id?: string | null
          correlation_id?: string | null
          document_id: string
          document_version_id: string
          id?: string
          ip_masked?: string | null
          occurred_at?: string
          recipient_id: string
          user_agent_category?: string | null
        }
        Update: {
          access_result?: string
          access_type?: string
          actor_id?: string | null
          correlation_id?: string | null
          document_id?: string
          document_version_id?: string
          id?: string
          ip_masked?: string | null
          occurred_at?: string
          recipient_id?: string
          user_agent_category?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_access_events_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_access_events_document_version_id_fkey"
            columns: ["document_version_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      document_access_grants: {
        Row: {
          access_token: string
          created_at: string
          document_version_id: string
          expires_at: string
          grant_strategy: string
          id: string
          is_revoked: boolean
          recipient_id: string
          recipient_type: string
          revoked_at: string | null
          signed_url: string | null
        }
        Insert: {
          access_token: string
          created_at?: string
          document_version_id: string
          expires_at: string
          grant_strategy: string
          id?: string
          is_revoked?: boolean
          recipient_id: string
          recipient_type: string
          revoked_at?: string | null
          signed_url?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string
          document_version_id?: string
          expires_at?: string
          grant_strategy?: string
          id?: string
          is_revoked?: boolean
          recipient_id?: string
          recipient_type?: string
          revoked_at?: string | null
          signed_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_access_grants_document_version_id_fkey"
            columns: ["document_version_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      document_approvals: {
        Row: {
          approval_policy_version: string
          approval_type: string
          approver_id: string
          approver_role: string
          audit_reference: string | null
          created_at: string
          decision: string
          document_version_id: string
          id: string
          professional_card_number: string | null
          reason: string | null
        }
        Insert: {
          approval_policy_version?: string
          approval_type?: string
          approver_id: string
          approver_role: string
          audit_reference?: string | null
          created_at?: string
          decision: string
          document_version_id: string
          id?: string
          professional_card_number?: string | null
          reason?: string | null
        }
        Update: {
          approval_policy_version?: string
          approval_type?: string
          approver_id?: string
          approver_role?: string
          audit_reference?: string | null
          created_at?: string
          decision?: string
          document_version_id?: string
          id?: string
          professional_card_number?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_approvals_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_approvals_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "document_approvals_document_version_id_fkey"
            columns: ["document_version_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      document_audit: {
        Row: {
          action: string
          actor_id: string | null
          correlation_id: string | null
          created_at: string
          document_id: string | null
          document_version_id: string | null
          id: string
          metadata: Json | null
          new_state: string | null
          organization_id: string
          previous_state: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          correlation_id?: string | null
          created_at?: string
          document_id?: string | null
          document_version_id?: string | null
          id?: string
          metadata?: Json | null
          new_state?: string | null
          organization_id: string
          previous_state?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          correlation_id?: string | null
          created_at?: string
          document_id?: string | null
          document_version_id?: string | null
          id?: string
          metadata?: Json | null
          new_state?: string | null
          organization_id?: string
          previous_state?: string | null
        }
        Relationships: []
      }
      document_deletion_requests: {
        Row: {
          created_at: string
          document_id: string
          id: string
          reason: string
          rejection_reason: string | null
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          reason: string
          rejection_reason?: string | null
          requested_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          reason?: string
          rejection_reason?: string | null
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_deletion_requests_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_deletion_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_deletion_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "document_deletion_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_deletion_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      document_delivery_attempts: {
        Row: {
          attempt_number: number
          attempted_at: string
          channel: string
          delivery_request_id: string
          error_code: string | null
          error_message: string | null
          id: string
          provider_message_id: string | null
          provider_status: string
          target_destination: string
        }
        Insert: {
          attempt_number?: number
          attempted_at?: string
          channel: string
          delivery_request_id: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          provider_message_id?: string | null
          provider_status: string
          target_destination: string
        }
        Update: {
          attempt_number?: number
          attempted_at?: string
          channel?: string
          delivery_request_id?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          provider_message_id?: string | null
          provider_status?: string
          target_destination?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_delivery_attempts_delivery_request_id_fkey"
            columns: ["delivery_request_id"]
            isOneToOne: false
            referencedRelation: "document_delivery_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      document_delivery_requests: {
        Row: {
          access_grant_id: string | null
          authorization_reference: string
          created_at: string
          delivery_channel: string
          document_version_id: string
          id: string
          idempotency_key: string
          message_request_id: string | null
          organization_id: string
          purpose: string
          recipient_id: string
          recipient_type: string
          status: string
          updated_at: string
        }
        Insert: {
          access_grant_id?: string | null
          authorization_reference: string
          created_at?: string
          delivery_channel: string
          document_version_id: string
          id?: string
          idempotency_key: string
          message_request_id?: string | null
          organization_id: string
          purpose: string
          recipient_id: string
          recipient_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          access_grant_id?: string | null
          authorization_reference?: string
          created_at?: string
          delivery_channel?: string
          document_version_id?: string
          id?: string
          idempotency_key?: string
          message_request_id?: string | null
          organization_id?: string
          purpose?: string
          recipient_id?: string
          recipient_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_delivery_requests_access_grant_id_fkey"
            columns: ["access_grant_id"]
            isOneToOne: false
            referencedRelation: "document_access_grants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_delivery_requests_document_version_id_fkey"
            columns: ["document_version_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_delivery_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_recipient_permissions: {
        Row: {
          created_at: string
          document_id: string
          id: string
          is_revoked: boolean
          permission_level: string
          recipient_id: string
          recipient_type: string
          revocation_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          is_revoked?: boolean
          permission_level?: string
          recipient_id: string
          recipient_type: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          is_revoked?: boolean
          permission_level?: string
          recipient_id?: string
          recipient_type?: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_recipient_permissions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_recipient_permissions_revoked_by_fkey"
            columns: ["revoked_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_recipient_permissions_revoked_by_fkey"
            columns: ["revoked_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      document_retention_policies: {
        Row: {
          allow_early_deletion: boolean
          category: string
          created_at: string
          id: string
          retention_years: number
          statutory_legal_basis: string
        }
        Insert: {
          allow_early_deletion?: boolean
          category: string
          created_at?: string
          id?: string
          retention_years: number
          statutory_legal_basis: string
        }
        Update: {
          allow_early_deletion?: boolean
          category?: string
          created_at?: string
          id?: string
          retention_years?: number
          statutory_legal_basis?: string
        }
        Relationships: []
      }
      document_versions: {
        Row: {
          approval_notes: string | null
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          declared_mime_type: string
          detected_file_type: string
          document_id: string
          file_size_bytes: number
          id: string
          security_scan_status: string
          sha256_digest: string
          storage_object_key: string
          superseded_at: string | null
          upload_status: string
          validation_status: string
          version_number: number
        }
        Insert: {
          approval_notes?: string | null
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          declared_mime_type: string
          detected_file_type: string
          document_id: string
          file_size_bytes: number
          id?: string
          security_scan_status?: string
          sha256_digest: string
          storage_object_key: string
          superseded_at?: string | null
          upload_status?: string
          validation_status?: string
          version_number?: number
        }
        Update: {
          approval_notes?: string | null
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          declared_mime_type?: string
          detected_file_type?: string
          document_id?: string
          file_size_bytes?: number
          id?: string
          security_scan_status?: string
          sha256_digest?: string
          storage_object_key?: string
          superseded_at?: string | null
          upload_status?: string
          validation_status?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          appointment_id: string | null
          classification: string
          correlation_id: string | null
          created_at: string
          created_by: string | null
          current_version_id: string | null
          current_version_number: number
          customer_id: string
          document_status: string
          document_type: string
          id: string
          is_confidential_clinical: boolean
          organization_id: string
          pet_id: string
          referral_id: string | null
          retention_category: string
          source_reference: string | null
          source_system: string
          storage_bucket_reference: string
          storage_object_reference: string | null
          updated_at: string
          visit_id: string | null
        }
        Insert: {
          appointment_id?: string | null
          classification?: string
          correlation_id?: string | null
          created_at?: string
          created_by?: string | null
          current_version_id?: string | null
          current_version_number?: number
          customer_id: string
          document_status?: string
          document_type: string
          id?: string
          is_confidential_clinical?: boolean
          organization_id: string
          pet_id: string
          referral_id?: string | null
          retention_category?: string
          source_reference?: string | null
          source_system?: string
          storage_bucket_reference?: string
          storage_object_reference?: string | null
          updated_at?: string
          visit_id?: string | null
        }
        Update: {
          appointment_id?: string | null
          classification?: string
          correlation_id?: string | null
          created_at?: string
          created_by?: string | null
          current_version_id?: string | null
          current_version_number?: number
          customer_id?: string
          document_status?: string
          document_type?: string
          id?: string
          is_confidential_clinical?: boolean
          organization_id?: string
          pet_id?: string
          referral_id?: string | null
          retention_category?: string
          source_reference?: string | null
          source_system?: string
          storage_bucket_reference?: string
          storage_object_reference?: string | null
          updated_at?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "documents_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "documents_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "specialist_referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_doc_current_version"
            columns: ["current_version_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      eta_predictions: {
        Row: {
          appointment_id: string
          calculated_at: string
          confidence: string
          created_at: string
          eta_source: string
          id: string
          location_observed_at: string | null
          organization_id: string
          predicted_arrival_at: string
          predicted_travel_minutes: number
          status: string
          visit_id: string | null
          warnings: Json
        }
        Insert: {
          appointment_id: string
          calculated_at?: string
          confidence: string
          created_at?: string
          eta_source: string
          id?: string
          location_observed_at?: string | null
          organization_id: string
          predicted_arrival_at: string
          predicted_travel_minutes: number
          status?: string
          visit_id?: string | null
          warnings?: Json
        }
        Update: {
          appointment_id?: string
          calculated_at?: string
          confidence?: string
          created_at?: string
          eta_source?: string
          id?: string
          location_observed_at?: string | null
          organization_id?: string
          predicted_arrival_at?: string
          predicted_travel_minutes?: number
          status?: string
          visit_id?: string | null
          warnings?: Json
        }
        Relationships: [
          {
            foreignKeyName: "eta_predictions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eta_predictions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "eta_predictions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eta_predictions_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_action_requests: {
        Row: {
          action_key: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          payload: Json
          snapshot_id: string
          status: string
          target_module: string
          title: string
        }
        Insert: {
          action_key: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          payload?: Json
          snapshot_id: string
          status: string
          target_module: string
          title: string
        }
        Update: {
          action_key?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          payload?: Json
          snapshot_id?: string
          status?: string
          target_module?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "executive_action_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executive_action_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "executive_action_requests_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "executive_daily_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_capacity_analyses: {
        Row: {
          active_vets_count: number
          admin_hours: number
          capacity_utilization_rate: number | null
          clinical_visit_hours: number
          created_at: string
          id: string
          organization_id: string
          overloaded_vets_count: number
          protected_break_hours: number
          report_version_id: string
          scheduled_shifts_count: number
          total_scheduled_hours: number
          travel_hours: number
          uncovered_absence_shifts: number
          usable_capacity_hours: number
          zone_distribution: Json
        }
        Insert: {
          active_vets_count?: number
          admin_hours?: number
          capacity_utilization_rate?: number | null
          clinical_visit_hours?: number
          created_at?: string
          id?: string
          organization_id: string
          overloaded_vets_count?: number
          protected_break_hours?: number
          report_version_id: string
          scheduled_shifts_count?: number
          total_scheduled_hours?: number
          travel_hours?: number
          uncovered_absence_shifts?: number
          usable_capacity_hours?: number
          zone_distribution?: Json
        }
        Update: {
          active_vets_count?: number
          admin_hours?: number
          capacity_utilization_rate?: number | null
          clinical_visit_hours?: number
          created_at?: string
          id?: string
          organization_id?: string
          overloaded_vets_count?: number
          protected_break_hours?: number
          report_version_id?: string
          scheduled_shifts_count?: number
          total_scheduled_hours?: number
          travel_hours?: number
          uncovered_absence_shifts?: number
          usable_capacity_hours?: number
          zone_distribution?: Json
        }
        Relationships: [
          {
            foreignKeyName: "executive_capacity_analyses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executive_capacity_analyses_report_version_id_fkey"
            columns: ["report_version_id"]
            isOneToOne: false
            referencedRelation: "executive_weekly_report_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_continuity_analyses: {
        Row: {
          active_recurring_plans: number
          active_specialist_referrals: number
          created_at: string
          documents_pending_delivery: number
          id: string
          post_visit_commitments_open: number
          post_visit_commitments_overdue: number
          preventive_outdated_records: number
          preventive_vaccines_applied: number
          recurring_missed_sessions: number
          recurring_visits_completed: number
          report_version_id: string
          specialist_reports_pending: number
        }
        Insert: {
          active_recurring_plans?: number
          active_specialist_referrals?: number
          created_at?: string
          documents_pending_delivery?: number
          id?: string
          post_visit_commitments_open?: number
          post_visit_commitments_overdue?: number
          preventive_outdated_records?: number
          preventive_vaccines_applied?: number
          recurring_missed_sessions?: number
          recurring_visits_completed?: number
          report_version_id: string
          specialist_reports_pending?: number
        }
        Update: {
          active_recurring_plans?: number
          active_specialist_referrals?: number
          created_at?: string
          documents_pending_delivery?: number
          id?: string
          post_visit_commitments_open?: number
          post_visit_commitments_overdue?: number
          preventive_outdated_records?: number
          preventive_vaccines_applied?: number
          recurring_missed_sessions?: number
          recurring_visits_completed?: number
          report_version_id?: string
          specialist_reports_pending?: number
        }
        Relationships: [
          {
            foreignKeyName: "executive_continuity_analyses_report_version_id_fkey"
            columns: ["report_version_id"]
            isOneToOne: false
            referencedRelation: "executive_weekly_report_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_daily_report_versions: {
        Row: {
          change_reason: string
          changed_by: string | null
          created_at: string
          id: string
          metrics_diff: Json | null
          report_id: string
          snapshot_id: string
          version_number: number
        }
        Insert: {
          change_reason: string
          changed_by?: string | null
          created_at?: string
          id?: string
          metrics_diff?: Json | null
          report_id: string
          snapshot_id: string
          version_number: number
        }
        Update: {
          change_reason?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          metrics_diff?: Json | null
          report_id?: string
          snapshot_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "executive_daily_report_versions_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executive_daily_report_versions_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "executive_daily_report_versions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "executive_daily_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executive_daily_report_versions_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "executive_daily_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_daily_reports: {
        Row: {
          created_at: string
          delivered_to: Json | null
          delivery_status: string | null
          executive_narrative: string | null
          id: string
          narrative_status: string | null
          organization_id: string
          quality_warnings: Json | null
          quick_brief_60s: string | null
          report_date: string
          report_version: number
          snapshot_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivered_to?: Json | null
          delivery_status?: string | null
          executive_narrative?: string | null
          id?: string
          narrative_status?: string | null
          organization_id: string
          quality_warnings?: Json | null
          quick_brief_60s?: string | null
          report_date: string
          report_version?: number
          snapshot_id: string
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivered_to?: Json | null
          delivery_status?: string | null
          executive_narrative?: string | null
          id?: string
          narrative_status?: string | null
          organization_id?: string
          quality_warnings?: Json | null
          quick_brief_60s?: string | null
          report_date?: string
          report_version?: number
          snapshot_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "executive_daily_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executive_daily_reports_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "executive_daily_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_daily_snapshots: {
        Row: {
          approved_by: string | null
          created_at: string
          created_by: string | null
          cutoff_at: string
          data_version_reference: string | null
          decisions: Json
          exceptions: Json
          generated_at: string
          id: string
          metric_definition_version: string
          metrics: Json
          organization_id: string
          priorities: Json
          quality_status: string
          report_date: string
          risks: Json
          snapshot_version: number
          source_freshness_summary: Json | null
          status: string
          timezone: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          cutoff_at: string
          data_version_reference?: string | null
          decisions?: Json
          exceptions?: Json
          generated_at?: string
          id?: string
          metric_definition_version?: string
          metrics?: Json
          organization_id: string
          priorities?: Json
          quality_status: string
          report_date: string
          risks?: Json
          snapshot_version?: number
          source_freshness_summary?: Json | null
          status: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          cutoff_at?: string
          data_version_reference?: string | null
          decisions?: Json
          exceptions?: Json
          generated_at?: string
          id?: string
          metric_definition_version?: string
          metrics?: Json
          organization_id?: string
          priorities?: Json
          quality_status?: string
          report_date?: string
          risks?: Json
          snapshot_version?: number
          source_freshness_summary?: Json | null
          status?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "executive_daily_snapshots_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executive_daily_snapshots_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "executive_daily_snapshots_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executive_daily_snapshots_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "executive_daily_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_decision_requests: {
        Row: {
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decided_option: string | null
          decision_type: string
          description: string
          id: string
          options: Json
          snapshot_id: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decided_option?: string | null
          decision_type: string
          description: string
          id?: string
          options?: Json
          snapshot_id: string
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decided_option?: string | null
          decision_type?: string
          description?: string
          id?: string
          options?: Json
          snapshot_id?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "executive_decision_requests_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executive_decision_requests_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "executive_decision_requests_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "executive_daily_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_founder_dependency_analyses: {
        Row: {
          automated_processes_completed: number
          created_at: string
          id: string
          operational_autonomy_rate: number | null
          operational_bottlenecks_caused_by_absence: number
          organization_id: string
          pending_decisions_for_luis: number
          report_version_id: string
          tasks_delegable_proposed: number
          tasks_delegated_and_resolved: number
          tasks_required_by_policy: number
          total_inbound_tasks_to_luis: number
          verified_time_saving_hours: number | null
        }
        Insert: {
          automated_processes_completed?: number
          created_at?: string
          id?: string
          operational_autonomy_rate?: number | null
          operational_bottlenecks_caused_by_absence?: number
          organization_id: string
          pending_decisions_for_luis?: number
          report_version_id: string
          tasks_delegable_proposed?: number
          tasks_delegated_and_resolved?: number
          tasks_required_by_policy?: number
          total_inbound_tasks_to_luis?: number
          verified_time_saving_hours?: number | null
        }
        Update: {
          automated_processes_completed?: number
          created_at?: string
          id?: string
          operational_autonomy_rate?: number | null
          operational_bottlenecks_caused_by_absence?: number
          organization_id?: string
          pending_decisions_for_luis?: number
          report_version_id?: string
          tasks_delegable_proposed?: number
          tasks_delegated_and_resolved?: number
          tasks_required_by_policy?: number
          total_inbound_tasks_to_luis?: number
          verified_time_saving_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "executive_founder_dependency_analyses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executive_founder_dependency_analyses_report_version_id_fkey"
            columns: ["report_version_id"]
            isOneToOne: false
            referencedRelation: "executive_weekly_report_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_improvement_proposals: {
        Row: {
          approval_status: string
          created_at: string
          expected_operational_impact: string
          id: string
          linked_core07_task_id: string | null
          potential_risks: string | null
          problem_cluster_id: string | null
          proposal_description: string
          proposal_title: string
          proposed_assignee_role: string
          report_version_id: string
          requires_founder_approval: boolean
          target_completion_date: string | null
        }
        Insert: {
          approval_status?: string
          created_at?: string
          expected_operational_impact: string
          id?: string
          linked_core07_task_id?: string | null
          potential_risks?: string | null
          problem_cluster_id?: string | null
          proposal_description: string
          proposal_title: string
          proposed_assignee_role: string
          report_version_id: string
          requires_founder_approval?: boolean
          target_completion_date?: string | null
        }
        Update: {
          approval_status?: string
          created_at?: string
          expected_operational_impact?: string
          id?: string
          linked_core07_task_id?: string | null
          potential_risks?: string | null
          problem_cluster_id?: string | null
          proposal_description?: string
          proposal_title?: string
          proposed_assignee_role?: string
          report_version_id?: string
          requires_founder_approval?: boolean
          target_completion_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "executive_improvement_proposals_problem_cluster_id_fkey"
            columns: ["problem_cluster_id"]
            isOneToOne: false
            referencedRelation: "executive_recurring_problem_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executive_improvement_proposals_report_version_id_fkey"
            columns: ["report_version_id"]
            isOneToOne: false
            referencedRelation: "executive_weekly_report_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_metric_definitions: {
        Row: {
          calculation_method: string
          created_at: string
          currency: string | null
          date_attribution_rule: string
          definition_version: string
          description: string
          display_name: string
          is_active: boolean
          metric_key: string
          source_domain: string
          unit: string
        }
        Insert: {
          calculation_method: string
          created_at?: string
          currency?: string | null
          date_attribution_rule: string
          definition_version?: string
          description: string
          display_name: string
          is_active?: boolean
          metric_key: string
          source_domain: string
          unit?: string
        }
        Update: {
          calculation_method?: string
          created_at?: string
          currency?: string | null
          date_attribution_rule?: string
          definition_version?: string
          description?: string
          display_name?: string
          is_active?: boolean
          metric_key?: string
          source_domain?: string
          unit?: string
        }
        Relationships: []
      }
      executive_metric_quality_checks: {
        Row: {
          check_name: string
          checked_at: string
          details: Json | null
          domain: string
          id: string
          snapshot_id: string
          status: string
        }
        Insert: {
          check_name: string
          checked_at?: string
          details?: Json | null
          domain: string
          id?: string
          snapshot_id: string
          status: string
        }
        Update: {
          check_name?: string
          checked_at?: string
          details?: Json | null
          domain?: string
          id?: string
          snapshot_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "executive_metric_quality_checks_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "executive_daily_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_metric_results: {
        Row: {
          created_at: string
          discrepancies_detected: number | null
          formatted_value: string
          id: string
          metric_key: string
          numeric_value: number | null
          quality_status: string
          records_counted: number | null
          snapshot_id: string
          source_system: string
        }
        Insert: {
          created_at?: string
          discrepancies_detected?: number | null
          formatted_value: string
          id?: string
          metric_key: string
          numeric_value?: number | null
          quality_status: string
          records_counted?: number | null
          snapshot_id: string
          source_system: string
        }
        Update: {
          created_at?: string
          discrepancies_detected?: number | null
          formatted_value?: string
          id?: string
          metric_key?: string
          numeric_value?: number | null
          quality_status?: string
          records_counted?: number | null
          snapshot_id?: string
          source_system?: string
        }
        Relationships: [
          {
            foreignKeyName: "executive_metric_results_metric_key_fkey"
            columns: ["metric_key"]
            isOneToOne: false
            referencedRelation: "executive_metric_definitions"
            referencedColumns: ["metric_key"]
          },
          {
            foreignKeyName: "executive_metric_results_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "executive_daily_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_metric_sources: {
        Row: {
          created_at: string
          domain: string
          expected_refresh_policy: string
          last_sync_at: string | null
          source_key: string
          status: string
          system_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain: string
          expected_refresh_policy?: string
          last_sync_at?: string | null
          source_key: string
          status: string
          system_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string
          expected_refresh_policy?: string
          last_sync_at?: string | null
          source_key?: string
          status?: string
          system_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      executive_operational_exceptions: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          recommended_action: string | null
          resolved: boolean
          responsible_role: string | null
          severity: string
          snapshot_id: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          recommended_action?: string | null
          resolved?: boolean
          responsible_role?: string | null
          severity: string
          snapshot_id: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          recommended_action?: string | null
          resolved?: boolean
          responsible_role?: string | null
          severity?: string
          snapshot_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "executive_operational_exceptions_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "executive_daily_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_priority_recommendations: {
        Row: {
          action_type: string
          assigned_role: string
          created_at: string
          domain: string
          id: string
          priority_rank: number
          rationale: string
          requires_director_approval: boolean
          snapshot_id: string
          target_entity_reference: string | null
          title: string
        }
        Insert: {
          action_type: string
          assigned_role: string
          created_at?: string
          domain: string
          id?: string
          priority_rank: number
          rationale: string
          requires_director_approval?: boolean
          snapshot_id: string
          target_entity_reference?: string | null
          title: string
        }
        Update: {
          action_type?: string
          assigned_role?: string
          created_at?: string
          domain?: string
          id?: string
          priority_rank?: number
          rationale?: string
          requires_director_approval?: boolean
          snapshot_id?: string
          target_entity_reference?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "executive_priority_recommendations_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "executive_daily_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_profitability_analyses: {
        Row: {
          collected_reconciled_cop: number
          collected_verified_cop: number
          contribution_margin_cop: number | null
          contribution_margin_pct: number | null
          created_at: string
          direct_medical_supplies_cost_cop: number | null
          direct_specialist_fees_cop: number | null
          direct_travel_fuel_cost_cop: number | null
          gross_invoiced_cop: number
          id: string
          known_indirect_costs_cop: number | null
          missing_cost_categories: string[] | null
          net_profit_cop: number | null
          net_profit_status: string
          organization_id: string
          report_version_id: string
          total_known_direct_costs_cop: number | null
          unverified_pending_cop: number
        }
        Insert: {
          collected_reconciled_cop?: number
          collected_verified_cop?: number
          contribution_margin_cop?: number | null
          contribution_margin_pct?: number | null
          created_at?: string
          direct_medical_supplies_cost_cop?: number | null
          direct_specialist_fees_cop?: number | null
          direct_travel_fuel_cost_cop?: number | null
          gross_invoiced_cop?: number
          id?: string
          known_indirect_costs_cop?: number | null
          missing_cost_categories?: string[] | null
          net_profit_cop?: number | null
          net_profit_status?: string
          organization_id: string
          report_version_id: string
          total_known_direct_costs_cop?: number | null
          unverified_pending_cop?: number
        }
        Update: {
          collected_reconciled_cop?: number
          collected_verified_cop?: number
          contribution_margin_cop?: number | null
          contribution_margin_pct?: number | null
          created_at?: string
          direct_medical_supplies_cost_cop?: number | null
          direct_specialist_fees_cop?: number | null
          direct_travel_fuel_cost_cop?: number | null
          gross_invoiced_cop?: number
          id?: string
          known_indirect_costs_cop?: number | null
          missing_cost_categories?: string[] | null
          net_profit_cop?: number | null
          net_profit_status?: string
          organization_id?: string
          report_version_id?: string
          total_known_direct_costs_cop?: number | null
          unverified_pending_cop?: number
        }
        Relationships: [
          {
            foreignKeyName: "executive_profitability_analyses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executive_profitability_analyses_report_version_id_fkey"
            columns: ["report_version_id"]
            isOneToOne: false
            referencedRelation: "executive_weekly_report_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_recurring_problem_clusters: {
        Row: {
          cluster_domain: string
          created_at: string
          evidence_summary: string
          hypothesis_cause: string | null
          id: string
          incident_count: number
          is_verified_cause: boolean
          problem_title: string
          report_version_id: string
        }
        Insert: {
          cluster_domain: string
          created_at?: string
          evidence_summary: string
          hypothesis_cause?: string | null
          id?: string
          incident_count?: number
          is_verified_cause?: boolean
          problem_title: string
          report_version_id: string
        }
        Update: {
          cluster_domain?: string
          created_at?: string
          evidence_summary?: string
          hypothesis_cause?: string | null
          id?: string
          incident_count?: number
          is_verified_cause?: boolean
          problem_title?: string
          report_version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "executive_recurring_problem_clusters_report_version_id_fkey"
            columns: ["report_version_id"]
            isOneToOne: false
            referencedRelation: "executive_weekly_report_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_report_approvals: {
        Row: {
          approval_role: string
          approved_by: string
          created_at: string
          id: string
          notes: string | null
          report_id: string
          status: string
        }
        Insert: {
          approval_role: string
          approved_by: string
          created_at?: string
          id?: string
          notes?: string | null
          report_id: string
          status: string
        }
        Update: {
          approval_role?: string
          approved_by?: string
          created_at?: string
          id?: string
          notes?: string | null
          report_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "executive_report_approvals_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executive_report_approvals_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "executive_report_approvals_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "executive_daily_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_report_audit: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          id: string
          ip_address: unknown
          organization_id: string
          report_id: string | null
          snapshot_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          ip_address?: unknown
          organization_id: string
          report_id?: string | null
          snapshot_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          ip_address?: unknown
          organization_id?: string
          report_id?: string | null
          snapshot_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "executive_report_audit_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executive_report_audit_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "executive_report_audit_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_report_delivery_requests: {
        Row: {
          channel: string
          created_at: string
          id: string
          recipient_identifier: string
          recipient_role: string
          report_id: string
          send_enabled: boolean
          status: string
        }
        Insert: {
          channel: string
          created_at?: string
          id?: string
          recipient_identifier: string
          recipient_role: string
          report_id: string
          send_enabled?: boolean
          status?: string
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          recipient_identifier?: string
          recipient_role?: string
          report_id?: string
          send_enabled?: boolean
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "executive_report_delivery_requests_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "executive_daily_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_report_delivery_results: {
        Row: {
          created_at: string
          dispatched_at: string
          error_message: string | null
          id: string
          provider_receipt: string | null
          request_id: string
          success: boolean
        }
        Insert: {
          created_at?: string
          dispatched_at?: string
          error_message?: string | null
          id?: string
          provider_receipt?: string | null
          request_id: string
          success: boolean
        }
        Update: {
          created_at?: string
          dispatched_at?: string
          error_message?: string | null
          id?: string
          provider_receipt?: string | null
          request_id?: string
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "executive_report_delivery_results_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "executive_report_delivery_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_risk_signals: {
        Row: {
          created_at: string
          evidence: Json | null
          id: string
          mitigation_strategy: string | null
          risk_domain: string
          risk_level: string
          signal_title: string
          snapshot_id: string
        }
        Insert: {
          created_at?: string
          evidence?: Json | null
          id?: string
          mitigation_strategy?: string | null
          risk_domain: string
          risk_level: string
          signal_title: string
          snapshot_id: string
        }
        Update: {
          created_at?: string
          evidence?: Json | null
          id?: string
          mitigation_strategy?: string | null
          risk_domain?: string
          risk_level?: string
          signal_title?: string
          snapshot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "executive_risk_signals_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "executive_daily_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_source_freshness: {
        Row: {
          checked_at: string
          delay_minutes: number | null
          freshness_status: string
          id: string
          last_event_at: string | null
          snapshot_id: string
          source_key: string
        }
        Insert: {
          checked_at?: string
          delay_minutes?: number | null
          freshness_status: string
          id?: string
          last_event_at?: string | null
          snapshot_id: string
          source_key: string
        }
        Update: {
          checked_at?: string
          delay_minutes?: number | null
          freshness_status?: string
          id?: string
          last_event_at?: string | null
          snapshot_id?: string
          source_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "executive_source_freshness_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "executive_daily_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executive_source_freshness_source_key_fkey"
            columns: ["source_key"]
            isOneToOne: false
            referencedRelation: "executive_metric_sources"
            referencedColumns: ["source_key"]
          },
        ]
      }
      executive_weekly_action_plans: {
        Row: {
          action_domain: string
          action_title: string
          assignee_name: string
          created_at: string
          due_date: string
          id: string
          priority: string
          report_version_id: string
          status: string
        }
        Insert: {
          action_domain: string
          action_title: string
          assignee_name: string
          created_at?: string
          due_date: string
          id?: string
          priority?: string
          report_version_id: string
          status?: string
        }
        Update: {
          action_domain?: string
          action_title?: string
          assignee_name?: string
          created_at?: string
          due_date?: string
          id?: string
          priority?: string
          report_version_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "executive_weekly_action_plans_report_version_id_fkey"
            columns: ["report_version_id"]
            isOneToOne: false
            referencedRelation: "executive_weekly_report_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_weekly_audit: {
        Row: {
          created_at: string
          event_name: string
          id: string
          metadata: Json
          organization_id: string
          report_version_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          metadata?: Json
          organization_id: string
          report_version_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          metadata?: Json
          organization_id?: string
          report_version_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "executive_weekly_audit_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_weekly_decision_requests: {
        Row: {
          created_at: string
          deadline: string | null
          decision_context: string
          decision_title: string
          id: string
          recommended_option: string
          report_version_id: string
          status: string
        }
        Insert: {
          created_at?: string
          deadline?: string | null
          decision_context: string
          decision_title: string
          id?: string
          recommended_option: string
          report_version_id: string
          status?: string
        }
        Update: {
          created_at?: string
          deadline?: string | null
          decision_context?: string
          decision_title?: string
          id?: string
          recommended_option?: string
          report_version_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "executive_weekly_decision_requests_report_version_id_fkey"
            columns: ["report_version_id"]
            isOneToOne: false
            referencedRelation: "executive_weekly_report_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_weekly_metric_results: {
        Row: {
          aggregation_type: string
          created_at: string
          denominator: number | null
          formatted_value: string | null
          id: string
          metric_code: string
          numerator: number | null
          quality_status: string
          raw_value: number | null
          report_version_id: string
          warnings: string[] | null
        }
        Insert: {
          aggregation_type: string
          created_at?: string
          denominator?: number | null
          formatted_value?: string | null
          id?: string
          metric_code: string
          numerator?: number | null
          quality_status?: string
          raw_value?: number | null
          report_version_id: string
          warnings?: string[] | null
        }
        Update: {
          aggregation_type?: string
          created_at?: string
          denominator?: number | null
          formatted_value?: string | null
          id?: string
          metric_code?: string
          numerator?: number | null
          quality_status?: string
          raw_value?: number | null
          report_version_id?: string
          warnings?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "executive_weekly_metric_results_report_version_id_fkey"
            columns: ["report_version_id"]
            isOneToOne: false
            referencedRelation: "executive_weekly_report_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_weekly_report_deliveries: {
        Row: {
          channel: string
          created_at: string
          delivery_status: string
          id: string
          recipient_role: string
          report_version_id: string
          send_enabled: boolean
        }
        Insert: {
          channel: string
          created_at?: string
          delivery_status?: string
          id?: string
          recipient_role?: string
          report_version_id: string
          send_enabled?: boolean
        }
        Update: {
          channel?: string
          created_at?: string
          delivery_status?: string
          id?: string
          recipient_role?: string
          report_version_id?: string
          send_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "executive_weekly_report_deliveries_report_version_id_fkey"
            columns: ["report_version_id"]
            isOneToOne: false
            referencedRelation: "executive_weekly_report_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_weekly_report_versions: {
        Row: {
          approved_by: string | null
          created_at: string
          id: string
          is_current: boolean
          published_at: string | null
          report_id: string
          trigger_reason: string
          version_number: number
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          id?: string
          is_current?: boolean
          published_at?: string | null
          report_id: string
          trigger_reason?: string
          version_number: number
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          id?: string
          is_current?: boolean
          published_at?: string | null
          report_id?: string
          trigger_reason?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "executive_weekly_report_versions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executive_weekly_report_versions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "executive_weekly_report_versions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "executive_weekly_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_weekly_reports: {
        Row: {
          created_at: string
          current_version_number: number
          id: string
          organization_id: string
          quality_status: string
          report_status: string
          timezone: string
          updated_at: string
          week_end_exclusive_at: string
          week_label: string
          week_start_at: string
        }
        Insert: {
          created_at?: string
          current_version_number?: number
          id?: string
          organization_id: string
          quality_status?: string
          report_status?: string
          timezone?: string
          updated_at?: string
          week_end_exclusive_at: string
          week_label: string
          week_start_at: string
        }
        Update: {
          created_at?: string
          current_version_number?: number
          id?: string
          organization_id?: string
          quality_status?: string
          report_status?: string
          timezone?: string
          updated_at?: string
          week_end_exclusive_at?: string
          week_label?: string
          week_start_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "executive_weekly_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_weekly_snapshots: {
        Row: {
          comparisons_payload: Json
          created_at: string
          detailed_analysis: Json
          id: string
          integrity_hash_sha256: string
          metrics_payload: Json
          one_page_brief: string
          organization_id: string
          report_version_id: string
          source_data_cutoff: string
          trends_payload: Json
          week_end_exclusive_at: string
          week_label: string
          week_start_at: string
        }
        Insert: {
          comparisons_payload?: Json
          created_at?: string
          detailed_analysis?: Json
          id?: string
          integrity_hash_sha256: string
          metrics_payload?: Json
          one_page_brief: string
          organization_id: string
          report_version_id: string
          source_data_cutoff: string
          trends_payload?: Json
          week_end_exclusive_at: string
          week_label: string
          week_start_at: string
        }
        Update: {
          comparisons_payload?: Json
          created_at?: string
          detailed_analysis?: Json
          id?: string
          integrity_hash_sha256?: string
          metrics_payload?: Json
          one_page_brief?: string
          organization_id?: string
          report_version_id?: string
          source_data_cutoff?: string
          trends_payload?: Json
          week_end_exclusive_at?: string
          week_label?: string
          week_start_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "executive_weekly_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executive_weekly_snapshots_report_version_id_fkey"
            columns: ["report_version_id"]
            isOneToOne: false
            referencedRelation: "executive_weekly_report_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      external_calendar_events: {
        Row: {
          connection_id: string
          created_at: string
          end_time: string
          external_event_id: string
          id: string
          is_all_day: boolean
          is_busy: boolean | null
          organization_id: string | null
          privacy_mode: string | null
          source_provider: string | null
          start_time: string
          sync_hash: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          connection_id: string
          created_at?: string
          end_time: string
          external_event_id: string
          id?: string
          is_all_day?: boolean
          is_busy?: boolean | null
          organization_id?: string | null
          privacy_mode?: string | null
          source_provider?: string | null
          start_time: string
          sync_hash?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          connection_id?: string
          created_at?: string
          end_time?: string
          external_event_id?: string
          id?: string
          is_all_day?: boolean
          is_busy?: boolean | null
          organization_id?: string | null
          privacy_mode?: string | null
          source_provider?: string | null
          start_time?: string
          sync_hash?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_calendar_events_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "staff_calendar_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_calendar_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          environment: string
          flag_key: string
          id: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          environment?: string
          flag_key: string
          id?: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          environment?: string
          flag_key?: string
          id?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_surveys: {
        Row: {
          appointment_id: string
          clinical_care_rating: number | null
          comments: string | null
          id: string
          nps_score: number | null
          organization_id: string
          owner_id: string
          punctuality_rating: number | null
          staff_kindness_rating: number | null
          submitted_at: string
        }
        Insert: {
          appointment_id: string
          clinical_care_rating?: number | null
          comments?: string | null
          id?: string
          nps_score?: number | null
          organization_id: string
          owner_id: string
          punctuality_rating?: number | null
          staff_kindness_rating?: number | null
          submitted_at?: string
        }
        Update: {
          appointment_id?: string
          clinical_care_rating?: number | null
          comments?: string | null
          id?: string
          nps_score?: number | null
          organization_id?: string
          owner_id?: string
          punctuality_rating?: number | null
          staff_kindness_rating?: number | null
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_surveys_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_surveys_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "feedback_surveys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_surveys_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_surveys_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "feedback_surveys_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
        ]
      }
      financial_audit_events: {
        Row: {
          action: string
          actor_id: string | null
          actor_role: string | null
          entity_id: string
          entity_type: string
          id: string
          new_state: Json | null
          occurred_at: string
          previous_state: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_role?: string | null
          entity_id: string
          entity_type: string
          id?: string
          new_state?: Json | null
          occurred_at?: string
          previous_state?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_role?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          new_state?: Json | null
          occurred_at?: string
          previous_state?: Json | null
        }
        Relationships: []
      }
      financial_bank_transfer_reports: {
        Row: {
          bank_name: string
          created_at: string
          currency: string
          declared_amount: number
          declared_reference: string
          id: string
          organization_id: string | null
          owner_id: string
          payment_request_id: string | null
          reconciliation_id: string | null
          screenshot_storage_path: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          bank_name: string
          created_at?: string
          currency?: string
          declared_amount: number
          declared_reference: string
          id?: string
          organization_id?: string | null
          owner_id: string
          payment_request_id?: string | null
          reconciliation_id?: string | null
          screenshot_storage_path?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          bank_name?: string
          created_at?: string
          currency?: string
          declared_amount?: number
          declared_reference?: string
          id?: string
          organization_id?: string | null
          owner_id?: string
          payment_request_id?: string | null
          reconciliation_id?: string | null
          screenshot_storage_path?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_bank_transfer_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_bank_transfer_reports_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_bank_transfer_reports_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "financial_bank_transfer_reports_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "financial_bank_transfer_reports_payment_request_id_fkey"
            columns: ["payment_request_id"]
            isOneToOne: false
            referencedRelation: "financial_payment_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_bank_transfer_reports_reconciliation_id_fkey"
            columns: ["reconciliation_id"]
            isOneToOne: false
            referencedRelation: "financial_payment_reconciliations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_bank_transfer_reports_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_bank_transfer_reports_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      financial_cash_receipts: {
        Row: {
          amount: number
          cash_receipt_code: string
          cashier_staff_id: string | null
          collector_staff_id: string
          created_at: string
          currency: string
          deposited_at: string | null
          deposited_to_cashier: boolean
          id: string
          payment_request_id: string | null
          received_at: string
        }
        Insert: {
          amount: number
          cash_receipt_code: string
          cashier_staff_id?: string | null
          collector_staff_id: string
          created_at?: string
          currency?: string
          deposited_at?: string | null
          deposited_to_cashier?: boolean
          id?: string
          payment_request_id?: string | null
          received_at?: string
        }
        Update: {
          amount?: number
          cash_receipt_code?: string
          cashier_staff_id?: string | null
          collector_staff_id?: string
          created_at?: string
          currency?: string
          deposited_at?: string | null
          deposited_to_cashier?: boolean
          id?: string
          payment_request_id?: string | null
          received_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_cash_receipts_cashier_staff_id_fkey"
            columns: ["cashier_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_cash_receipts_cashier_staff_id_fkey"
            columns: ["cashier_staff_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "financial_cash_receipts_collector_staff_id_fkey"
            columns: ["collector_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_cash_receipts_collector_staff_id_fkey"
            columns: ["collector_staff_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "financial_cash_receipts_payment_request_id_fkey"
            columns: ["payment_request_id"]
            isOneToOne: false
            referencedRelation: "financial_payment_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_credit_notes: {
        Row: {
          amount: number
          authorized_by: string
          created_at: string
          credit_note_number: string
          id: string
          invoice_id: string
          reason: string
          status: string
        }
        Insert: {
          amount: number
          authorized_by: string
          created_at?: string
          credit_note_number: string
          id?: string
          invoice_id: string
          reason: string
          status?: string
        }
        Update: {
          amount?: number
          authorized_by?: string
          created_at?: string
          credit_note_number?: string
          id?: string
          invoice_id?: string
          reason?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_credit_notes_authorized_by_fkey"
            columns: ["authorized_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_credit_notes_authorized_by_fkey"
            columns: ["authorized_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "financial_credit_notes_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "financial_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_customer_balances: {
        Row: {
          currency: string
          id: string
          last_calculated_at: string
          owner_id: string
          total_credit_balance: number
          total_receivable: number
          updated_at: string
        }
        Insert: {
          currency?: string
          id?: string
          last_calculated_at?: string
          owner_id: string
          total_credit_balance?: number
          total_receivable?: number
          updated_at?: string
        }
        Update: {
          currency?: string
          id?: string
          last_calculated_at?: string
          owner_id?: string
          total_credit_balance?: number
          total_receivable?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_customer_balances_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_customer_balances_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "financial_customer_balances_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
        ]
      }
      financial_disputes: {
        Row: {
          assigned_staff_id: string | null
          created_at: string
          currency: string
          dispute_type: string
          disputed_amount: number
          id: string
          owner_id: string
          payment_request_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          status: string
          transaction_id: string | null
        }
        Insert: {
          assigned_staff_id?: string | null
          created_at?: string
          currency?: string
          dispute_type: string
          disputed_amount: number
          id?: string
          owner_id: string
          payment_request_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
          transaction_id?: string | null
        }
        Update: {
          assigned_staff_id?: string | null
          created_at?: string
          currency?: string
          dispute_type?: string
          disputed_amount?: number
          id?: string
          owner_id?: string
          payment_request_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_disputes_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_disputes_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "financial_disputes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_disputes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "financial_disputes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "financial_disputes_payment_request_id_fkey"
            columns: ["payment_request_id"]
            isOneToOne: false
            referencedRelation: "financial_payment_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_disputes_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "financial_payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_invoices: {
        Row: {
          created_at: string
          currency: string
          fiscal_cufe: string | null
          fiscal_provider: string | null
          fiscal_qr_url: string | null
          id: string
          invoice_number: string
          issued_at: string | null
          organization_id: string | null
          owner_id: string
          payment_request_id: string | null
          status: string
          subtotal_amount: number
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          fiscal_cufe?: string | null
          fiscal_provider?: string | null
          fiscal_qr_url?: string | null
          id?: string
          invoice_number: string
          issued_at?: string | null
          organization_id?: string | null
          owner_id: string
          payment_request_id?: string | null
          status?: string
          subtotal_amount: number
          tax_amount: number
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          fiscal_cufe?: string | null
          fiscal_provider?: string | null
          fiscal_qr_url?: string | null
          id?: string
          invoice_number?: string
          issued_at?: string | null
          organization_id?: string | null
          owner_id?: string
          payment_request_id?: string | null
          status?: string
          subtotal_amount?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_invoices_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_invoices_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "financial_invoices_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "financial_invoices_payment_request_id_fkey"
            columns: ["payment_request_id"]
            isOneToOne: false
            referencedRelation: "financial_payment_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_notification_jobs: {
        Row: {
          created_at: string
          dispatched_at: string | null
          id: string
          notification_type: string
          owner_id: string
          payment_request_id: string | null
          quote_id: string | null
          scheduled_for: string
          status: string
          suppression_reason: string | null
        }
        Insert: {
          created_at?: string
          dispatched_at?: string | null
          id?: string
          notification_type: string
          owner_id: string
          payment_request_id?: string | null
          quote_id?: string | null
          scheduled_for?: string
          status?: string
          suppression_reason?: string | null
        }
        Update: {
          created_at?: string
          dispatched_at?: string | null
          id?: string
          notification_type?: string
          owner_id?: string
          payment_request_id?: string | null
          quote_id?: string | null
          scheduled_for?: string
          status?: string
          suppression_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_notification_jobs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_notification_jobs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "financial_notification_jobs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "financial_notification_jobs_payment_request_id_fkey"
            columns: ["payment_request_id"]
            isOneToOne: false
            referencedRelation: "financial_payment_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_notification_jobs_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "financial_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_payment_allocations: {
        Row: {
          allocated_amount: number
          allocated_at: string
          allocated_by: string | null
          currency: string
          id: string
          payment_request_id: string
          transaction_id: string
        }
        Insert: {
          allocated_amount: number
          allocated_at?: string
          allocated_by?: string | null
          currency?: string
          id?: string
          payment_request_id: string
          transaction_id: string
        }
        Update: {
          allocated_amount?: number
          allocated_at?: string
          allocated_by?: string | null
          currency?: string
          id?: string
          payment_request_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_payment_allocations_allocated_by_fkey"
            columns: ["allocated_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_payment_allocations_allocated_by_fkey"
            columns: ["allocated_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "financial_payment_allocations_payment_request_id_fkey"
            columns: ["payment_request_id"]
            isOneToOne: false
            referencedRelation: "financial_payment_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_payment_allocations_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "financial_payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_payment_links: {
        Row: {
          amount: number
          created_at: string
          currency: string
          expires_at: string
          id: string
          payment_request_id: string
          payment_url: string
          provider: string
          provider_link_id: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          expires_at: string
          id?: string
          payment_request_id: string
          payment_url: string
          provider: string
          provider_link_id?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          expires_at?: string
          id?: string
          payment_request_id?: string
          payment_url?: string
          provider?: string
          provider_link_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_payment_links_payment_request_id_fkey"
            columns: ["payment_request_id"]
            isOneToOne: false
            referencedRelation: "financial_payment_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_payment_reconciliations: {
        Row: {
          bank_statement_reference: string | null
          created_at: string
          discrepancy_reason: string | null
          evidence_notes: string | null
          id: string
          matched_amount: number | null
          payment_request_id: string | null
          reconciled_at: string | null
          reconciled_by: string | null
          reconciliation_status: string
          transaction_id: string | null
        }
        Insert: {
          bank_statement_reference?: string | null
          created_at?: string
          discrepancy_reason?: string | null
          evidence_notes?: string | null
          id?: string
          matched_amount?: number | null
          payment_request_id?: string | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          reconciliation_status?: string
          transaction_id?: string | null
        }
        Update: {
          bank_statement_reference?: string | null
          created_at?: string
          discrepancy_reason?: string | null
          evidence_notes?: string | null
          id?: string
          matched_amount?: number | null
          payment_request_id?: string | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          reconciliation_status?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_payment_reconciliations_payment_request_id_fkey"
            columns: ["payment_request_id"]
            isOneToOne: false
            referencedRelation: "financial_payment_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_payment_reconciliations_reconciled_by_fkey"
            columns: ["reconciled_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_payment_reconciliations_reconciled_by_fkey"
            columns: ["reconciled_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "financial_payment_reconciliations_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "financial_payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_payment_requests: {
        Row: {
          amount: number
          appointment_id: string | null
          created_at: string
          currency: string
          due_date: string
          id: string
          idempotency_key: string | null
          organization_id: string | null
          outstanding_amount: number
          owner_id: string
          paid_amount: number
          payment_request_code: string
          pet_id: string | null
          quote_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          created_at?: string
          currency?: string
          due_date: string
          id?: string
          idempotency_key?: string | null
          organization_id?: string | null
          outstanding_amount: number
          owner_id: string
          paid_amount?: number
          payment_request_code: string
          pet_id?: string | null
          quote_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          created_at?: string
          currency?: string
          due_date?: string
          id?: string
          idempotency_key?: string | null
          organization_id?: string | null
          outstanding_amount?: number
          owner_id?: string
          paid_amount?: number
          payment_request_code?: string
          pet_id?: string | null
          quote_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_payment_requests_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_payment_requests_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "financial_payment_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_payment_requests_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_payment_requests_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "financial_payment_requests_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "financial_payment_requests_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_payment_requests_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "financial_payment_requests_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "financial_payment_requests_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "financial_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          external_transaction_id: string
          fee_amount: number
          id: string
          net_amount: number
          occurred_at: string
          organization_id: string | null
          owner_id: string | null
          payment_request_id: string | null
          provider: string
          raw_event_payload: Json | null
          signature_verified: boolean
          transaction_status: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          external_transaction_id: string
          fee_amount?: number
          id?: string
          net_amount: number
          occurred_at?: string
          organization_id?: string | null
          owner_id?: string | null
          payment_request_id?: string | null
          provider: string
          raw_event_payload?: Json | null
          signature_verified?: boolean
          transaction_status: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          external_transaction_id?: string
          fee_amount?: number
          id?: string
          net_amount?: number
          occurred_at?: string
          organization_id?: string | null
          owner_id?: string | null
          payment_request_id?: string | null
          provider?: string
          raw_event_payload?: Json | null
          signature_verified?: boolean
          transaction_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_payment_transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_payment_transactions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_payment_transactions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "financial_payment_transactions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "financial_payment_transactions_payment_request_id_fkey"
            columns: ["payment_request_id"]
            isOneToOne: false
            referencedRelation: "financial_payment_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_quote_approvals: {
        Row: {
          approval_status: string
          created_at: string
          discount_amount: number
          discount_percentage: number
          id: string
          quote_id: string
          reason: string
          requested_by: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          version_number: number
        }
        Insert: {
          approval_status?: string
          created_at?: string
          discount_amount: number
          discount_percentage: number
          id?: string
          quote_id: string
          reason: string
          requested_by: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          version_number: number
        }
        Update: {
          approval_status?: string
          created_at?: string
          discount_amount?: number
          discount_percentage?: number
          id?: string
          quote_id?: string
          reason?: string
          requested_by?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "financial_quote_approvals_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "financial_quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_quote_approvals_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_quote_approvals_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "financial_quote_approvals_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_quote_approvals_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      financial_quote_items: {
        Row: {
          created_at: string
          description: string
          discount_amount: number
          id: string
          quantity: number
          quote_id: string
          service_rate_id: string | null
          tax_amount: number
          total_line_amount: number
          unit_price: number
          version_number: number
        }
        Insert: {
          created_at?: string
          description: string
          discount_amount?: number
          id?: string
          quantity?: number
          quote_id: string
          service_rate_id?: string | null
          tax_amount?: number
          total_line_amount: number
          unit_price: number
          version_number?: number
        }
        Update: {
          created_at?: string
          description?: string
          discount_amount?: number
          id?: string
          quantity?: number
          quote_id?: string
          service_rate_id?: string | null
          tax_amount?: number
          total_line_amount?: number
          unit_price?: number
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "financial_quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "financial_quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_quote_items_service_rate_id_fkey"
            columns: ["service_rate_id"]
            isOneToOne: false
            referencedRelation: "financial_service_rates"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_quote_versions: {
        Row: {
          change_reason: string | null
          created_at: string
          created_by: string | null
          discount_amount: number
          id: string
          items_json: Json
          quote_id: string
          subtotal_amount: number
          tax_amount: number
          total_amount: number
          version_number: number
        }
        Insert: {
          change_reason?: string | null
          created_at?: string
          created_by?: string | null
          discount_amount?: number
          id?: string
          items_json?: Json
          quote_id: string
          subtotal_amount: number
          tax_amount?: number
          total_amount: number
          version_number: number
        }
        Update: {
          change_reason?: string | null
          created_at?: string
          created_by?: string | null
          discount_amount?: number
          id?: string
          items_json?: Json
          quote_id?: string
          subtotal_amount?: number
          tax_amount?: number
          total_amount?: number
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "financial_quote_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_quote_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "financial_quote_versions_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "financial_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_quotes: {
        Row: {
          accepted_at: string | null
          appointment_id: string | null
          approved_by: string | null
          created_at: string
          currency: string
          current_version_number: number
          discount_amount: number
          id: string
          organization_id: string | null
          owner_id: string | null
          pet_id: string | null
          quote_number: string
          status: string
          subtotal_amount: number
          tax_amount: number
          total_amount: number
          updated_at: string
          valid_until: string
        }
        Insert: {
          accepted_at?: string | null
          appointment_id?: string | null
          approved_by?: string | null
          created_at?: string
          currency?: string
          current_version_number?: number
          discount_amount?: number
          id?: string
          organization_id?: string | null
          owner_id?: string | null
          pet_id?: string | null
          quote_number: string
          status?: string
          subtotal_amount?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          valid_until: string
        }
        Update: {
          accepted_at?: string | null
          appointment_id?: string | null
          approved_by?: string | null
          created_at?: string
          currency?: string
          current_version_number?: number
          discount_amount?: number
          id?: string
          organization_id?: string | null
          owner_id?: string | null
          pet_id?: string | null
          quote_number?: string
          status?: string
          subtotal_amount?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_quotes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_quotes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "financial_quotes_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_quotes_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "financial_quotes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_quotes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_quotes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "financial_quotes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "financial_quotes_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_quotes_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "financial_quotes_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
        ]
      }
      financial_refund_requests: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          completed_at: string | null
          created_at: string
          currency: string
          external_refund_reference: string | null
          id: string
          owner_id: string
          payment_request_id: string | null
          reason: string
          requested_by: string | null
          status: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          external_refund_reference?: string | null
          id?: string
          owner_id: string
          payment_request_id?: string | null
          reason: string
          requested_by?: string | null
          status?: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          external_refund_reference?: string | null
          id?: string
          owner_id?: string
          payment_request_id?: string | null
          reason?: string
          requested_by?: string | null
          status?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_refund_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_refund_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "financial_refund_requests_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_refund_requests_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "financial_refund_requests_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "financial_refund_requests_payment_request_id_fkey"
            columns: ["payment_request_id"]
            isOneToOne: false
            referencedRelation: "financial_payment_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_refund_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_refund_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "financial_refund_requests_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "financial_payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_service_rates: {
        Row: {
          base_price: number
          category: string
          created_at: string
          currency: string
          id: string
          is_active: boolean
          notes: string | null
          organization_id: string | null
          rate_version: number
          service_code: string
          service_id: string | null
          service_name: string
          tax_rate: number
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          base_price: number
          category?: string
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          organization_id?: string | null
          rate_version?: number
          service_code: string
          service_id?: string | null
          service_name: string
          tax_rate?: number
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          base_price?: number
          category?: string
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          organization_id?: string | null
          rate_version?: number
          service_code?: string
          service_id?: string | null
          service_name?: string
          tax_rate?: number
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_service_rates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_service_rates_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      founder_absence_delegations: {
        Row: {
          allows_clinical_actions: boolean
          created_at: string
          delegate_user_id: string
          delegator_user_id: string
          ends_at: string
          id: string
          is_active: boolean
          max_approval_amount_cop: number | null
          notes: string | null
          organization_id: string
          scope_type: string
          starts_at: string
          updated_at: string
        }
        Insert: {
          allows_clinical_actions?: boolean
          created_at?: string
          delegate_user_id: string
          delegator_user_id: string
          ends_at: string
          id?: string
          is_active?: boolean
          max_approval_amount_cop?: number | null
          notes?: string | null
          organization_id: string
          scope_type: string
          starts_at: string
          updated_at?: string
        }
        Update: {
          allows_clinical_actions?: boolean
          created_at?: string
          delegate_user_id?: string
          delegator_user_id?: string
          ends_at?: string
          id?: string
          is_active?: boolean
          max_approval_amount_cop?: number | null
          notes?: string | null
          organization_id?: string
          scope_type?: string
          starts_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "founder_absence_delegations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_backup_records: {
        Row: {
          backup_type: string
          checksum_sha256: string | null
          created_at: string
          file_reference: string
          id: string
          organization_id: string
          retention_until: string
          size_bytes: number
          status: string
          target_system: string
          verification_status: string
          verified_at: string | null
        }
        Insert: {
          backup_type: string
          checksum_sha256?: string | null
          created_at?: string
          file_reference: string
          id?: string
          organization_id: string
          retention_until?: string
          size_bytes?: number
          status?: string
          target_system: string
          verification_status?: string
          verified_at?: string | null
        }
        Update: {
          backup_type?: string
          checksum_sha256?: string | null
          created_at?: string
          file_reference?: string
          id?: string
          organization_id?: string
          retention_until?: string
          size_bytes?: number
          status?: string
          target_system?: string
          verification_status?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_backup_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_connector_capabilities: {
        Row: {
          capability_name: string
          connector_id: string
          created_at: string
          id: string
          is_verified: boolean
          organization_id: string
          restrictions: string | null
          sync_direction: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          capability_name: string
          connector_id: string
          created_at?: string
          id?: string
          is_verified?: boolean
          organization_id: string
          restrictions?: string | null
          sync_direction?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          capability_name?: string
          connector_id?: string
          created_at?: string
          id?: string
          is_verified?: boolean
          organization_id?: string
          restrictions?: string | null
          sync_direction?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_connector_capabilities_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "integration_connectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_connector_capabilities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_connectors: {
        Row: {
          account_reference: string | null
          authentication_type: string
          connector_key: string
          created_at: string
          display_name: string
          environment: string
          health_status: string
          id: string
          is_active: boolean
          last_error_at: string | null
          last_error_message: string | null
          last_successful_connection_at: string | null
          last_successful_sync_at: string | null
          metadata: Json
          organization_id: string
          provider: string
          updated_at: string
          verification_level: string
        }
        Insert: {
          account_reference?: string | null
          authentication_type?: string
          connector_key: string
          created_at?: string
          display_name: string
          environment?: string
          health_status?: string
          id?: string
          is_active?: boolean
          last_error_at?: string | null
          last_error_message?: string | null
          last_successful_connection_at?: string | null
          last_successful_sync_at?: string | null
          metadata?: Json
          organization_id: string
          provider: string
          updated_at?: string
          verification_level?: string
        }
        Update: {
          account_reference?: string | null
          authentication_type?: string
          connector_key?: string
          created_at?: string
          display_name?: string
          environment?: string
          health_status?: string
          id?: string
          is_active?: boolean
          last_error_at?: string | null
          last_error_message?: string | null
          last_successful_connection_at?: string | null
          last_successful_sync_at?: string | null
          metadata?: Json
          organization_id?: string
          provider?: string
          updated_at?: string
          verification_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_connectors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_cost_usage: {
        Row: {
          budget_limit_cop: number
          estimated_cost_cop: number
          id: string
          metric_type: string
          organization_id: string
          period_end: string
          period_start: string
          provider: string
          recorded_at: string
          status: string
          units_consumed: number
        }
        Insert: {
          budget_limit_cop?: number
          estimated_cost_cop?: number
          id?: string
          metric_type: string
          organization_id: string
          period_end: string
          period_start: string
          provider: string
          recorded_at?: string
          status?: string
          units_consumed?: number
        }
        Update: {
          budget_limit_cop?: number
          estimated_cost_cop?: number
          id?: string
          metric_type?: string
          organization_id?: string
          period_end?: string
          period_start?: string
          provider?: string
          recorded_at?: string
          status?: string
          units_consumed?: number
        }
        Relationships: [
          {
            foreignKeyName: "integration_cost_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_credentials_metadata: {
        Row: {
          created_at: string
          credential_alias: string
          expires_at: string | null
          id: string
          last_refreshed_at: string | null
          notes: string | null
          organization_id: string
          provider: string
          responsible_role: string
          service_name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credential_alias: string
          expires_at?: string | null
          id?: string
          last_refreshed_at?: string | null
          notes?: string | null
          organization_id: string
          provider: string
          responsible_role?: string
          service_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credential_alias?: string
          expires_at?: string | null
          id?: string
          last_refreshed_at?: string | null
          notes?: string | null
          organization_id?: string
          provider?: string
          responsible_role?: string
          service_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_credentials_metadata_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_discrepancy_evidence: {
        Row: {
          captured_at: string
          created_at: string
          discrepancy_id: string
          evidence_payload: Json
          evidence_type: string
          id: string
          organization_id: string
        }
        Insert: {
          captured_at?: string
          created_at?: string
          discrepancy_id: string
          evidence_payload?: Json
          evidence_type: string
          id?: string
          organization_id: string
        }
        Update: {
          captured_at?: string
          created_at?: string
          discrepancy_id?: string
          evidence_payload?: Json
          evidence_type?: string
          id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_discrepancy_evidence_discrepancy_id_fkey"
            columns: ["discrepancy_id"]
            isOneToOne: false
            referencedRelation: "integration_reconciliation_discrepancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_discrepancy_evidence_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_event_receipts: {
        Row: {
          created_at: string
          error_message: string | null
          event_id: string
          event_type: string
          id: string
          idempotency_key: string
          organization_id: string
          payload_preview: string | null
          processed_at: string | null
          processing_status: string
          provider: string
          received_at: string
          signature_verified: boolean
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_id: string
          event_type: string
          id?: string
          idempotency_key: string
          organization_id: string
          payload_preview?: string | null
          processed_at?: string | null
          processing_status?: string
          provider: string
          received_at?: string
          signature_verified?: boolean
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_id?: string
          event_type?: string
          id?: string
          idempotency_key?: string
          organization_id?: string
          payload_preview?: string | null
          processed_at?: string | null
          processing_status?: string
          provider?: string
          received_at?: string
          signature_verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "integration_event_receipts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_external_identity_map: {
        Row: {
          created_at: string
          entity_type: string
          external_identifier: string
          external_system: string
          id: string
          internal_entity_id: string
          is_active: boolean
          match_confidence: string
          metadata: Json
          organization_id: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          entity_type: string
          external_identifier: string
          external_system: string
          id?: string
          internal_entity_id: string
          is_active?: boolean
          match_confidence?: string
          metadata?: Json
          organization_id: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          entity_type?: string
          external_identifier?: string
          external_system?: string
          id?: string
          internal_entity_id?: string
          is_active?: boolean
          match_confidence?: string
          metadata?: Json
          organization_id?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_external_identity_map_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_external_reference_map: {
        Row: {
          created_at: string
          entity_type: string
          external_reference: string
          external_status: string | null
          external_system: string
          id: string
          internal_entity_id: string
          is_verified: boolean
          organization_id: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          entity_type: string
          external_reference: string
          external_status?: string | null
          external_system: string
          id?: string
          internal_entity_id: string
          is_verified?: boolean
          organization_id: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          entity_type?: string
          external_reference?: string
          external_status?: string | null
          external_system?: string
          id?: string
          internal_entity_id?: string
          is_verified?: boolean
          organization_id?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_external_reference_map_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_health_snapshots: {
        Row: {
          dead_letters_count: number
          environment: string
          executive_summary_es: string | null
          id: string
          last_healthy_at: string | null
          last_monitored_at: string
          open_incidents_count: number
          organization_id: string
          overall_status: string
          pending_outbox_count: number
          services_status: Json
          stale_events_count: number
          unresolved_reconciliations_count: number
          updated_at: string
        }
        Insert: {
          dead_letters_count?: number
          environment?: string
          executive_summary_es?: string | null
          id?: string
          last_healthy_at?: string | null
          last_monitored_at?: string
          open_incidents_count?: number
          organization_id: string
          overall_status: string
          pending_outbox_count?: number
          services_status?: Json
          stale_events_count?: number
          unresolved_reconciliations_count?: number
          updated_at?: string
        }
        Update: {
          dead_letters_count?: number
          environment?: string
          executive_summary_es?: string | null
          id?: string
          last_healthy_at?: string | null
          last_monitored_at?: string
          open_incidents_count?: number
          organization_id?: string
          overall_status?: string
          pending_outbox_count?: number
          services_status?: Json
          stale_events_count?: number
          unresolved_reconciliations_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_health_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_heartbeats: {
        Row: {
          created_at: string
          details: Json
          environment: string
          heartbeat_at: string
          id: string
          instance_id: string
          organization_id: string
          service_name: string
          status: string
        }
        Insert: {
          created_at?: string
          details?: Json
          environment?: string
          heartbeat_at?: string
          id?: string
          instance_id: string
          organization_id: string
          service_name: string
          status?: string
        }
        Update: {
          created_at?: string
          details?: Json
          environment?: string
          heartbeat_at?: string
          id?: string
          instance_id?: string
          organization_id?: string
          service_name?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_heartbeats_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_incidents: {
        Row: {
          assigned_to: string | null
          attempt_number: number
          causation_id: string | null
          correlation_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          environment: string
          error_category: string
          error_code: string | null
          error_message: string
          event_id: string | null
          external_effect_status: string
          first_seen_at: string
          http_status: number | null
          id: string
          idempotency_key: string | null
          last_seen_at: string
          max_attempts: number
          next_retry_at: string | null
          organization_id: string
          resolution_evidence: Json | null
          resolution_type: string | null
          resolved_at: string | null
          resolved_by: string | null
          retry_eligibility: boolean
          severity: string
          source_execution_id: string | null
          source_node: string | null
          source_system: string
          source_workflow_id: string | null
          source_workflow_name: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          attempt_number?: number
          causation_id?: string | null
          correlation_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          environment?: string
          error_category: string
          error_code?: string | null
          error_message: string
          event_id?: string | null
          external_effect_status?: string
          first_seen_at?: string
          http_status?: number | null
          id?: string
          idempotency_key?: string | null
          last_seen_at?: string
          max_attempts?: number
          next_retry_at?: string | null
          organization_id: string
          resolution_evidence?: Json | null
          resolution_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          retry_eligibility?: boolean
          severity?: string
          source_execution_id?: string | null
          source_node?: string | null
          source_system?: string
          source_workflow_id?: string | null
          source_workflow_name?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          attempt_number?: number
          causation_id?: string | null
          correlation_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          environment?: string
          error_category?: string
          error_code?: string | null
          error_message?: string
          event_id?: string | null
          external_effect_status?: string
          first_seen_at?: string
          http_status?: number | null
          id?: string
          idempotency_key?: string | null
          last_seen_at?: string
          max_attempts?: number
          next_retry_at?: string | null
          organization_id?: string
          resolution_evidence?: Json | null
          resolution_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          retry_eligibility?: boolean
          severity?: string
          source_execution_id?: string | null
          source_node?: string | null
          source_system?: string
          source_workflow_id?: string | null
          source_workflow_name?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_incidents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_maintenance_windows: {
        Row: {
          approved_by_role: string
          created_at: string
          ends_at: string
          id: string
          impacted_services: Json
          notes: string | null
          organization_id: string
          starts_at: string
          status: string
          suppress_monitoring_alerts: boolean
          window_name: string
          window_type: string
        }
        Insert: {
          approved_by_role?: string
          created_at?: string
          ends_at: string
          id?: string
          impacted_services?: Json
          notes?: string | null
          organization_id: string
          starts_at: string
          status?: string
          suppress_monitoring_alerts?: boolean
          window_name: string
          window_type?: string
        }
        Update: {
          approved_by_role?: string
          created_at?: string
          ends_at?: string
          id?: string
          impacted_services?: Json
          notes?: string | null
          organization_id?: string
          starts_at?: string
          status?: string
          suppress_monitoring_alerts?: boolean
          window_name?: string
          window_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_maintenance_windows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_manual_confirmation_tasks: {
        Row: {
          assigned_role: string
          assigned_to: string | null
          created_at: string
          discrepancy_id: string | null
          due_at: string
          id: string
          organization_id: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          task_description: string
          task_title: string
          updated_at: string
        }
        Insert: {
          assigned_role?: string
          assigned_to?: string | null
          created_at?: string
          discrepancy_id?: string | null
          due_at: string
          id?: string
          organization_id: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          task_description: string
          task_title: string
          updated_at?: string
        }
        Update: {
          assigned_role?: string
          assigned_to?: string | null
          created_at?: string
          discrepancy_id?: string | null
          due_at?: string
          id?: string
          organization_id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          task_description?: string
          task_title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_manual_confirmation_tasks_discrepancy_id_fkey"
            columns: ["discrepancy_id"]
            isOneToOne: false
            referencedRelation: "integration_reconciliation_discrepancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_manual_confirmation_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_monitoring_cycles: {
        Row: {
          completed_at: string
          created_at: string
          cycle_type: string
          duration_ms: number
          environment: string
          id: string
          issues_count: number
          organization_id: string
          overall_health: string
          raw_summary: Json
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          cycle_type?: string
          duration_ms?: number
          environment?: string
          id?: string
          issues_count?: number
          organization_id: string
          overall_health: string
          raw_summary?: Json
          started_at?: string
          status?: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          cycle_type?: string
          duration_ms?: number
          environment?: string
          id?: string
          issues_count?: number
          organization_id?: string
          overall_health?: string
          raw_summary?: Json
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_monitoring_cycles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_probe_results: {
        Row: {
          checked_at: string
          cycle_id: string | null
          details: Json
          error_code: string | null
          error_message: string | null
          http_status: number | null
          id: string
          latency_ms: number | null
          organization_id: string
          probe_name: string
          service_name: string
          severity: string
          status: string
        }
        Insert: {
          checked_at?: string
          cycle_id?: string | null
          details?: Json
          error_code?: string | null
          error_message?: string | null
          http_status?: number | null
          id?: string
          latency_ms?: number | null
          organization_id: string
          probe_name: string
          service_name: string
          severity?: string
          status: string
        }
        Update: {
          checked_at?: string
          cycle_id?: string | null
          details?: Json
          error_code?: string | null
          error_message?: string | null
          http_status?: number | null
          id?: string
          latency_ms?: number | null
          organization_id?: string
          probe_name?: string
          service_name?: string
          severity?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_probe_results_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "integration_monitoring_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_probe_results_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_reconciliation_audit: {
        Row: {
          actor: string
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string
          event_name: string
          id: string
          organization_id: string
        }
        Insert: {
          actor?: string
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type: string
          event_name: string
          id?: string
          organization_id: string
        }
        Update: {
          actor?: string
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string
          event_name?: string
          id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_reconciliation_audit_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_reconciliation_discrepancies: {
        Row: {
          assigned_role: string | null
          assigned_user_id: string | null
          authoritative_system: string
          created_at: string
          discrepancy_type: string
          entity_type: string
          explanation: string
          external_reference: string | null
          id: string
          internal_entity_id: string | null
          observed_external_value: Json | null
          observed_local_value: Json | null
          organization_id: string
          run_id: string
          severity: string
          source_system: string
          status: string
          target_system: string
          updated_at: string
        }
        Insert: {
          assigned_role?: string | null
          assigned_user_id?: string | null
          authoritative_system: string
          created_at?: string
          discrepancy_type: string
          entity_type: string
          explanation: string
          external_reference?: string | null
          id?: string
          internal_entity_id?: string | null
          observed_external_value?: Json | null
          observed_local_value?: Json | null
          organization_id: string
          run_id: string
          severity?: string
          source_system: string
          status?: string
          target_system: string
          updated_at?: string
        }
        Update: {
          assigned_role?: string | null
          assigned_user_id?: string | null
          authoritative_system?: string
          created_at?: string
          discrepancy_type?: string
          entity_type?: string
          explanation?: string
          external_reference?: string | null
          id?: string
          internal_entity_id?: string | null
          observed_external_value?: Json | null
          observed_local_value?: Json | null
          organization_id?: string
          run_id?: string
          severity?: string
          source_system?: string
          status?: string
          target_system?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_reconciliation_discrepancies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_reconciliation_discrepancies_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "integration_reconciliation_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_reconciliation_runs: {
        Row: {
          completed_at: string | null
          connectors_checked: string[]
          created_at: string
          discrepancies_detected: number
          execution_mode: string
          expected_differences_count: number
          human_tasks_created_count: number
          id: string
          organization_id: string
          reconciliation_scope: string
          records_evaluated: number
          repairs_applied_count: number
          repairs_proposed_count: number
          repairs_verified_count: number
          run_number: number
          started_at: string
          status: string
          summary_notes: string | null
          true_conflicts_count: number
          worker_id: string
        }
        Insert: {
          completed_at?: string | null
          connectors_checked?: string[]
          created_at?: string
          discrepancies_detected?: number
          execution_mode?: string
          expected_differences_count?: number
          human_tasks_created_count?: number
          id?: string
          organization_id: string
          reconciliation_scope?: string
          records_evaluated?: number
          repairs_applied_count?: number
          repairs_proposed_count?: number
          repairs_verified_count?: number
          run_number?: never
          started_at?: string
          status?: string
          summary_notes?: string | null
          true_conflicts_count?: number
          worker_id?: string
        }
        Update: {
          completed_at?: string | null
          connectors_checked?: string[]
          created_at?: string
          discrepancies_detected?: number
          execution_mode?: string
          expected_differences_count?: number
          human_tasks_created_count?: number
          id?: string
          organization_id?: string
          reconciliation_scope?: string
          records_evaluated?: number
          repairs_applied_count?: number
          repairs_proposed_count?: number
          repairs_verified_count?: number
          run_number?: never
          started_at?: string
          status?: string
          summary_notes?: string | null
          true_conflicts_count?: number
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_reconciliation_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_reconciliation_tasks: {
        Row: {
          created_at: string
          due_at: string
          id: string
          incident_id: string
          organization_id: string
          resolved_at: string | null
          resolved_by: string | null
          result_details: Json | null
          status: string
          target_external_id: string | null
          task_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_at: string
          id?: string
          incident_id: string
          organization_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          result_details?: Json | null
          status?: string
          target_external_id?: string | null
          task_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_at?: string
          id?: string
          incident_id?: string
          organization_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          result_details?: Json | null
          status?: string
          target_external_id?: string | null
          task_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_reconciliation_tasks_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "integration_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_reconciliation_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_repair_approvals: {
        Row: {
          approver_id: string
          created_at: string
          decided_at: string
          decision: string
          decision_reason: string
          id: string
          organization_id: string
          proposal_id: string
        }
        Insert: {
          approver_id: string
          created_at?: string
          decided_at?: string
          decision: string
          decision_reason: string
          id?: string
          organization_id: string
          proposal_id: string
        }
        Update: {
          approver_id?: string
          created_at?: string
          decided_at?: string
          decision?: string
          decision_reason?: string
          id?: string
          organization_id?: string
          proposal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_repair_approvals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_repair_approvals_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "integration_repair_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_repair_executions: {
        Row: {
          applied_changes: Json
          created_at: string
          error_details: string | null
          executed_at: string
          execution_status: string
          id: string
          organization_id: string
          proposal_id: string
        }
        Insert: {
          applied_changes?: Json
          created_at?: string
          error_details?: string | null
          executed_at?: string
          execution_status?: string
          id?: string
          organization_id: string
          proposal_id: string
        }
        Update: {
          applied_changes?: Json
          created_at?: string
          error_details?: string | null
          executed_at?: string
          execution_status?: string
          id?: string
          organization_id?: string
          proposal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_repair_executions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_repair_executions_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "integration_repair_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_repair_proposals: {
        Row: {
          action_payload: Json
          approver_role: string | null
          created_at: string
          discrepancy_id: string
          id: string
          organization_id: string
          proposed_action: string
          repair_type: string
          requires_human_approval: boolean
          status: string
        }
        Insert: {
          action_payload?: Json
          approver_role?: string | null
          created_at?: string
          discrepancy_id: string
          id?: string
          organization_id: string
          proposed_action: string
          repair_type: string
          requires_human_approval?: boolean
          status?: string
        }
        Update: {
          action_payload?: Json
          approver_role?: string | null
          created_at?: string
          discrepancy_id?: string
          id?: string
          organization_id?: string
          proposed_action?: string
          repair_type?: string
          requires_human_approval?: boolean
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_repair_proposals_discrepancy_id_fkey"
            columns: ["discrepancy_id"]
            isOneToOne: false
            referencedRelation: "integration_reconciliation_discrepancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_repair_proposals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_repair_verifications: {
        Row: {
          created_at: string
          discrepancy_id: string
          id: string
          is_verified_clean: boolean
          organization_id: string
          repair_execution_id: string
          verification_notes: string
          verified_at: string
        }
        Insert: {
          created_at?: string
          discrepancy_id: string
          id?: string
          is_verified_clean?: boolean
          organization_id: string
          repair_execution_id: string
          verification_notes: string
          verified_at?: string
        }
        Update: {
          created_at?: string
          discrepancy_id?: string
          id?: string
          is_verified_clean?: boolean
          organization_id?: string
          repair_execution_id?: string
          verification_notes?: string
          verified_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_repair_verifications_discrepancy_id_fkey"
            columns: ["discrepancy_id"]
            isOneToOne: false
            referencedRelation: "integration_reconciliation_discrepancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_repair_verifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_repair_verifications_repair_execution_id_fkey"
            columns: ["repair_execution_id"]
            isOneToOne: false
            referencedRelation: "integration_repair_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_restore_tests: {
        Row: {
          backup_id: string
          duration_ms: number
          id: string
          status: string
          tables_verified_count: number
          test_type: string
          tested_at: string
          validation_notes: string | null
        }
        Insert: {
          backup_id: string
          duration_ms?: number
          id?: string
          status: string
          tables_verified_count?: number
          test_type: string
          tested_at?: string
          validation_notes?: string | null
        }
        Update: {
          backup_id?: string
          duration_ms?: number
          id?: string
          status?: string
          tables_verified_count?: number
          test_type?: string
          tested_at?: string
          validation_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_restore_tests_backup_id_fkey"
            columns: ["backup_id"]
            isOneToOne: false
            referencedRelation: "integration_backup_records"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_retry_attempts: {
        Row: {
          attempt_number: number
          created_at: string
          duration_ms: number | null
          error_details: string | null
          executed_at: string
          id: string
          incident_id: string
          response_payload: Json | null
          status: string
        }
        Insert: {
          attempt_number: number
          created_at?: string
          duration_ms?: number | null
          error_details?: string | null
          executed_at?: string
          id?: string
          incident_id: string
          response_payload?: Json | null
          status: string
        }
        Update: {
          attempt_number?: number
          created_at?: string
          duration_ms?: number | null
          error_details?: string | null
          executed_at?: string
          id?: string
          incident_id?: string
          response_payload?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_retry_attempts_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "integration_incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_sync_checkpoints: {
        Row: {
          checkpoint_version: number
          connector_id: string
          created_at: string
          discrepancies_detected: number
          id: string
          organization_id: string
          records_scanned: number
          status: string
          sync_scope: string
          window_end: string
          window_start: string
        }
        Insert: {
          checkpoint_version?: number
          connector_id: string
          created_at?: string
          discrepancies_detected?: number
          id?: string
          organization_id: string
          records_scanned?: number
          status?: string
          sync_scope: string
          window_end: string
          window_start: string
        }
        Update: {
          checkpoint_version?: number
          connector_id?: string
          created_at?: string
          discrepancies_detected?: number
          id?: string
          organization_id?: string
          records_scanned?: number
          status?: string
          sync_scope?: string
          window_end?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_sync_checkpoints_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "integration_connectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_sync_checkpoints_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_sync_cursors: {
        Row: {
          connector_id: string
          created_at: string
          cursor_type: string
          cursor_value: string
          id: string
          last_successful_sync_at: string
          metadata: Json
          organization_id: string
          sync_scope: string
          updated_at: string
        }
        Insert: {
          connector_id: string
          created_at?: string
          cursor_type?: string
          cursor_value: string
          id?: string
          last_successful_sync_at?: string
          metadata?: Json
          organization_id: string
          sync_scope: string
          updated_at?: string
        }
        Update: {
          connector_id?: string
          created_at?: string
          cursor_type?: string
          cursor_value?: string
          id?: string
          last_successful_sync_at?: string
          metadata?: Json
          organization_id?: string
          sync_scope?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_sync_cursors_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "integration_connectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_sync_cursors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_sync_policies: {
        Row: {
          authoritative_system: string
          conflict_policy: string
          created_at: string
          entity_type: string
          freshness_max_seconds: number
          human_approval_required: boolean
          id: string
          is_active: boolean
          organization_id: string
          secondary_systems: string[]
        }
        Insert: {
          authoritative_system: string
          conflict_policy?: string
          created_at?: string
          entity_type: string
          freshness_max_seconds?: number
          human_approval_required?: boolean
          id?: string
          is_active?: boolean
          organization_id: string
          secondary_systems?: string[]
        }
        Update: {
          authoritative_system?: string
          conflict_policy?: string
          created_at?: string
          entity_type?: string
          freshness_max_seconds?: number
          human_approval_required?: boolean
          id?: string
          is_active?: boolean
          organization_id?: string
          secondary_systems?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "integration_sync_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      location_observations: {
        Row: {
          accuracy_meters: number
          created_at: string
          device_id: string
          heading_degrees: number | null
          id: string
          latitude: number
          longitude: number
          observed_at: string
          organization_id: string
          quality_status: string
          received_at: string
          source: string
          speed_mps: number | null
          staff_id: string
          tracking_session_id: string
        }
        Insert: {
          accuracy_meters: number
          created_at?: string
          device_id: string
          heading_degrees?: number | null
          id?: string
          latitude: number
          longitude: number
          observed_at: string
          organization_id: string
          quality_status?: string
          received_at?: string
          source: string
          speed_mps?: number | null
          staff_id: string
          tracking_session_id: string
        }
        Update: {
          accuracy_meters?: number
          created_at?: string
          device_id?: string
          heading_degrees?: number | null
          id?: string
          latitude?: number
          longitude?: number
          observed_at?: string
          organization_id?: string
          quality_status?: string
          received_at?: string
          source?: string
          speed_mps?: number | null
          staff_id?: string
          tracking_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_observations_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "staff_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_observations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_observations_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_observations_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "location_observations_tracking_session_id_fkey"
            columns: ["tracking_session_id"]
            isOneToOne: false
            referencedRelation: "tracking_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          body_template: string
          category: string
          created_at: string
          id: string
          is_active: boolean
          is_approved_by_meta: boolean
          language: string
          meta_template_id: string | null
          organization_id: string
          parameter_definitions: Json
          template_name: string
          updated_at: string
        }
        Insert: {
          body_template: string
          category: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_approved_by_meta?: boolean
          language?: string
          meta_template_id?: string | null
          organization_id: string
          parameter_definitions?: Json
          template_name: string
          updated_at?: string
        }
        Update: {
          body_template?: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_approved_by_meta?: boolean
          language?: string
          meta_template_id?: string | null
          organization_id?: string
          parameter_definitions?: Json
          template_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content_text: string | null
          conversation_id: string
          created_at: string
          delivery_status: string
          direction: string
          error_code: string | null
          error_message: string | null
          external_message_id: string | null
          id: string
          media_url: string | null
          message_type: string
          raw_payload: Json
          sender_type: string
          sender_user_id: string | null
          sent_at: string
        }
        Insert: {
          content_text?: string | null
          conversation_id: string
          created_at?: string
          delivery_status?: string
          direction: string
          error_code?: string | null
          error_message?: string | null
          external_message_id?: string | null
          id?: string
          media_url?: string | null
          message_type?: string
          raw_payload?: Json
          sender_type: string
          sender_user_id?: string | null
          sent_at?: string
        }
        Update: {
          content_text?: string | null
          conversation_id?: string
          created_at?: string
          delivery_status?: string
          direction?: string
          error_code?: string | null
          error_message?: string | null
          external_message_id?: string | null
          id?: string
          media_url?: string | null
          message_type?: string
          raw_payload?: Json
          sender_type?: string
          sender_user_id?: string | null
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      n8n_integration_registry: {
        Row: {
          core_code: string
          created_at: string
          error_rate_24h: number | null
          id: string
          is_enabled: boolean
          last_execution_status: string | null
          last_heartbeat_at: string | null
          n8n_workflow_id: string | null
          name: string
          trigger_type: string
          updated_at: string
        }
        Insert: {
          core_code: string
          created_at?: string
          error_rate_24h?: number | null
          id?: string
          is_enabled?: boolean
          last_execution_status?: string | null
          last_heartbeat_at?: string | null
          n8n_workflow_id?: string | null
          name: string
          trigger_type: string
          updated_at?: string
        }
        Update: {
          core_code?: string
          created_at?: string
          error_rate_24h?: number | null
          id?: string
          is_enabled?: boolean
          last_execution_status?: string | null
          last_heartbeat_at?: string | null
          n8n_workflow_id?: string | null
          name?: string
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      non_working_days: {
        Row: {
          branch_id: string | null
          created_at: string
          description: string
          holiday_date: string
          id: string
          is_recurring_annual: boolean
          organization_id: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          description: string
          holiday_date: string
          id?: string
          is_recurring_annual?: boolean
          organization_id: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          description?: string
          holiday_date?: string
          id?: string
          is_recurring_annual?: boolean
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "non_working_days_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "non_working_days_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      okvet_capability_registry: {
        Row: {
          availability_status: string
          capability_code: string
          id: string
          notes: string | null
          organization_id: string
          verification_source: string
          verified_at: string
        }
        Insert: {
          availability_status?: string
          capability_code: string
          id?: string
          notes?: string | null
          organization_id: string
          verification_source?: string
          verified_at?: string
        }
        Update: {
          availability_status?: string
          capability_code?: string
          id?: string
          notes?: string | null
          organization_id?: string
          verification_source?: string
          verified_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "okvet_capability_registry_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      okvet_connector_configuration: {
        Row: {
          created_at: string
          integration_mode: string
          last_verified_at: string | null
          notes: string | null
          organization_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          integration_mode?: string
          last_verified_at?: string | null
          notes?: string | null
          organization_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          integration_mode?: string
          last_verified_at?: string | null
          notes?: string | null
          organization_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "okvet_connector_configuration_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      okvet_import_application_results: {
        Row: {
          action_taken: string
          batch_id: string
          created_at: string
          evidence_reference: string | null
          id: string
          result_status: string
          row_id: string
        }
        Insert: {
          action_taken: string
          batch_id: string
          created_at?: string
          evidence_reference?: string | null
          id?: string
          result_status?: string
          row_id: string
        }
        Update: {
          action_taken?: string
          batch_id?: string
          created_at?: string
          evidence_reference?: string | null
          id?: string
          result_status?: string
          row_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "okvet_import_application_results_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "okvet_import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okvet_import_application_results_row_id_fkey"
            columns: ["row_id"]
            isOneToOne: false
            referencedRelation: "okvet_import_row_staging"
            referencedColumns: ["id"]
          },
        ]
      }
      okvet_import_batches: {
        Row: {
          content_hash: string
          created_at: string
          error_rows: number
          file_name: string
          file_type: string
          id: string
          organization_id: string
          source_date: string
          status: string
          storage_path: string
          total_rows: number
          updated_at: string
          uploaded_by: string
          valid_rows: number
        }
        Insert: {
          content_hash: string
          created_at?: string
          error_rows?: number
          file_name: string
          file_type?: string
          id?: string
          organization_id: string
          source_date?: string
          status?: string
          storage_path: string
          total_rows?: number
          updated_at?: string
          uploaded_by: string
          valid_rows?: number
        }
        Update: {
          content_hash?: string
          created_at?: string
          error_rows?: number
          file_name?: string
          file_type?: string
          id?: string
          organization_id?: string
          source_date?: string
          status?: string
          storage_path?: string
          total_rows?: number
          updated_at?: string
          uploaded_by?: string
          valid_rows?: number
        }
        Relationships: [
          {
            foreignKeyName: "okvet_import_batches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okvet_import_batches_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      okvet_import_column_mappings: {
        Row: {
          batch_id: string
          created_at: string
          id: string
          source_column: string
          target_field: string
          transformation_rule: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          id?: string
          source_column: string
          target_field: string
          transformation_rule?: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          id?: string
          source_column?: string
          target_field?: string
          transformation_rule?: string
        }
        Relationships: [
          {
            foreignKeyName: "okvet_import_column_mappings_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "okvet_import_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      okvet_import_conflicts: {
        Row: {
          batch_id: string
          conflict_type: string
          created_at: string
          id: string
          local_reference: string | null
          resolution_notes: string | null
          resolution_status: string
          resolved_at: string | null
          resolved_by: string | null
          row_id: string
        }
        Insert: {
          batch_id: string
          conflict_type: string
          created_at?: string
          id?: string
          local_reference?: string | null
          resolution_notes?: string | null
          resolution_status?: string
          resolved_at?: string | null
          resolved_by?: string | null
          row_id: string
        }
        Update: {
          batch_id?: string
          conflict_type?: string
          created_at?: string
          id?: string
          local_reference?: string | null
          resolution_notes?: string | null
          resolution_status?: string
          resolved_at?: string | null
          resolved_by?: string | null
          row_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "okvet_import_conflicts_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "okvet_import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okvet_import_conflicts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okvet_import_conflicts_row_id_fkey"
            columns: ["row_id"]
            isOneToOne: false
            referencedRelation: "okvet_import_row_staging"
            referencedColumns: ["id"]
          },
        ]
      }
      okvet_import_row_staging: {
        Row: {
          batch_id: string
          created_at: string
          error_details: string | null
          id: string
          match_status: string
          matched_entity_id: string | null
          matched_entity_type: string | null
          normalized_data: Json | null
          raw_data: Json
          row_number: number
          validation_status: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          error_details?: string | null
          id?: string
          match_status?: string
          matched_entity_id?: string | null
          matched_entity_type?: string | null
          normalized_data?: Json | null
          raw_data: Json
          row_number: number
          validation_status?: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          error_details?: string | null
          id?: string
          match_status?: string
          matched_entity_id?: string | null
          matched_entity_type?: string | null
          normalized_data?: Json | null
          raw_data?: Json
          row_number?: number
          validation_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "okvet_import_row_staging_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "okvet_import_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      okvet_manual_confirmations: {
        Row: {
          appointment_id: string
          confirmation_method: string
          confirmed_at: string
          confirmed_by: string
          created_at: string
          evidence_file_reference: string | null
          evidence_notes: string | null
          id: string
          okvet_reference: string
          organization_id: string
          status: string
        }
        Insert: {
          appointment_id: string
          confirmation_method?: string
          confirmed_at?: string
          confirmed_by: string
          created_at?: string
          evidence_file_reference?: string | null
          evidence_notes?: string | null
          id?: string
          okvet_reference: string
          organization_id: string
          status?: string
        }
        Update: {
          appointment_id?: string
          confirmation_method?: string
          confirmed_at?: string
          confirmed_by?: string
          created_at?: string
          evidence_file_reference?: string | null
          evidence_notes?: string | null
          id?: string
          okvet_reference?: string
          organization_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "okvet_manual_confirmations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okvet_manual_confirmations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "okvet_manual_confirmations_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okvet_manual_confirmations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      okvet_references: {
        Row: {
          created_at: string
          entity_type: string
          id: string
          internal_id: string
          last_verified_at: string
          okvet_id: string
          organization_id: string
          verification_notes: string | null
          verified_by_user_id: string | null
        }
        Insert: {
          created_at?: string
          entity_type: string
          id?: string
          internal_id: string
          last_verified_at?: string
          okvet_id: string
          organization_id: string
          verification_notes?: string | null
          verified_by_user_id?: string | null
        }
        Update: {
          created_at?: string
          entity_type?: string
          id?: string
          internal_id?: string
          last_verified_at?: string
          okvet_id?: string
          organization_id?: string
          verification_notes?: string | null
          verified_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "okvet_references_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      operating_hours: {
        Row: {
          branch_id: string | null
          close_time: string
          created_at: string
          day_of_week: number
          id: string
          is_active: boolean
          open_time: string
          organization_id: string
        }
        Insert: {
          branch_id?: string | null
          close_time: string
          created_at?: string
          day_of_week: number
          id?: string
          is_active?: boolean
          open_time: string
          organization_id: string
        }
        Update: {
          branch_id?: string | null
          close_time?: string
          created_at?: string
          day_of_week?: number
          id?: string
          is_active?: boolean
          open_time?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "operating_hours_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operating_hours_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      operational_commitments: {
        Row: {
          commitment_text: string
          created_at: string
          extraction_confidence: number | null
          id: string
          is_verified_promise: boolean
          made_by_actor_type: string
          made_by_user_id: string | null
          organization_id: string
          promised_due_at: string
          source_conversation_id: string | null
          source_message_id: string | null
          status: string
          task_id: string | null
          updated_at: string
        }
        Insert: {
          commitment_text: string
          created_at?: string
          extraction_confidence?: number | null
          id?: string
          is_verified_promise?: boolean
          made_by_actor_type: string
          made_by_user_id?: string | null
          organization_id: string
          promised_due_at: string
          source_conversation_id?: string | null
          source_message_id?: string | null
          status?: string
          task_id?: string | null
          updated_at?: string
        }
        Update: {
          commitment_text?: string
          created_at?: string
          extraction_confidence?: number | null
          id?: string
          is_verified_promise?: boolean
          made_by_actor_type?: string
          made_by_user_id?: string | null
          organization_id?: string
          promised_due_at?: string
          source_conversation_id?: string | null
          source_message_id?: string | null
          status?: string
          task_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operational_commitments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operational_commitments_source_conversation_id_fkey"
            columns: ["source_conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operational_commitments_source_message_id_fkey"
            columns: ["source_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operational_commitments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "operational_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      operational_shift_handoffs: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          incoming_user_id: string | null
          open_tasks_count: number
          organization_id: string
          outgoing_user_id: string
          overdue_tasks_count: number
          status: string
          summary_notes: string
          team: string
          updated_at: string
          urgent_cases_count: number
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          incoming_user_id?: string | null
          open_tasks_count?: number
          organization_id: string
          outgoing_user_id: string
          overdue_tasks_count?: number
          status?: string
          summary_notes: string
          team: string
          updated_at?: string
          urgent_cases_count?: number
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          incoming_user_id?: string | null
          open_tasks_count?: number
          organization_id?: string
          outgoing_user_id?: string
          overdue_tasks_count?: number
          status?: string
          summary_notes?: string
          team?: string
          updated_at?: string
          urgent_cases_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "operational_shift_handoffs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      operational_task_assignment_history: {
        Row: {
          assigned_by: string | null
          assignment_type: string
          created_at: string
          from_user_id: string | null
          id: string
          organization_id: string
          reason: string
          task_id: string
          to_user_id: string | null
        }
        Insert: {
          assigned_by?: string | null
          assignment_type?: string
          created_at?: string
          from_user_id?: string | null
          id?: string
          organization_id: string
          reason: string
          task_id: string
          to_user_id?: string | null
        }
        Update: {
          assigned_by?: string | null
          assignment_type?: string
          created_at?: string
          from_user_id?: string | null
          id?: string
          organization_id?: string
          reason?: string
          task_id?: string
          to_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operational_task_assignment_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operational_task_assignment_history_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "operational_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      operational_task_evidence: {
        Row: {
          created_at: string
          evidence_payload: Json
          evidence_reference: string
          evidence_type: string
          id: string
          organization_id: string
          status: string
          submitted_at: string
          submitted_by: string
          task_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          evidence_payload?: Json
          evidence_reference: string
          evidence_type: string
          id?: string
          organization_id: string
          status?: string
          submitted_at?: string
          submitted_by: string
          task_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          evidence_payload?: Json
          evidence_reference?: string
          evidence_type?: string
          id?: string
          organization_id?: string
          status?: string
          submitted_at?: string
          submitted_by?: string
          task_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operational_task_evidence_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operational_task_evidence_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "operational_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      operational_task_reminder_jobs: {
        Row: {
          channel: string
          created_at: string
          executed_at: string | null
          expires_at: string
          id: string
          idempotency_key: string
          organization_id: string
          planned_for: string
          reminder_type: string
          status: string
          suppression_reason: string | null
          target_user_id: string
          task_id: string
          task_version: number
          updated_at: string
        }
        Insert: {
          channel?: string
          created_at?: string
          executed_at?: string | null
          expires_at: string
          id?: string
          idempotency_key: string
          organization_id: string
          planned_for: string
          reminder_type: string
          status?: string
          suppression_reason?: string | null
          target_user_id: string
          task_id: string
          task_version?: number
          updated_at?: string
        }
        Update: {
          channel?: string
          created_at?: string
          executed_at?: string | null
          expires_at?: string
          id?: string
          idempotency_key?: string
          organization_id?: string
          planned_for?: string
          reminder_type?: string
          status?: string
          suppression_reason?: string | null
          target_user_id?: string
          task_id?: string
          task_version?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operational_task_reminder_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operational_task_reminder_jobs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "operational_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      operational_tasks: {
        Row: {
          accepted_at: string | null
          assigned_role: string | null
          assigned_user_id: string | null
          assignment_status: string
          backup_user_id: string | null
          blocked_reason: string | null
          completed_at: string | null
          completed_by: string | null
          correlation_id: string | null
          created_at: string
          description: string | null
          due_at: string
          eligible_after: string
          escalation_level: number
          expires_at: string | null
          id: string
          idempotency_key: string
          is_clinically_sensitive: boolean
          last_reminder_at: string | null
          next_reminder_at: string | null
          organization_id: string
          owner_client_id: string | null
          owner_team: string
          pet_id: string | null
          priority: string
          reminder_count: number
          requires_evidence: boolean
          requires_human_review: boolean
          severity: string | null
          snooze_count: number
          snooze_reason: string | null
          snooze_until: string | null
          source_entity_id: string | null
          source_entity_type: string | null
          source_event_id: string | null
          source_system: string
          task_code: string
          task_type: string
          task_version: number
          title: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
          work_status: string
        }
        Insert: {
          accepted_at?: string | null
          assigned_role?: string | null
          assigned_user_id?: string | null
          assignment_status?: string
          backup_user_id?: string | null
          blocked_reason?: string | null
          completed_at?: string | null
          completed_by?: string | null
          correlation_id?: string | null
          created_at?: string
          description?: string | null
          due_at: string
          eligible_after?: string
          escalation_level?: number
          expires_at?: string | null
          id?: string
          idempotency_key: string
          is_clinically_sensitive?: boolean
          last_reminder_at?: string | null
          next_reminder_at?: string | null
          organization_id: string
          owner_client_id?: string | null
          owner_team?: string
          pet_id?: string | null
          priority?: string
          reminder_count?: number
          requires_evidence?: boolean
          requires_human_review?: boolean
          severity?: string | null
          snooze_count?: number
          snooze_reason?: string | null
          snooze_until?: string | null
          source_entity_id?: string | null
          source_entity_type?: string | null
          source_event_id?: string | null
          source_system?: string
          task_code: string
          task_type: string
          task_version?: number
          title: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          work_status?: string
        }
        Update: {
          accepted_at?: string | null
          assigned_role?: string | null
          assigned_user_id?: string | null
          assignment_status?: string
          backup_user_id?: string | null
          blocked_reason?: string | null
          completed_at?: string | null
          completed_by?: string | null
          correlation_id?: string | null
          created_at?: string
          description?: string | null
          due_at?: string
          eligible_after?: string
          escalation_level?: number
          expires_at?: string | null
          id?: string
          idempotency_key?: string
          is_clinically_sensitive?: boolean
          last_reminder_at?: string | null
          next_reminder_at?: string | null
          organization_id?: string
          owner_client_id?: string | null
          owner_team?: string
          pet_id?: string | null
          priority?: string
          reminder_count?: number
          requires_evidence?: boolean
          requires_human_review?: boolean
          severity?: string | null
          snooze_count?: number
          snooze_reason?: string | null
          snooze_until?: string | null
          source_entity_id?: string | null
          source_entity_type?: string | null
          source_event_id?: string | null
          source_system?: string
          task_code?: string
          task_type?: string
          task_version?: number
          title?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          work_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "operational_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operational_tasks_owner_client_id_fkey"
            columns: ["owner_client_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operational_tasks_owner_client_id_fkey"
            columns: ["owner_client_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "operational_tasks_owner_client_id_fkey"
            columns: ["owner_client_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "operational_tasks_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operational_tasks_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "operational_tasks_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
        ]
      }
      organization_memberships: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          is_primary: boolean
          organization_id: string
          permissions_override: Json
          role: Database["public"]["Enums"]["app_role_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          organization_id: string
          permissions_override?: Json
          role: Database["public"]["Enums"]["app_role_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          organization_id?: string
          permissions_override?: Json
          role?: Database["public"]["Enums"]["app_role_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          default_currency: string
          id: string
          is_active: boolean
          legal_name: string | null
          name: string
          settings: Json
          slug: string
          tax_id: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          default_currency?: string
          id?: string
          is_active?: boolean
          legal_name?: string | null
          name: string
          settings?: Json
          slug: string
          tax_id?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          default_currency?: string
          id?: string
          is_active?: boolean
          legal_name?: string | null
          name?: string
          settings?: Json
          slug?: string
          tax_id?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      outbound_dispatch_requests: {
        Row: {
          business_entity_id: string | null
          business_entity_type: string | null
          business_entity_version: number | null
          channel: string
          claimed_at: string | null
          claimed_by: string | null
          completed_at: string | null
          conversation_id: string | null
          correlation_id: string | null
          created_at: string
          dispatch_attempts: number
          draft_state_version: number | null
          error_log: string | null
          expires_at: string | null
          freeform_text: string | null
          http_status: number | null
          id: string
          idempotency_key: string | null
          last_attempt_at: string | null
          message_category: string | null
          message_purpose: string | null
          organization_id: string
          pet_id: string | null
          provider_message_id: string | null
          raw_provider_response: Json | null
          recipient_owner_id: string | null
          recipient_phone: string
          scheduled_for: string
          sender_phone_number_id: string | null
          status: string
          template_id: string | null
          template_variables: Json
          updated_at: string
        }
        Insert: {
          business_entity_id?: string | null
          business_entity_type?: string | null
          business_entity_version?: number | null
          channel?: string
          claimed_at?: string | null
          claimed_by?: string | null
          completed_at?: string | null
          conversation_id?: string | null
          correlation_id?: string | null
          created_at?: string
          dispatch_attempts?: number
          draft_state_version?: number | null
          error_log?: string | null
          expires_at?: string | null
          freeform_text?: string | null
          http_status?: number | null
          id?: string
          idempotency_key?: string | null
          last_attempt_at?: string | null
          message_category?: string | null
          message_purpose?: string | null
          organization_id: string
          pet_id?: string | null
          provider_message_id?: string | null
          raw_provider_response?: Json | null
          recipient_owner_id?: string | null
          recipient_phone: string
          scheduled_for?: string
          sender_phone_number_id?: string | null
          status?: string
          template_id?: string | null
          template_variables?: Json
          updated_at?: string
        }
        Update: {
          business_entity_id?: string | null
          business_entity_type?: string | null
          business_entity_version?: number | null
          channel?: string
          claimed_at?: string | null
          claimed_by?: string | null
          completed_at?: string | null
          conversation_id?: string | null
          correlation_id?: string | null
          created_at?: string
          dispatch_attempts?: number
          draft_state_version?: number | null
          error_log?: string | null
          expires_at?: string | null
          freeform_text?: string | null
          http_status?: number | null
          id?: string
          idempotency_key?: string | null
          last_attempt_at?: string | null
          message_category?: string | null
          message_purpose?: string | null
          organization_id?: string
          pet_id?: string | null
          provider_message_id?: string | null
          raw_provider_response?: Json | null
          recipient_owner_id?: string | null
          recipient_phone?: string
          scheduled_for?: string
          sender_phone_number_id?: string | null
          status?: string
          template_id?: string | null
          template_variables?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outbound_dispatch_requests_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outbound_dispatch_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outbound_dispatch_requests_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outbound_dispatch_requests_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "outbound_dispatch_requests_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "outbound_dispatch_requests_recipient_owner_id_fkey"
            columns: ["recipient_owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outbound_dispatch_requests_recipient_owner_id_fkey"
            columns: ["recipient_owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "outbound_dispatch_requests_recipient_owner_id_fkey"
            columns: ["recipient_owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "outbound_dispatch_requests_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      owners: {
        Row: {
          communication_channel_preference: string
          created_at: string
          document_number: string | null
          document_type: string | null
          email: string | null
          first_name: string
          id: string
          is_vip: boolean
          last_name: string
          metadata: Json
          notes: string | null
          organization_id: string
          primary_phone: string
          secondary_phone: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          communication_channel_preference?: string
          created_at?: string
          document_number?: string | null
          document_type?: string | null
          email?: string | null
          first_name: string
          id?: string
          is_vip?: boolean
          last_name: string
          metadata?: Json
          notes?: string | null
          organization_id: string
          primary_phone: string
          secondary_phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          communication_channel_preference?: string
          created_at?: string
          document_number?: string | null
          document_type?: string | null
          email?: string | null
          first_name?: string
          id?: string
          is_vip?: boolean
          last_name?: string
          metadata?: Json
          notes?: string | null
          organization_id?: string
          primary_phone?: string
          secondary_phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "owners_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_referrals: {
        Row: {
          clinical_reason: string
          created_at: string
          id: string
          metadata: Json
          organization_id: string
          originating_appointment_id: string | null
          owner_id: string
          patient_id: string
          referring_veterinarian_id: string
          specialty_requested: string
          status: string
          target_specialist_id: string | null
          triage_priority: string
          updated_at: string
        }
        Insert: {
          clinical_reason: string
          created_at?: string
          id?: string
          metadata?: Json
          organization_id: string
          originating_appointment_id?: string | null
          owner_id: string
          patient_id: string
          referring_veterinarian_id: string
          specialty_requested: string
          status?: string
          target_specialist_id?: string | null
          triage_priority?: string
          updated_at?: string
        }
        Update: {
          clinical_reason?: string
          created_at?: string
          id?: string
          metadata?: Json
          organization_id?: string
          originating_appointment_id?: string | null
          owner_id?: string
          patient_id?: string
          referring_veterinarian_id?: string
          specialty_requested?: string
          status?: string
          target_specialist_id?: string | null
          triage_priority?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_referrals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_referrals_originating_appointment_id_fkey"
            columns: ["originating_appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_referrals_originating_appointment_id_fkey"
            columns: ["originating_appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "patient_referrals_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_referrals_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "patient_referrals_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "patient_referrals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_referrals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "patient_referrals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "patient_referrals_referring_veterinarian_id_fkey"
            columns: ["referring_veterinarian_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_referrals_referring_veterinarian_id_fkey"
            columns: ["referring_veterinarian_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "patient_referrals_target_specialist_id_fkey"
            columns: ["target_specialist_id"]
            isOneToOne: false
            referencedRelation: "specialist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_collections: {
        Row: {
          amount: number
          appointment_id: string
          collected_by_staff_id: string | null
          created_at: string
          currency: string
          external_transaction_id: string | null
          id: string
          notes: string | null
          organization_id: string
          owner_id: string
          payment_method: string
          payment_status: string
          updated_at: string
          voucher_file_url: string | null
        }
        Insert: {
          amount: number
          appointment_id: string
          collected_by_staff_id?: string | null
          created_at?: string
          currency?: string
          external_transaction_id?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          owner_id: string
          payment_method: string
          payment_status?: string
          updated_at?: string
          voucher_file_url?: string | null
        }
        Update: {
          amount?: number
          appointment_id?: string
          collected_by_staff_id?: string | null
          created_at?: string
          currency?: string
          external_transaction_id?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          owner_id?: string
          payment_method?: string
          payment_status?: string
          updated_at?: string
          voucher_file_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_collections_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_collections_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "payment_collections_collected_by_staff_id_fkey"
            columns: ["collected_by_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_collections_collected_by_staff_id_fkey"
            columns: ["collected_by_staff_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "payment_collections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_collections_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_collections_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "payment_collections_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
        ]
      }
      payment_verifications: {
        Row: {
          bank_account_credited: string | null
          discrepancy_amount: number | null
          id: string
          payment_collection_id: string
          reconciliation_date: string
          verification_notes: string | null
          verification_status: string
          verified_at: string
          verified_by_user_id: string
        }
        Insert: {
          bank_account_credited?: string | null
          discrepancy_amount?: number | null
          id?: string
          payment_collection_id: string
          reconciliation_date?: string
          verification_notes?: string | null
          verification_status: string
          verified_at?: string
          verified_by_user_id: string
        }
        Update: {
          bank_account_credited?: string | null
          discrepancy_amount?: number | null
          id?: string
          payment_collection_id?: string
          reconciliation_date?: string
          verification_notes?: string | null
          verification_status?: string
          verified_at?: string
          verified_by_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_verifications_payment_collection_id_fkey"
            columns: ["payment_collection_id"]
            isOneToOne: false
            referencedRelation: "payment_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_owner_relations: {
        Row: {
          created_at: string
          id: string
          is_authorized_decision_maker: boolean
          owner_id: string
          pet_id: string
          relation_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_authorized_decision_maker?: boolean
          owner_id: string
          pet_id: string
          relation_type?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_authorized_decision_maker?: boolean
          owner_id?: string
          pet_id?: string
          relation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_owner_relations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_owner_relations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "pet_owner_relations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "pet_owner_relations_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_owner_relations_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "pet_owner_relations_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
        ]
      }
      pets: {
        Row: {
          approximate_age_months: number | null
          birth_date: string | null
          breed: string | null
          color: string | null
          created_at: string
          id: string
          is_neutered: boolean
          is_temperament_warning: boolean
          metadata: Json
          microchip_number: string | null
          name: string
          okvet_patient_id: string | null
          organization_id: string
          primary_owner_id: string
          sex: string
          special_handling_notes: string | null
          species: string
          status: string
          temperament: string | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          approximate_age_months?: number | null
          birth_date?: string | null
          breed?: string | null
          color?: string | null
          created_at?: string
          id?: string
          is_neutered?: boolean
          is_temperament_warning?: boolean
          metadata?: Json
          microchip_number?: string | null
          name: string
          okvet_patient_id?: string | null
          organization_id: string
          primary_owner_id: string
          sex: string
          special_handling_notes?: string | null
          species: string
          status?: string
          temperament?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          approximate_age_months?: number | null
          birth_date?: string | null
          breed?: string | null
          color?: string | null
          created_at?: string
          id?: string
          is_neutered?: boolean
          is_temperament_warning?: boolean
          metadata?: Json
          microchip_number?: string | null
          name?: string
          okvet_patient_id?: string | null
          organization_id?: string
          primary_owner_id?: string
          sex?: string
          special_handling_notes?: string | null
          species?: string
          status?: string
          temperament?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pets_primary_owner_id_fkey"
            columns: ["primary_owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pets_primary_owner_id_fkey"
            columns: ["primary_owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "pets_primary_owner_id_fkey"
            columns: ["primary_owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
        ]
      }
      post_visit_audit: {
        Row: {
          action: string
          actor_id: string | null
          case_id: string | null
          commitment_id: string | null
          created_at: string
          id: string
          payload: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          case_id?: string | null
          commitment_id?: string | null
          created_at?: string
          id?: string
          payload?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          case_id?: string | null
          commitment_id?: string | null
          created_at?: string
          id?: string
          payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "post_visit_audit_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_audit_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "post_visit_audit_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "post_visit_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_audit_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "post_visit_commitments"
            referencedColumns: ["id"]
          },
        ]
      }
      post_visit_cases: {
        Row: {
          administrative_closed_at: string | null
          administrative_closed_by: string | null
          appointment_id: string
          case_status: string
          clinical_closed_at: string | null
          clinical_closed_by: string | null
          continuity_closed_at: string | null
          continuity_closed_by: string | null
          created_at: string
          has_customer_promises: boolean
          has_pending_documents: boolean
          has_pending_referrals: boolean
          has_pending_reports: boolean
          id: string
          open_commitments_count: number
          operational_closed_at: string | null
          operational_closed_by: string | null
          organization_id: string
          owner_id: string
          pet_id: string
          updated_at: string
          veterinarian_id: string
          visit_id: string
        }
        Insert: {
          administrative_closed_at?: string | null
          administrative_closed_by?: string | null
          appointment_id: string
          case_status?: string
          clinical_closed_at?: string | null
          clinical_closed_by?: string | null
          continuity_closed_at?: string | null
          continuity_closed_by?: string | null
          created_at?: string
          has_customer_promises?: boolean
          has_pending_documents?: boolean
          has_pending_referrals?: boolean
          has_pending_reports?: boolean
          id?: string
          open_commitments_count?: number
          operational_closed_at?: string | null
          operational_closed_by?: string | null
          organization_id: string
          owner_id: string
          pet_id: string
          updated_at?: string
          veterinarian_id: string
          visit_id: string
        }
        Update: {
          administrative_closed_at?: string | null
          administrative_closed_by?: string | null
          appointment_id?: string
          case_status?: string
          clinical_closed_at?: string | null
          clinical_closed_by?: string | null
          continuity_closed_at?: string | null
          continuity_closed_by?: string | null
          created_at?: string
          has_customer_promises?: boolean
          has_pending_documents?: boolean
          has_pending_referrals?: boolean
          has_pending_reports?: boolean
          id?: string
          open_commitments_count?: number
          operational_closed_at?: string | null
          operational_closed_by?: string | null
          organization_id?: string
          owner_id?: string
          pet_id?: string
          updated_at?: string
          veterinarian_id?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_visit_cases_administrative_closed_by_fkey"
            columns: ["administrative_closed_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_cases_administrative_closed_by_fkey"
            columns: ["administrative_closed_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "post_visit_cases_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_cases_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "post_visit_cases_clinical_closed_by_fkey"
            columns: ["clinical_closed_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_cases_clinical_closed_by_fkey"
            columns: ["clinical_closed_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "post_visit_cases_continuity_closed_by_fkey"
            columns: ["continuity_closed_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_cases_continuity_closed_by_fkey"
            columns: ["continuity_closed_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "post_visit_cases_operational_closed_by_fkey"
            columns: ["operational_closed_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_cases_operational_closed_by_fkey"
            columns: ["operational_closed_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "post_visit_cases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_cases_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_cases_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "post_visit_cases_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "post_visit_cases_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_cases_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "post_visit_cases_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "post_visit_cases_veterinarian_id_fkey"
            columns: ["veterinarian_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_cases_veterinarian_id_fkey"
            columns: ["veterinarian_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "post_visit_cases_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: true
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      post_visit_checklist_items: {
        Row: {
          checklist_id: string
          created_at: string
          id: string
          is_mandatory: boolean
          item_key: string
          item_label: string
          notes: string | null
          status: string
          value: Json | null
        }
        Insert: {
          checklist_id: string
          created_at?: string
          id?: string
          is_mandatory?: boolean
          item_key: string
          item_label: string
          notes?: string | null
          status?: string
          value?: Json | null
        }
        Update: {
          checklist_id?: string
          created_at?: string
          id?: string
          is_mandatory?: boolean
          item_key?: string
          item_label?: string
          notes?: string | null
          status?: string
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "post_visit_checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "post_visit_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      post_visit_checklists: {
        Row: {
          case_id: string
          checklist_completed: boolean
          client_promises_recorded: boolean
          completed_at: string | null
          completed_by: string | null
          created_at: string
          future_appointments_indicated: boolean
          id: string
          incidents_recorded: boolean
          okvet_record_confirmed: boolean
          operational_finish_confirmed: boolean
          patient_confirmed: boolean
          pending_documents_flag: boolean
          pending_referrals_flag: boolean
          pending_results_flag: boolean
          professional_confirmed: boolean
          responsible_assigned: boolean
          review_needed_flag: boolean
          service_type: string
          visit_id: string
        }
        Insert: {
          case_id: string
          checklist_completed?: boolean
          client_promises_recorded?: boolean
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          future_appointments_indicated?: boolean
          id?: string
          incidents_recorded?: boolean
          okvet_record_confirmed?: boolean
          operational_finish_confirmed?: boolean
          patient_confirmed?: boolean
          pending_documents_flag?: boolean
          pending_referrals_flag?: boolean
          pending_results_flag?: boolean
          professional_confirmed?: boolean
          responsible_assigned?: boolean
          review_needed_flag?: boolean
          service_type?: string
          visit_id: string
        }
        Update: {
          case_id?: string
          checklist_completed?: boolean
          client_promises_recorded?: boolean
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          future_appointments_indicated?: boolean
          id?: string
          incidents_recorded?: boolean
          okvet_record_confirmed?: boolean
          operational_finish_confirmed?: boolean
          patient_confirmed?: boolean
          pending_documents_flag?: boolean
          pending_referrals_flag?: boolean
          pending_results_flag?: boolean
          professional_confirmed?: boolean
          responsible_assigned?: boolean
          review_needed_flag?: boolean
          service_type?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_visit_checklists_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "post_visit_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_checklists_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_checklists_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "post_visit_checklists_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      post_visit_closure_checks: {
        Row: {
          blocking_reasons: Json | null
          case_id: string
          checked_by: string
          created_at: string
          gate_passed: boolean
          id: string
          open_commitments_found: number
          undelivered_documents_found: number
          unreviewed_reports_found: number
        }
        Insert: {
          blocking_reasons?: Json | null
          case_id: string
          checked_by: string
          created_at?: string
          gate_passed?: boolean
          id?: string
          open_commitments_found?: number
          undelivered_documents_found?: number
          unreviewed_reports_found?: number
        }
        Update: {
          blocking_reasons?: Json | null
          case_id?: string
          checked_by?: string
          created_at?: string
          gate_passed?: boolean
          id?: string
          open_commitments_found?: number
          undelivered_documents_found?: number
          unreviewed_reports_found?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_visit_closure_checks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "post_visit_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_closure_checks_checked_by_fkey"
            columns: ["checked_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_closure_checks_checked_by_fkey"
            columns: ["checked_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      post_visit_commitment_assignments: {
        Row: {
          acceptance_status: string
          accepted_at: string | null
          assigned_by: string | null
          assigned_staff_id: string
          assignment_role: string
          commitment_id: string
          created_at: string
          declined_reason: string | null
          delegation_reason: string | null
          id: string
          is_founder_absence: boolean
          previous_staff_id: string | null
        }
        Insert: {
          acceptance_status?: string
          accepted_at?: string | null
          assigned_by?: string | null
          assigned_staff_id: string
          assignment_role: string
          commitment_id: string
          created_at?: string
          declined_reason?: string | null
          delegation_reason?: string | null
          id?: string
          is_founder_absence?: boolean
          previous_staff_id?: string | null
        }
        Update: {
          acceptance_status?: string
          accepted_at?: string | null
          assigned_by?: string | null
          assigned_staff_id?: string
          assignment_role?: string
          commitment_id?: string
          created_at?: string
          declined_reason?: string | null
          delegation_reason?: string | null
          id?: string
          is_founder_absence?: boolean
          previous_staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_visit_commitment_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_commitment_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "post_visit_commitment_assignments_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_commitment_assignments_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "post_visit_commitment_assignments_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "post_visit_commitments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_commitment_assignments_previous_staff_id_fkey"
            columns: ["previous_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_commitment_assignments_previous_staff_id_fkey"
            columns: ["previous_staff_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      post_visit_commitment_escalations: {
        Row: {
          commitment_id: string
          created_at: string
          escalated_by: string
          escalated_to_staff_id: string | null
          escalation_level: string
          id: string
          reason: string
          resolution_notes: string | null
          resolved_at: string | null
          status: string
        }
        Insert: {
          commitment_id: string
          created_at?: string
          escalated_by?: string
          escalated_to_staff_id?: string | null
          escalation_level: string
          id?: string
          reason: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
        }
        Update: {
          commitment_id?: string
          created_at?: string
          escalated_by?: string
          escalated_to_staff_id?: string | null
          escalation_level?: string
          id?: string
          reason?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_visit_commitment_escalations_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "post_visit_commitments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_commitment_escalations_escalated_to_staff_id_fkey"
            columns: ["escalated_to_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_commitment_escalations_escalated_to_staff_id_fkey"
            columns: ["escalated_to_staff_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      post_visit_commitment_snooze_records: {
        Row: {
          approved_by: string | null
          commitment_id: string
          created_at: string
          id: string
          new_due_at: string
          previous_due_at: string
          requested_by: string
          requires_approval: boolean
          snooze_number: number
          snooze_reason: string
        }
        Insert: {
          approved_by?: string | null
          commitment_id: string
          created_at?: string
          id?: string
          new_due_at: string
          previous_due_at: string
          requested_by: string
          requires_approval?: boolean
          snooze_number: number
          snooze_reason: string
        }
        Update: {
          approved_by?: string | null
          commitment_id?: string
          created_at?: string
          id?: string
          new_due_at?: string
          previous_due_at?: string
          requested_by?: string
          requires_approval?: boolean
          snooze_number?: number
          snooze_reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_visit_commitment_snooze_records_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_commitment_snooze_records_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "post_visit_commitment_snooze_records_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "post_visit_commitments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_commitment_snooze_records_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_commitment_snooze_records_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      post_visit_commitment_versions: {
        Row: {
          assigned_staff_id: string | null
          change_reason: string | null
          changed_by: string | null
          commitment_id: string
          created_at: string
          due_at: string | null
          id: string
          snapshot: Json
          status: string
          version_number: number
        }
        Insert: {
          assigned_staff_id?: string | null
          change_reason?: string | null
          changed_by?: string | null
          commitment_id: string
          created_at?: string
          due_at?: string | null
          id?: string
          snapshot: Json
          status: string
          version_number: number
        }
        Update: {
          assigned_staff_id?: string | null
          change_reason?: string | null
          changed_by?: string | null
          commitment_id?: string
          created_at?: string
          due_at?: string | null
          id?: string
          snapshot?: Json
          status?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_visit_commitment_versions_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_commitment_versions_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "post_visit_commitment_versions_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_commitment_versions_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "post_visit_commitment_versions_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "post_visit_commitments"
            referencedColumns: ["id"]
          },
        ]
      }
      post_visit_commitments: {
        Row: {
          appointment_id: string
          assigned_staff_id: string | null
          assignment_status: string
          blocking_reason: string | null
          case_id: string | null
          commitment_type: string
          completion_reference: string | null
          correlation_id: string | null
          created_at: string
          description: string
          due_at: string | null
          due_date: string
          fulfillment_evidence: string | null
          id: string
          idempotency_key: string | null
          max_snooze_allowed: number
          organization_id: string
          owner_id: string
          pet_id: string
          priority: string
          requires_approval: boolean
          requires_evidence: boolean
          requires_professional_review: boolean
          responsible_staff_id: string
          responsible_team_id: string | null
          review_at: string | null
          snooze_count: number
          source_provenance: string
          source_reference: string | null
          source_type: string
          source_version: number
          state_version: number
          status: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
          visit_id: string
        }
        Insert: {
          appointment_id: string
          assigned_staff_id?: string | null
          assignment_status?: string
          blocking_reason?: string | null
          case_id?: string | null
          commitment_type: string
          completion_reference?: string | null
          correlation_id?: string | null
          created_at?: string
          description: string
          due_at?: string | null
          due_date: string
          fulfillment_evidence?: string | null
          id?: string
          idempotency_key?: string | null
          max_snooze_allowed?: number
          organization_id: string
          owner_id: string
          pet_id: string
          priority?: string
          requires_approval?: boolean
          requires_evidence?: boolean
          requires_professional_review?: boolean
          responsible_staff_id: string
          responsible_team_id?: string | null
          review_at?: string | null
          snooze_count?: number
          source_provenance?: string
          source_reference?: string | null
          source_type?: string
          source_version?: number
          state_version?: number
          status?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          visit_id: string
        }
        Update: {
          appointment_id?: string
          assigned_staff_id?: string | null
          assignment_status?: string
          blocking_reason?: string | null
          case_id?: string | null
          commitment_type?: string
          completion_reference?: string | null
          correlation_id?: string | null
          created_at?: string
          description?: string
          due_at?: string | null
          due_date?: string
          fulfillment_evidence?: string | null
          id?: string
          idempotency_key?: string | null
          max_snooze_allowed?: number
          organization_id?: string
          owner_id?: string
          pet_id?: string
          priority?: string
          requires_approval?: boolean
          requires_evidence?: boolean
          requires_professional_review?: boolean
          responsible_staff_id?: string
          responsible_team_id?: string | null
          review_at?: string | null
          snooze_count?: number
          source_provenance?: string
          source_reference?: string | null
          source_type?: string
          source_version?: number
          state_version?: number
          status?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_visit_commitments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_commitments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "post_visit_commitments_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_commitments_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "post_visit_commitments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "post_visit_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_commitments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_commitments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_commitments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "post_visit_commitments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "post_visit_commitments_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_commitments_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "post_visit_commitments_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "post_visit_commitments_responsible_staff_id_fkey"
            columns: ["responsible_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_commitments_responsible_staff_id_fkey"
            columns: ["responsible_staff_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "post_visit_commitments_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_commitments_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "post_visit_commitments_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      post_visit_continuity_handoffs: {
        Row: {
          accepted_at: string | null
          accepted_by_incoming: boolean
          case_id: string
          clinical_summary_brief: string
          created_at: string
          id: string
          incoming_veterinarian_id: string
          open_commitments_snapshot: Json
          outgoing_veterinarian_id: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_incoming?: boolean
          case_id: string
          clinical_summary_brief: string
          created_at?: string
          id?: string
          incoming_veterinarian_id: string
          open_commitments_snapshot: Json
          outgoing_veterinarian_id: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by_incoming?: boolean
          case_id?: string
          clinical_summary_brief?: string
          created_at?: string
          id?: string
          incoming_veterinarian_id?: string
          open_commitments_snapshot?: Json
          outgoing_veterinarian_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_visit_continuity_handoffs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "post_visit_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_continuity_handoffs_incoming_veterinarian_id_fkey"
            columns: ["incoming_veterinarian_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_continuity_handoffs_incoming_veterinarian_id_fkey"
            columns: ["incoming_veterinarian_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "post_visit_continuity_handoffs_outgoing_veterinarian_id_fkey"
            columns: ["outgoing_veterinarian_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_continuity_handoffs_outgoing_veterinarian_id_fkey"
            columns: ["outgoing_veterinarian_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      post_visit_customer_promises: {
        Row: {
          case_id: string
          commitment_id: string | null
          confidence_score: number | null
          created_at: string
          due_at: string | null
          extracted_by_ai: boolean
          fulfilled_at: string | null
          fulfillment_evidence: string | null
          id: string
          promise_text: string
          promised_by: string
          validated_by: string | null
          verification_status: string
        }
        Insert: {
          case_id: string
          commitment_id?: string | null
          confidence_score?: number | null
          created_at?: string
          due_at?: string | null
          extracted_by_ai?: boolean
          fulfilled_at?: string | null
          fulfillment_evidence?: string | null
          id?: string
          promise_text: string
          promised_by: string
          validated_by?: string | null
          verification_status?: string
        }
        Update: {
          case_id?: string
          commitment_id?: string | null
          confidence_score?: number | null
          created_at?: string
          due_at?: string | null
          extracted_by_ai?: boolean
          fulfilled_at?: string | null
          fulfillment_evidence?: string | null
          id?: string
          promise_text?: string
          promised_by?: string
          validated_by?: string | null
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_visit_customer_promises_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "post_visit_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_customer_promises_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "post_visit_commitments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_customer_promises_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_customer_promises_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      post_visit_pending_documents: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          case_id: string
          commitment_id: string | null
          core13_delivery_reference: string | null
          created_at: string
          document_type: string
          id: string
          responsible_staff_id: string | null
          status: string
          storage_path: string | null
          title: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          case_id: string
          commitment_id?: string | null
          core13_delivery_reference?: string | null
          created_at?: string
          document_type: string
          id?: string
          responsible_staff_id?: string | null
          status?: string
          storage_path?: string | null
          title: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          case_id?: string
          commitment_id?: string | null
          core13_delivery_reference?: string | null
          created_at?: string
          document_type?: string
          id?: string
          responsible_staff_id?: string | null
          status?: string
          storage_path?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_visit_pending_documents_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_pending_documents_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "post_visit_pending_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "post_visit_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_pending_documents_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "post_visit_commitments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_pending_documents_responsible_staff_id_fkey"
            columns: ["responsible_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_pending_documents_responsible_staff_id_fkey"
            columns: ["responsible_staff_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      post_visit_pending_reports: {
        Row: {
          case_id: string
          commitment_id: string | null
          created_at: string
          external_entity_name: string
          id: string
          received_at: string | null
          referral_id: string | null
          report_type: string
          review_decision: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          case_id: string
          commitment_id?: string | null
          created_at?: string
          external_entity_name: string
          id?: string
          received_at?: string | null
          referral_id?: string | null
          report_type: string
          review_decision?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          case_id?: string
          commitment_id?: string | null
          created_at?: string
          external_entity_name?: string
          id?: string
          received_at?: string | null
          referral_id?: string | null
          report_type?: string
          review_decision?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_visit_pending_reports_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "post_visit_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_pending_reports_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "post_visit_commitments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_pending_reports_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "specialist_referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_pending_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_visit_pending_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      post_visit_reminders: {
        Row: {
          commitment_id: string
          created_at: string
          id: string
          reminder_channel: string
          scheduled_at: string
          sent_at: string | null
          status: string
        }
        Insert: {
          commitment_id: string
          created_at?: string
          id?: string
          reminder_channel?: string
          scheduled_at: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          commitment_id?: string
          created_at?: string
          id?: string
          reminder_channel?: string
          scheduled_at?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_visit_reminders_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "post_visit_commitments"
            referencedColumns: ["id"]
          },
        ]
      }
      preventive_care_plans: {
        Row: {
          created_at: string
          end_date: string
          id: string
          metadata: Json
          organization_id: string
          pet_id: string
          plan_type: string
          start_date: string
          status: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          metadata?: Json
          organization_id: string
          pet_id: string
          plan_type: string
          start_date: string
          status?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          metadata?: Json
          organization_id?: string
          pet_id?: string
          plan_type?: string
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "preventive_care_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preventive_care_plans_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preventive_care_plans_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "preventive_care_plans_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
        ]
      }
      preventive_due_dates: {
        Row: {
          created_at: string
          due_date: string
          id: string
          last_applied_date: string | null
          last_reminder_sent_at: string | null
          organization_id: string
          pet_id: string
          preventive_type: string
          reminder_lead_days: number
          reminder_sent_count: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_date: string
          id?: string
          last_applied_date?: string | null
          last_reminder_sent_at?: string | null
          organization_id: string
          pet_id: string
          preventive_type: string
          reminder_lead_days?: number
          reminder_sent_count?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_date?: string
          id?: string
          last_applied_date?: string | null
          last_reminder_sent_at?: string | null
          organization_id?: string
          pet_id?: string
          preventive_type?: string
          reminder_lead_days?: number
          reminder_sent_count?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "preventive_due_dates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preventive_due_dates_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preventive_due_dates_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "preventive_due_dates_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
        ]
      }
      processed_events: {
        Row: {
          event_id: string | null
          execution_id: string | null
          handler_name: string
          id: string
          idempotency_key: string
          processed_at: string
          source_system: string
        }
        Insert: {
          event_id?: string | null
          execution_id?: string | null
          handler_name: string
          id?: string
          idempotency_key: string
          processed_at?: string
          source_system?: string
        }
        Update: {
          event_id?: string | null
          execution_id?: string | null
          handler_name?: string
          id?: string
          idempotency_key?: string
          processed_at?: string
          source_system?: string
        }
        Relationships: []
      }
      recurrence_templates: {
        Row: {
          created_at: string
          frequency_interval: number
          frequency_unit: string
          id: string
          is_active: boolean
          name: string
          organization_id: string
          service_id: string
          total_occurrences: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          frequency_interval?: number
          frequency_unit: string
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          service_id: string
          total_occurrences?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          frequency_interval?: number
          frequency_unit?: string
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          service_id?: string
          total_occurrences?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurrence_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurrence_templates_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_treatment_plans: {
        Row: {
          completed_sessions_count: number
          created_at: string
          diagnosis_title: string
          end_date: string | null
          id: string
          notes: string | null
          organization_id: string
          owner_id: string
          pet_id: string
          prescribing_veterinarian_id: string
          start_date: string
          status: string
          template_id: string | null
          total_prescribed_sessions: number
          updated_at: string
        }
        Insert: {
          completed_sessions_count?: number
          created_at?: string
          diagnosis_title: string
          end_date?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          owner_id: string
          pet_id: string
          prescribing_veterinarian_id: string
          start_date: string
          status?: string
          template_id?: string | null
          total_prescribed_sessions?: number
          updated_at?: string
        }
        Update: {
          completed_sessions_count?: number
          created_at?: string
          diagnosis_title?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          owner_id?: string
          pet_id?: string
          prescribing_veterinarian_id?: string
          start_date?: string
          status?: string
          template_id?: string | null
          total_prescribed_sessions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_treatment_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_treatment_plans_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_treatment_plans_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "recurring_treatment_plans_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "recurring_treatment_plans_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_treatment_plans_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "recurring_treatment_plans_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "recurring_treatment_plans_prescribing_veterinarian_id_fkey"
            columns: ["prescribing_veterinarian_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_treatment_plans_prescribing_veterinarian_id_fkey"
            columns: ["prescribing_veterinarian_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "recurring_treatment_plans_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "recurrence_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_visit_occurrences: {
        Row: {
          appointment_id: string | null
          created_at: string
          id: string
          notes: string | null
          plan_id: string
          session_number: number
          status: string
          target_date: string
          window_end_date: string
          window_start_date: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          plan_id: string
          session_number: number
          status?: string
          target_date: string
          window_end_date: string
          window_start_date: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          plan_id?: string
          session_number?: number
          status?: string
          target_date?: string
          window_end_date?: string
          window_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_visit_occurrences_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_visit_occurrences_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "recurring_visit_occurrences_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "recurring_treatment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_approvals: {
        Row: {
          approved_at: string
          approved_by_user_id: string
          decision: string
          decision_notes: string | null
          id: string
          referral_id: string
        }
        Insert: {
          approved_at?: string
          approved_by_user_id: string
          decision: string
          decision_notes?: string | null
          id?: string
          referral_id: string
        }
        Update: {
          approved_at?: string
          approved_by_user_id?: string
          decision?: string
          decision_notes?: string | null
          id?: string
          referral_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_approvals_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "patient_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_documents: {
        Row: {
          created_at: string
          document_type: string
          file_name: string
          file_url: string
          id: string
          is_confidential_clinical: boolean
          referral_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name: string
          file_url: string
          id?: string
          is_confidential_clinical?: boolean
          referral_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string
          file_url?: string
          id?: string
          is_confidential_clinical?: boolean
          referral_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_documents_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "patient_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_followups: {
        Row: {
          client_feedback_notes: string | null
          contact_channel: string
          created_at: string
          followup_date: string
          id: string
          referral_id: string
          status: string
        }
        Insert: {
          client_feedback_notes?: string | null
          contact_channel?: string
          created_at?: string
          followup_date: string
          id?: string
          referral_id: string
          status?: string
        }
        Update: {
          client_feedback_notes?: string | null
          contact_channel?: string
          created_at?: string
          followup_date?: string
          id?: string
          referral_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_followups_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "patient_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      route_alerts: {
        Row: {
          acknowledged_at: string | null
          alert_type: string
          created_at: string
          id: string
          is_acknowledged: boolean
          message: string
          route_id: string
          severity: string
        }
        Insert: {
          acknowledged_at?: string | null
          alert_type: string
          created_at?: string
          id?: string
          is_acknowledged?: boolean
          message: string
          route_id: string
          severity: string
        }
        Update: {
          acknowledged_at?: string | null
          alert_type?: string
          created_at?: string
          id?: string
          is_acknowledged?: boolean
          message?: string
          route_id?: string
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_alerts_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      route_reoptimization_requests: {
        Row: {
          changes_summary: Json
          created_at: string
          id: string
          requested_by: string | null
          route_id: string
          status: string
          trigger_reason: string
        }
        Insert: {
          changes_summary?: Json
          created_at?: string
          id?: string
          requested_by?: string | null
          route_id: string
          status?: string
          trigger_reason: string
        }
        Update: {
          changes_summary?: Json
          created_at?: string
          id?: string
          requested_by?: string | null
          route_id?: string
          status?: string
          trigger_reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_reoptimization_requests_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      route_stops: {
        Row: {
          actual_arrival: string | null
          actual_departure: string | null
          appointment_id: string
          created_at: string
          distance_from_prev_km: number | null
          estimated_arrival: string
          estimated_departure: string
          id: string
          route_id: string
          status: string
          stop_order: number
          travel_time_from_prev_minutes: number | null
        }
        Insert: {
          actual_arrival?: string | null
          actual_departure?: string | null
          appointment_id: string
          created_at?: string
          distance_from_prev_km?: number | null
          estimated_arrival: string
          estimated_departure: string
          id?: string
          route_id: string
          status?: string
          stop_order: number
          travel_time_from_prev_minutes?: number | null
        }
        Update: {
          actual_arrival?: string | null
          actual_departure?: string | null
          appointment_id?: string
          created_at?: string
          distance_from_prev_km?: number | null
          estimated_arrival?: string
          estimated_departure?: string
          id?: string
          route_id?: string
          status?: string
          stop_order?: number
          travel_time_from_prev_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "route_stops_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_stops_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "route_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          created_at: string
          estimated_duration_minutes: number | null
          id: string
          organization_id: string
          route_date: string
          start_hub_address: string
          status: string
          total_distance_km: number | null
          updated_at: string
          veterinarian_id: string
        }
        Insert: {
          created_at?: string
          estimated_duration_minutes?: number | null
          id?: string
          organization_id: string
          route_date: string
          start_hub_address?: string
          status?: string
          total_distance_km?: number | null
          updated_at?: string
          veterinarian_id: string
        }
        Update: {
          created_at?: string
          estimated_duration_minutes?: number | null
          id?: string
          organization_id?: string
          route_date?: string
          start_hub_address?: string
          status?: string
          total_distance_km?: number | null
          updated_at?: string
          veterinarian_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_veterinarian_id_fkey"
            columns: ["veterinarian_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_veterinarian_id_fkey"
            columns: ["veterinarian_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      schedule_simulations: {
        Row: {
          approved_by: string | null
          created_at: string
          created_by: string
          executed_at: string | null
          id: string
          metadata: Json
          objective: string
          organization_id: string
          simulation_name: string
          status: string
          target_date_range_end: string
          target_date_range_start: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          created_by: string
          executed_at?: string | null
          id?: string
          metadata?: Json
          objective: string
          organization_id: string
          simulation_name: string
          status?: string
          target_date_range_end: string
          target_date_range_start: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          created_by?: string
          executed_at?: string | null
          id?: string
          metadata?: Json
          objective?: string
          organization_id?: string
          simulation_name?: string
          status?: string
          target_date_range_end?: string
          target_date_range_start?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_simulations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      security_incidents: {
        Row: {
          actor_user_id: string | null
          created_at: string
          details: string
          id: string
          incident_type: string
          ip_address: string | null
          is_mitigated: boolean
          mitigated_at: string | null
          mitigated_by: string | null
          threat_level: string
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          details: string
          id?: string
          incident_type: string
          ip_address?: string | null
          is_mitigated?: boolean
          mitigated_at?: string | null
          mitigated_by?: string | null
          threat_level: string
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          details?: string
          id?: string
          incident_type?: string
          ip_address?: string | null
          is_mitigated?: boolean
          mitigated_at?: string | null
          mitigated_by?: string | null
          threat_level?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          buffer_after_minutes: number
          buffer_before_minutes: number
          category: string
          code: string
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          is_domiciliary: boolean
          metadata: Json
          name: string
          organization_id: string
          requires_veterinarian: boolean
          updated_at: string
        }
        Insert: {
          buffer_after_minutes?: number
          buffer_before_minutes?: number
          category: string
          code: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          is_domiciliary?: boolean
          metadata?: Json
          name: string
          organization_id: string
          requires_veterinarian?: boolean
          updated_at?: string
        }
        Update: {
          buffer_after_minutes?: number
          buffer_before_minutes?: number
          category?: string
          code?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          is_domiciliary?: boolean
          metadata?: Json
          name?: string
          organization_id?: string
          requires_veterinarian?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_scenarios: {
        Row: {
          created_at: string
          id: string
          is_recommended: boolean
          proposed_schedule: Json
          scenario_name: string
          score: number | null
          simulation_id: string
          travel_time_saved_minutes: number | null
          visits_accommodated_count: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_recommended?: boolean
          proposed_schedule: Json
          scenario_name: string
          score?: number | null
          simulation_id: string
          travel_time_saved_minutes?: number | null
          visits_accommodated_count?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_recommended?: boolean
          proposed_schedule?: Json
          scenario_name?: string
          score?: number | null
          simulation_id?: string
          travel_time_saved_minutes?: number | null
          visits_accommodated_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "simulation_scenarios_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "schedule_simulations"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_snapshots: {
        Row: {
          created_at: string
          id: string
          simulation_id: string
          snapshot_data: Json
        }
        Insert: {
          created_at?: string
          id?: string
          simulation_id: string
          snapshot_data: Json
        }
        Update: {
          created_at?: string
          id?: string
          simulation_id?: string
          snapshot_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "simulation_snapshots_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "schedule_simulations"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_agreements: {
        Row: {
          agreement_type: string
          commission_rate: number | null
          created_at: string
          id: string
          is_active: boolean
          specialist_id: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          agreement_type: string
          commission_rate?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          specialist_id: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          agreement_type?: string
          commission_rate?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          specialist_id?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "specialist_agreements_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "specialist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_appointment_cancellations: {
        Row: {
          cancellation_reason: string
          cancellation_status: string
          created_at: string
          external_evidence: string | null
          id: string
          processed_by_staff_id: string | null
          referral_id: string
          requested_by: string
        }
        Insert: {
          cancellation_reason: string
          cancellation_status?: string
          created_at?: string
          external_evidence?: string | null
          id?: string
          processed_by_staff_id?: string | null
          referral_id: string
          requested_by: string
        }
        Update: {
          cancellation_reason?: string
          cancellation_status?: string
          created_at?: string
          external_evidence?: string | null
          id?: string
          processed_by_staff_id?: string | null
          referral_id?: string
          requested_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialist_appointment_cancellations_processed_by_staff_id_fkey"
            columns: ["processed_by_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_appointment_cancellations_processed_by_staff_id_fkey"
            columns: ["processed_by_staff_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "specialist_appointment_cancellations_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "specialist_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_appointment_changes: {
        Row: {
          change_type: string
          created_at: string
          external_confirmation_evidence: string | null
          id: string
          is_confirmed: boolean
          new_slot_time: string | null
          old_slot_time: string | null
          reason: string
          referral_id: string
          requested_by: string
        }
        Insert: {
          change_type: string
          created_at?: string
          external_confirmation_evidence?: string | null
          id?: string
          is_confirmed?: boolean
          new_slot_time?: string | null
          old_slot_time?: string | null
          reason: string
          referral_id: string
          requested_by: string
        }
        Update: {
          change_type?: string
          created_at?: string
          external_confirmation_evidence?: string | null
          id?: string
          is_confirmed?: boolean
          new_slot_time?: string | null
          old_slot_time?: string | null
          reason?: string
          referral_id?: string
          requested_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialist_appointment_changes_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "specialist_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_appointments: {
        Row: {
          clinical_notes_received: boolean
          created_at: string
          end_time: string
          id: string
          location_type: string
          organization_id: string
          owner_id: string
          patient_id: string
          specialist_id: string
          start_time: string
          status: string
        }
        Insert: {
          clinical_notes_received?: boolean
          created_at?: string
          end_time: string
          id?: string
          location_type?: string
          organization_id: string
          owner_id: string
          patient_id: string
          specialist_id: string
          start_time: string
          status?: string
        }
        Update: {
          clinical_notes_received?: boolean
          created_at?: string
          end_time?: string
          id?: string
          location_type?: string
          organization_id?: string
          owner_id?: string
          patient_id?: string
          specialist_id?: string
          start_time?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialist_appointments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_appointments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_appointments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "specialist_appointments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "specialist_appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "specialist_appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "specialist_appointments_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "specialist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_attendance_followups: {
        Row: {
          attendance_status: string
          created_at: string
          id: string
          notes: string | null
          referral_id: string
          verification_source: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          attendance_status?: string
          created_at?: string
          id?: string
          notes?: string | null
          referral_id: string
          verification_source: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          attendance_status?: string
          created_at?: string
          id?: string
          notes?: string | null
          referral_id?: string
          verification_source?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "specialist_attendance_followups_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "specialist_referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_attendance_followups_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_attendance_followups_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      specialist_availability_options: {
        Row: {
          created_at: string
          id: string
          location_address: string | null
          referral_id: string
          response_id: string | null
          slot_end: string
          slot_start: string
          specialist_id: string
          tariff_amount: number | null
          valid_until: string
          validity_status: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_address?: string | null
          referral_id: string
          response_id?: string | null
          slot_end: string
          slot_start: string
          specialist_id: string
          tariff_amount?: number | null
          valid_until: string
          validity_status?: string
        }
        Update: {
          created_at?: string
          id?: string
          location_address?: string | null
          referral_id?: string
          response_id?: string | null
          slot_end?: string
          slot_start?: string
          specialist_id?: string
          tariff_amount?: number | null
          valid_until?: string
          validity_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialist_availability_options_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "specialist_referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_availability_options_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "specialist_availability_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_availability_options_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "specialist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_availability_requests: {
        Row: {
          channel: string
          created_at: string
          expires_at: string
          id: string
          referral_id: string
          requested_by: string | null
          specialist_id: string
          status: string
          target_date_range_end: string | null
          target_date_range_start: string | null
        }
        Insert: {
          channel?: string
          created_at?: string
          expires_at: string
          id?: string
          referral_id: string
          requested_by?: string | null
          specialist_id: string
          status?: string
          target_date_range_end?: string | null
          target_date_range_start?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          expires_at?: string
          id?: string
          referral_id?: string
          requested_by?: string | null
          specialist_id?: string
          status?: string
          target_date_range_end?: string | null
          target_date_range_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "specialist_availability_requests_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "specialist_referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_availability_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_availability_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "specialist_availability_requests_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "specialist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_availability_responses: {
        Row: {
          created_at: string
          id: string
          is_ambiguous: boolean
          raw_response_text: string | null
          received_at: string
          received_channel: string
          recorded_by: string | null
          referral_id: string
          request_id: string | null
          specialist_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_ambiguous?: boolean
          raw_response_text?: string | null
          received_at?: string
          received_channel?: string
          recorded_by?: string | null
          referral_id: string
          request_id?: string | null
          specialist_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_ambiguous?: boolean
          raw_response_text?: string | null
          received_at?: string
          received_channel?: string
          recorded_by?: string | null
          referral_id?: string
          request_id?: string | null
          specialist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialist_availability_responses_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_availability_responses_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "specialist_availability_responses_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "specialist_referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_availability_responses_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "specialist_availability_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_availability_responses_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "specialist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_booking_requests: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          owner_id: string
          patient_id: string
          rejection_reason: string | null
          requested_slot_start: string
          specialist_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          owner_id: string
          patient_id: string
          rejection_reason?: string | null
          requested_slot_start: string
          specialist_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          owner_id?: string
          patient_id?: string
          rejection_reason?: string | null
          requested_slot_start?: string
          specialist_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialist_booking_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_booking_requests_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_booking_requests_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "specialist_booking_requests_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "specialist_booking_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_booking_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "specialist_booking_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "specialist_booking_requests_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "specialist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_document_access_audit: {
        Row: {
          access_event: string
          attempt_timestamp: string
          details: Json | null
          grant_id: string
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          access_event: string
          attempt_timestamp?: string
          details?: Json | null
          grant_id: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          access_event?: string
          attempt_timestamp?: string
          details?: Json | null
          grant_id?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "specialist_document_access_audit_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "specialist_document_access_grants"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_document_access_grants: {
        Row: {
          created_at: string
          document_id: string
          expires_at: string
          granted_by: string
          id: string
          is_revoked: boolean
          referral_id: string
          revocation_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          specialist_id: string
          token_hash: string
        }
        Insert: {
          created_at?: string
          document_id: string
          expires_at: string
          granted_by: string
          id?: string
          is_revoked?: boolean
          referral_id: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          specialist_id: string
          token_hash: string
        }
        Update: {
          created_at?: string
          document_id?: string
          expires_at?: string
          granted_by?: string
          id?: string
          is_revoked?: boolean
          referral_id?: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          specialist_id?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialist_document_access_grants_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "specialist_referral_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_document_access_grants_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_document_access_grants_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "specialist_document_access_grants_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "specialist_referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_document_access_grants_revoked_by_fkey"
            columns: ["revoked_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_document_access_grants_revoked_by_fkey"
            columns: ["revoked_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "specialist_document_access_grants_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "specialist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_external_confirmations: {
        Row: {
          clinic_name: string
          communication_notified: boolean
          confirmed_at: string
          confirmed_by_staff_id: string
          confirmed_slot_time: string
          created_at: string
          evidence_details: string
          evidence_type: string
          external_booking_reference: string
          id: string
          referral_id: string
          specialist_id: string
        }
        Insert: {
          clinic_name: string
          communication_notified?: boolean
          confirmed_at?: string
          confirmed_by_staff_id: string
          confirmed_slot_time: string
          created_at?: string
          evidence_details: string
          evidence_type: string
          external_booking_reference: string
          id?: string
          referral_id: string
          specialist_id: string
        }
        Update: {
          clinic_name?: string
          communication_notified?: boolean
          confirmed_at?: string
          confirmed_by_staff_id?: string
          confirmed_slot_time?: string
          created_at?: string
          evidence_details?: string
          evidence_type?: string
          external_booking_reference?: string
          id?: string
          referral_id?: string
          specialist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialist_external_confirmations_confirmed_by_staff_id_fkey"
            columns: ["confirmed_by_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_external_confirmations_confirmed_by_staff_id_fkey"
            columns: ["confirmed_by_staff_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "specialist_external_confirmations_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "specialist_referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_external_confirmations_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "specialist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_offer_selections: {
        Row: {
          created_at: string
          id: string
          is_valid: boolean
          offer_id: string
          revalidation_status: string
          selected_by_user_id: string | null
          selected_item_id: string
          selection_channel: string
          selection_timestamp: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_valid?: boolean
          offer_id: string
          revalidation_status?: string
          selected_by_user_id?: string | null
          selected_item_id: string
          selection_channel?: string
          selection_timestamp?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_valid?: boolean
          offer_id?: string
          revalidation_status?: string
          selected_by_user_id?: string | null
          selected_item_id?: string
          selection_channel?: string
          selection_timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialist_offer_selections_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "specialist_option_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_offer_selections_selected_item_id_fkey"
            columns: ["selected_item_id"]
            isOneToOne: false
            referencedRelation: "specialist_option_offer_items"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_option_offer_items: {
        Row: {
          clinic_address: string | null
          created_at: string
          estimated_cost: number | null
          id: string
          is_selected: boolean
          item_label: string
          offer_id: string
          option_id: string
          slot_start: string
          specialist_name: string
        }
        Insert: {
          clinic_address?: string | null
          created_at?: string
          estimated_cost?: number | null
          id?: string
          is_selected?: boolean
          item_label: string
          offer_id: string
          option_id: string
          slot_start: string
          specialist_name: string
        }
        Update: {
          clinic_address?: string | null
          created_at?: string
          estimated_cost?: number | null
          id?: string
          is_selected?: boolean
          item_label?: string
          offer_id?: string
          option_id?: string
          slot_start?: string
          specialist_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialist_option_offer_items_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "specialist_option_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_option_offer_items_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "specialist_availability_options"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_option_offers: {
        Row: {
          created_at: string
          dispatched_at: string | null
          expires_at: string
          id: string
          offer_version: number
          opaque_token: string
          recipient_owner_id: string
          recipient_phone: string
          referral_id: string
          status: string
        }
        Insert: {
          created_at?: string
          dispatched_at?: string | null
          expires_at: string
          id?: string
          offer_version?: number
          opaque_token: string
          recipient_owner_id: string
          recipient_phone: string
          referral_id: string
          status?: string
        }
        Update: {
          created_at?: string
          dispatched_at?: string | null
          expires_at?: string
          id?: string
          offer_version?: number
          opaque_token?: string
          recipient_owner_id?: string
          recipient_phone?: string
          referral_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialist_option_offers_recipient_owner_id_fkey"
            columns: ["recipient_owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_option_offers_recipient_owner_id_fkey"
            columns: ["recipient_owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "specialist_option_offers_recipient_owner_id_fkey"
            columns: ["recipient_owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "specialist_option_offers_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "specialist_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_profiles: {
        Row: {
          availability_mode: string
          cancellation_policy: string | null
          clinic_address: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          is_backup_specialist: boolean
          is_external_partner: boolean
          last_contact_at: string | null
          metadata: Json
          offers_home_service: boolean
          organization_id: string
          phone: string
          pricing_info: Json
          pricing_verified_at: string | null
          professional_card_number: string
          response_time_hours: number | null
          service_area: string | null
          service_conditions: string | null
          updated_at: string
          user_id: string | null
          verification_source: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          availability_mode?: string
          cancellation_policy?: string | null
          clinic_address?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          is_backup_specialist?: boolean
          is_external_partner?: boolean
          last_contact_at?: string | null
          metadata?: Json
          offers_home_service?: boolean
          organization_id: string
          phone: string
          pricing_info?: Json
          pricing_verified_at?: string | null
          professional_card_number: string
          response_time_hours?: number | null
          service_area?: string | null
          service_conditions?: string | null
          updated_at?: string
          user_id?: string | null
          verification_source?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          availability_mode?: string
          cancellation_policy?: string | null
          clinic_address?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          is_backup_specialist?: boolean
          is_external_partner?: boolean
          last_contact_at?: string | null
          metadata?: Json
          offers_home_service?: boolean
          organization_id?: string
          phone?: string
          pricing_info?: Json
          pricing_verified_at?: string | null
          professional_card_number?: string
          response_time_hours?: number | null
          service_area?: string | null
          service_conditions?: string | null
          updated_at?: string
          user_id?: string | null
          verification_source?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "specialist_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_profiles_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_profiles_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      specialist_referral_audit: {
        Row: {
          action_type: string
          actor_id: string | null
          actor_role: string | null
          created_at: string
          details: Json | null
          id: string
          new_status: string
          previous_status: string | null
          referral_id: string
        }
        Insert: {
          action_type: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          new_status: string
          previous_status?: string | null
          referral_id: string
        }
        Update: {
          action_type?: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          new_status?: string
          previous_status?: string | null
          referral_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialist_referral_audit_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "specialist_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_referral_commitments: {
        Row: {
          assigned_role: string
          assigned_to: string | null
          commitment_description: string
          created_at: string
          due_date: string
          id: string
          is_mandatory_for_closure: boolean
          referral_id: string
          resolved_at: string | null
          status: string
        }
        Insert: {
          assigned_role?: string
          assigned_to?: string | null
          commitment_description: string
          created_at?: string
          due_date: string
          id?: string
          is_mandatory_for_closure?: boolean
          referral_id: string
          resolved_at?: string | null
          status?: string
        }
        Update: {
          assigned_role?: string
          assigned_to?: string | null
          commitment_description?: string
          created_at?: string
          due_date?: string
          id?: string
          is_mandatory_for_closure?: boolean
          referral_id?: string
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialist_referral_commitments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_referral_commitments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "specialist_referral_commitments_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "specialist_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_referral_documents: {
        Row: {
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          document_name: string
          document_type: string
          file_size_bytes: number | null
          id: string
          mime_type: string
          referral_id: string
          rejection_reason: string | null
          storage_bucket: string
          storage_path: string
        }
        Insert: {
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          document_name: string
          document_type: string
          file_size_bytes?: number | null
          id?: string
          mime_type: string
          referral_id: string
          rejection_reason?: string | null
          storage_bucket?: string
          storage_path: string
        }
        Update: {
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          document_name?: string
          document_type?: string
          file_size_bytes?: number | null
          id?: string
          mime_type?: string
          referral_id?: string
          rejection_reason?: string | null
          storage_bucket?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialist_referral_documents_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_referral_documents_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "specialist_referral_documents_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "specialist_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_referral_escalations: {
        Row: {
          created_at: string
          escalated_to_role: string
          escalation_reason: string
          id: string
          referral_id: string
          resolution_notes: string | null
          severity: string
          status: string
        }
        Insert: {
          created_at?: string
          escalated_to_role?: string
          escalation_reason: string
          id?: string
          referral_id: string
          resolution_notes?: string | null
          severity?: string
          status?: string
        }
        Update: {
          created_at?: string
          escalated_to_role?: string
          escalation_reason?: string
          id?: string
          referral_id?: string
          resolution_notes?: string | null
          severity?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialist_referral_escalations_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "specialist_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_referral_versions: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          created_at: string
          id: string
          referral_id: string
          snapshot_data: Json
          version_number: number
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          referral_id: string
          snapshot_data: Json
          version_number: number
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          referral_id?: string
          snapshot_data?: Json
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "specialist_referral_versions_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_referral_versions_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "specialist_referral_versions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "specialist_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_referrals: {
        Row: {
          approval_notes: string | null
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          assigned_specialist_id: string | null
          clinical_indication: string
          closed_at: string | null
          closed_by: string | null
          closure_reason: string | null
          closure_status: string | null
          confirmed_appointment_time: string | null
          coordination_status: string
          created_at: string
          external_booking_reference: string | null
          id: string
          idempotency_key: string | null
          metadata: Json
          organization_id: string
          owner_id: string
          pet_id: string
          priority: string
          referral_version: number
          referring_veterinarian_id: string
          source_system: string
          specialty_code: string
          specialty_id: string | null
          updated_at: string
        }
        Insert: {
          approval_notes?: string | null
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          assigned_specialist_id?: string | null
          clinical_indication: string
          closed_at?: string | null
          closed_by?: string | null
          closure_reason?: string | null
          closure_status?: string | null
          confirmed_appointment_time?: string | null
          coordination_status?: string
          created_at?: string
          external_booking_reference?: string | null
          id?: string
          idempotency_key?: string | null
          metadata?: Json
          organization_id: string
          owner_id: string
          pet_id: string
          priority?: string
          referral_version?: number
          referring_veterinarian_id: string
          source_system?: string
          specialty_code: string
          specialty_id?: string | null
          updated_at?: string
        }
        Update: {
          approval_notes?: string | null
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          assigned_specialist_id?: string | null
          clinical_indication?: string
          closed_at?: string | null
          closed_by?: string | null
          closure_reason?: string | null
          closure_status?: string | null
          confirmed_appointment_time?: string | null
          coordination_status?: string
          created_at?: string
          external_booking_reference?: string | null
          id?: string
          idempotency_key?: string | null
          metadata?: Json
          organization_id?: string
          owner_id?: string
          pet_id?: string
          priority?: string
          referral_version?: number
          referring_veterinarian_id?: string
          source_system?: string
          specialty_code?: string
          specialty_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialist_referrals_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_referrals_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "specialist_referrals_assigned_specialist_id_fkey"
            columns: ["assigned_specialist_id"]
            isOneToOne: false
            referencedRelation: "specialist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_referrals_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_referrals_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "specialist_referrals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_referrals_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_referrals_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "specialist_referrals_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
          {
            foreignKeyName: "specialist_referrals_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_referrals_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "specialist_referrals_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "specialist_referrals_referring_veterinarian_id_fkey"
            columns: ["referring_veterinarian_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_referrals_referring_veterinarian_id_fkey"
            columns: ["referring_veterinarian_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "specialist_referrals_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialty_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_report_receipts: {
        Row: {
          created_at: string
          id: string
          received_at: string
          received_channel: string
          referral_id: string
          report_file_path: string | null
          report_summary: string | null
          specialist_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          received_at?: string
          received_channel?: string
          referral_id: string
          report_file_path?: string | null
          report_summary?: string | null
          specialist_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          received_at?: string
          received_channel?: string
          referral_id?: string
          report_file_path?: string | null
          report_summary?: string | null
          specialist_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialist_report_receipts_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "specialist_referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_report_receipts_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "specialist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_report_reviews: {
        Row: {
          clinical_assessment: string
          continuity_plan: string | null
          created_at: string
          id: string
          referral_id: string
          report_receipt_id: string
          review_outcome: string
          reviewed_at: string
          reviewing_vet_id: string
        }
        Insert: {
          clinical_assessment: string
          continuity_plan?: string | null
          created_at?: string
          id?: string
          referral_id: string
          report_receipt_id: string
          review_outcome: string
          reviewed_at?: string
          reviewing_vet_id: string
        }
        Update: {
          clinical_assessment?: string
          continuity_plan?: string | null
          created_at?: string
          id?: string
          referral_id?: string
          report_receipt_id?: string
          review_outcome?: string
          reviewed_at?: string
          reviewing_vet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialist_report_reviews_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "specialist_referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_report_reviews_report_receipt_id_fkey"
            columns: ["report_receipt_id"]
            isOneToOne: false
            referencedRelation: "specialist_report_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_report_reviews_reviewing_vet_id_fkey"
            columns: ["reviewing_vet_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_report_reviews_reviewing_vet_id_fkey"
            columns: ["reviewing_vet_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      specialist_slot_holds: {
        Row: {
          created_at: string
          end_time: string
          expires_at: string
          held_for_patient_id: string | null
          id: string
          is_confirmed: boolean
          specialist_id: string
          start_time: string
        }
        Insert: {
          created_at?: string
          end_time: string
          expires_at: string
          held_for_patient_id?: string | null
          id?: string
          is_confirmed?: boolean
          specialist_id: string
          start_time: string
        }
        Update: {
          created_at?: string
          end_time?: string
          expires_at?: string
          held_for_patient_id?: string | null
          id?: string
          is_confirmed?: boolean
          specialist_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialist_slot_holds_held_for_patient_id_fkey"
            columns: ["held_for_patient_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_slot_holds_held_for_patient_id_fkey"
            columns: ["held_for_patient_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "specialist_slot_holds_held_for_patient_id_fkey"
            columns: ["held_for_patient_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "specialist_slot_holds_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "specialist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_specialties: {
        Row: {
          accreditation_details: string | null
          created_at: string
          id: string
          specialist_id: string
          specialty_name: string
        }
        Insert: {
          accreditation_details?: string | null
          created_at?: string
          id?: string
          specialist_id: string
          specialty_name: string
        }
        Update: {
          accreditation_details?: string | null
          created_at?: string
          id?: string
          specialist_id?: string
          specialty_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialist_specialties_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "specialist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      specialty_catalog: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_active: boolean
          organization_id: string
          requires_specialist_vet_license: boolean
          specialty_code: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean
          organization_id: string
          requires_specialist_vet_license?: boolean
          specialty_code: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean
          organization_id?: string
          requires_specialist_vet_license?: boolean
          specialty_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialty_catalog_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_absences: {
        Row: {
          absence_type: string
          approval_status: string
          approved_by: string | null
          created_at: string
          end_date: string
          id: string
          notes: string | null
          organization_id: string
          staff_profile_id: string
          start_date: string
        }
        Insert: {
          absence_type: string
          approval_status?: string
          approved_by?: string | null
          created_at?: string
          end_date: string
          id?: string
          notes?: string | null
          organization_id: string
          staff_profile_id: string
          start_date: string
        }
        Update: {
          absence_type?: string
          approval_status?: string
          approved_by?: string | null
          created_at?: string
          end_date?: string
          id?: string
          notes?: string | null
          organization_id?: string
          staff_profile_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_absences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_absences_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_absences_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      staff_calendar_connections: {
        Row: {
          account_email: string | null
          calendar_id: string
          calendar_name: string | null
          created_at: string
          id: string
          is_sync_enabled: boolean
          last_failure_at: string | null
          last_success_at: string | null
          metadata: Json
          organization_id: string | null
          permission_mode: string | null
          privacy_mode: string
          provider: string
          revoked_at: string | null
          selected_for_availability: boolean | null
          staff_profile_id: string
          stale_after: string | null
          status: string | null
          sync_frequency_minutes: number
          sync_token: string | null
          updated_at: string
        }
        Insert: {
          account_email?: string | null
          calendar_id: string
          calendar_name?: string | null
          created_at?: string
          id?: string
          is_sync_enabled?: boolean
          last_failure_at?: string | null
          last_success_at?: string | null
          metadata?: Json
          organization_id?: string | null
          permission_mode?: string | null
          privacy_mode?: string
          provider: string
          revoked_at?: string | null
          selected_for_availability?: boolean | null
          staff_profile_id: string
          stale_after?: string | null
          status?: string | null
          sync_frequency_minutes?: number
          sync_token?: string | null
          updated_at?: string
        }
        Update: {
          account_email?: string | null
          calendar_id?: string
          calendar_name?: string | null
          created_at?: string
          id?: string
          is_sync_enabled?: boolean
          last_failure_at?: string | null
          last_success_at?: string | null
          metadata?: Json
          organization_id?: string | null
          permission_mode?: string | null
          privacy_mode?: string
          provider?: string
          revoked_at?: string | null
          selected_for_availability?: boolean | null
          staff_profile_id?: string
          stale_after?: string | null
          status?: string | null
          sync_frequency_minutes?: number
          sync_token?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_calendar_connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_calendar_connections_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_calendar_connections_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      staff_devices: {
        Row: {
          authorized_at: string
          client_type: string
          created_at: string
          device_identifier: string
          device_model: string | null
          expires_at: string | null
          id: string
          is_authorized: boolean
          organization_id: string
          platform: string
          staff_id: string
          updated_at: string
        }
        Insert: {
          authorized_at?: string
          client_type: string
          created_at?: string
          device_identifier: string
          device_model?: string | null
          expires_at?: string | null
          id?: string
          is_authorized?: boolean
          organization_id: string
          platform: string
          staff_id: string
          updated_at?: string
        }
        Update: {
          authorized_at?: string
          client_type?: string
          created_at?: string
          device_identifier?: string
          device_model?: string | null
          expires_at?: string | null
          id?: string
          is_authorized?: boolean
          organization_id?: string
          platform?: string
          staff_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_devices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_devices_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_devices_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      staff_profiles: {
        Row: {
          created_at: string
          default_branch_id: string | null
          id: string
          is_active: boolean
          is_available_for_dispatch: boolean
          job_title: string
          metadata: Json
          organization_id: string
          professional_card_number: string | null
          specialties: string[]
          updated_at: string
          user_id: string
          working_zones: Json
        }
        Insert: {
          created_at?: string
          default_branch_id?: string | null
          id?: string
          is_active?: boolean
          is_available_for_dispatch?: boolean
          job_title: string
          metadata?: Json
          organization_id: string
          professional_card_number?: string | null
          specialties?: string[]
          updated_at?: string
          user_id: string
          working_zones?: Json
        }
        Update: {
          created_at?: string
          default_branch_id?: string | null
          id?: string
          is_active?: boolean
          is_available_for_dispatch?: boolean
          job_title?: string
          metadata?: Json
          organization_id?: string
          professional_card_number?: string | null
          specialties?: string[]
          updated_at?: string
          user_id?: string
          working_zones?: Json
        }
        Relationships: [
          {
            foreignKeyName: "staff_profiles_default_branch_id_fkey"
            columns: ["default_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_qualifications: {
        Row: {
          created_at: string
          document_url: string | null
          id: string
          institution: string
          issuing_year: number | null
          staff_profile_id: string
          title: string
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          document_url?: string | null
          id?: string
          institution: string
          issuing_year?: number | null
          staff_profile_id: string
          title: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          document_url?: string | null
          id?: string
          institution?: string
          issuing_year?: number | null
          staff_profile_id?: string
          title?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_qualifications_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_qualifications_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      staff_shifts: {
        Row: {
          created_at: string
          end_time: string
          id: string
          is_active: boolean
          max_appointments: number
          organization_id: string
          shift_date: string
          staff_profile_id: string
          start_time: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          is_active?: boolean
          max_appointments?: number
          organization_id: string
          shift_date: string
          staff_profile_id: string
          start_time: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          is_active?: boolean
          max_appointments?: number
          organization_id?: string
          shift_date?: string
          staff_profile_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_shifts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_shifts_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_shifts_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      supplies: {
        Row: {
          category: string
          cold_chain_required: boolean
          controlled_substance: boolean
          created_at: string
          id: string
          is_active: boolean
          min_stock_alert_threshold: number
          name: string
          organization_id: string
          sku: string
          unit_of_measure: string
          updated_at: string
        }
        Insert: {
          category: string
          cold_chain_required?: boolean
          controlled_substance?: boolean
          created_at?: string
          id?: string
          is_active?: boolean
          min_stock_alert_threshold?: number
          name: string
          organization_id: string
          sku: string
          unit_of_measure?: string
          updated_at?: string
        }
        Update: {
          category?: string
          cold_chain_required?: boolean
          controlled_substance?: boolean
          created_at?: string
          id?: string
          is_active?: boolean
          min_stock_alert_threshold?: number
          name?: string
          organization_id?: string
          sku?: string
          unit_of_measure?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      supply_movements: {
        Row: {
          batch_number: string | null
          created_at: string
          created_by: string | null
          destination_location: string | null
          expiration_date: string | null
          id: string
          movement_type: string
          organization_id: string
          quantity: number
          source_location: string
          staff_profile_id: string | null
          supply_id: string
          visit_id: string | null
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          created_by?: string | null
          destination_location?: string | null
          expiration_date?: string | null
          id?: string
          movement_type: string
          organization_id: string
          quantity: number
          source_location?: string
          staff_profile_id?: string | null
          supply_id: string
          visit_id?: string | null
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          created_by?: string | null
          destination_location?: string | null
          expiration_date?: string | null
          id?: string
          movement_type?: string
          organization_id?: string
          quantity?: number
          source_location?: string
          staff_profile_id?: string | null
          supply_id?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supply_movements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_movements_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_movements_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "supply_movements_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supplies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_movements_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      system_event_logs: {
        Row: {
          component: string
          created_at: string
          details: Json
          event_name: string
          id: string
          message: string
          severity: string
        }
        Insert: {
          component: string
          created_at?: string
          details?: Json
          event_name: string
          id?: string
          message: string
          severity: string
        }
        Update: {
          component?: string
          created_at?: string
          details?: Json
          event_name?: string
          id?: string
          message?: string
          severity?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          key: string
          organization_id: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          key: string
          organization_id: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          key?: string
          organization_id?: string
          updated_at?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tariffs: {
        Row: {
          base_price: number
          branch_id: string | null
          created_at: string
          currency: string
          domiciliary_surcharge: number
          emergency_surcharge: number
          id: string
          is_active: boolean
          name: string
          organization_id: string
          service_id: string
          updated_at: string
          valid_from: string
          valid_until: string | null
          weekend_surcharge: number
        }
        Insert: {
          base_price: number
          branch_id?: string | null
          created_at?: string
          currency?: string
          domiciliary_surcharge?: number
          emergency_surcharge?: number
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          service_id: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
          weekend_surcharge?: number
        }
        Update: {
          base_price?: number
          branch_id?: string | null
          created_at?: string
          currency?: string
          domiciliary_surcharge?: number
          emergency_surcharge?: number
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          service_id?: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
          weekend_surcharge?: number
        }
        Relationships: [
          {
            foreignKeyName: "tariffs_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tariffs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tariffs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_sessions: {
        Row: {
          authorized_at: string
          created_at: string
          device_id: string
          ended_at: string | null
          expires_at: string
          id: string
          organization_id: string
          purpose: string
          route_id: string | null
          source: string
          staff_id: string
          started_at: string
          status: string
          updated_at: string
          visit_id: string | null
        }
        Insert: {
          authorized_at?: string
          created_at?: string
          device_id: string
          ended_at?: string | null
          expires_at: string
          id?: string
          organization_id: string
          purpose: string
          route_id?: string | null
          source: string
          staff_id: string
          started_at?: string
          status?: string
          updated_at?: string
          visit_id?: string | null
        }
        Update: {
          authorized_at?: string
          created_at?: string
          device_id?: string
          ended_at?: string | null
          expires_at?: string
          id?: string
          organization_id?: string
          purpose?: string
          route_id?: string | null
          source?: string
          staff_id?: string
          started_at?: string
          status?: string
          updated_at?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracking_sessions_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "staff_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_sessions_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_sessions_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_sessions_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "tracking_sessions_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      transactional_outbox: {
        Row: {
          aggregate_id: string
          aggregate_type: string
          causation_id: string | null
          claim_expires_at: string | null
          claimed_at: string | null
          claimed_by: string | null
          correlation_id: string
          created_at: string
          error_log: string | null
          event_type: string
          id: string
          idempotency_key: string
          max_retries: number
          organization_id: string
          payload: Json
          processed_at: string | null
          result_details: Json | null
          retry_count: number
          schema_version: number
          source_system: string
          status: string
        }
        Insert: {
          aggregate_id: string
          aggregate_type: string
          causation_id?: string | null
          claim_expires_at?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          correlation_id?: string
          created_at?: string
          error_log?: string | null
          event_type: string
          id?: string
          idempotency_key: string
          max_retries?: number
          organization_id: string
          payload: Json
          processed_at?: string | null
          result_details?: Json | null
          retry_count?: number
          schema_version?: number
          source_system?: string
          status?: string
        }
        Update: {
          aggregate_id?: string
          aggregate_type?: string
          causation_id?: string | null
          claim_expires_at?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          correlation_id?: string
          created_at?: string
          error_log?: string | null
          event_type?: string
          id?: string
          idempotency_key?: string
          max_retries?: number
          organization_id?: string
          payload?: Json
          processed_at?: string | null
          result_details?: Json | null
          retry_count?: number
          schema_version?: number
          source_system?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactional_outbox_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role_type"]
          status: string
          token_hash: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role_type"]
          status?: string
          token_hash: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role_type"]
          status?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          document_number: string | null
          document_type: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean
          metadata: Json
          phone: string | null
          preferred_language: string
          timezone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          document_number?: string | null
          document_type?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean
          metadata?: Json
          phone?: string | null
          preferred_language?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          document_number?: string | null
          document_type?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          metadata?: Json
          phone?: string | null
          preferred_language?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      vehicle_inventory_allocations: {
        Row: {
          batch_number: string | null
          current_quantity: number
          expiration_date: string | null
          id: string
          last_reconciled_at: string
          staff_profile_id: string
          supply_id: string
        }
        Insert: {
          batch_number?: string | null
          current_quantity?: number
          expiration_date?: string | null
          id?: string
          last_reconciled_at?: string
          staff_profile_id: string
          supply_id: string
        }
        Update: {
          batch_number?: string | null
          current_quantity?: number
          expiration_date?: string | null
          id?: string
          last_reconciled_at?: string
          staff_profile_id?: string
          supply_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_inventory_allocations_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_inventory_allocations_staff_profile_id_fkey"
            columns: ["staff_profile_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "vehicle_inventory_allocations_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supplies"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_charge_lines: {
        Row: {
          appointment_id: string
          created_at: string
          currency: string
          description: string
          discount_amount: number
          id: string
          organization_id: string
          quantity: number
          service_id: string | null
          supply_id: string | null
          tax_amount: number
          total_line_amount: number
          unit_price: number
          visit_id: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          currency?: string
          description: string
          discount_amount?: number
          id?: string
          organization_id: string
          quantity?: number
          service_id?: string | null
          supply_id?: string | null
          tax_amount?: number
          total_line_amount: number
          unit_price: number
          visit_id: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          currency?: string
          description?: string
          discount_amount?: number
          id?: string
          organization_id?: string
          quantity?: number
          service_id?: string | null
          supply_id?: string | null
          tax_amount?: number
          total_line_amount?: number
          unit_price?: number
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_charge_lines_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_charge_lines_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "visit_charge_lines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_charge_lines_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_charge_lines_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supplies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_charge_lines_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_timing_records: {
        Row: {
          arrived_at: string | null
          created_at: string
          estimated_service_finish_at: string | null
          id: string
          last_estimate_updated_at: string | null
          planned_duration_minutes: number
          planned_end_at: string
          planned_start_at: string
          service_finished_at: string | null
          service_started_at: string | null
          travel_started_at: string | null
          updated_at: string
          updated_by: string | null
          visit_id: string
        }
        Insert: {
          arrived_at?: string | null
          created_at?: string
          estimated_service_finish_at?: string | null
          id?: string
          last_estimate_updated_at?: string | null
          planned_duration_minutes: number
          planned_end_at: string
          planned_start_at: string
          service_finished_at?: string | null
          service_started_at?: string | null
          travel_started_at?: string | null
          updated_at?: string
          updated_by?: string | null
          visit_id: string
        }
        Update: {
          arrived_at?: string | null
          created_at?: string
          estimated_service_finish_at?: string | null
          id?: string
          last_estimate_updated_at?: string | null
          planned_duration_minutes?: number
          planned_end_at?: string
          planned_start_at?: string
          service_finished_at?: string | null
          service_started_at?: string | null
          travel_started_at?: string | null
          updated_at?: string
          updated_by?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_timing_records_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_timing_records_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: true
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          actual_service_duration_minutes: number | null
          appointment_id: string
          assigned_assistant_id: string | null
          check_in_at: string | null
          check_in_latitude: number | null
          check_in_longitude: number | null
          check_out_at: string | null
          clinical_summary: string | null
          created_at: string
          followup_due_days: number | null
          followup_notes: string | null
          id: string
          okvet_clinical_record_id: string | null
          organization_id: string
          prescriptions_issued: boolean
          requires_followup: boolean
          samples_collected: boolean
          status: string
          updated_at: string
          veterinarian_id: string
        }
        Insert: {
          actual_service_duration_minutes?: number | null
          appointment_id: string
          assigned_assistant_id?: string | null
          check_in_at?: string | null
          check_in_latitude?: number | null
          check_in_longitude?: number | null
          check_out_at?: string | null
          clinical_summary?: string | null
          created_at?: string
          followup_due_days?: number | null
          followup_notes?: string | null
          id?: string
          okvet_clinical_record_id?: string | null
          organization_id: string
          prescriptions_issued?: boolean
          requires_followup?: boolean
          samples_collected?: boolean
          status?: string
          updated_at?: string
          veterinarian_id: string
        }
        Update: {
          actual_service_duration_minutes?: number | null
          appointment_id?: string
          assigned_assistant_id?: string | null
          check_in_at?: string | null
          check_in_latitude?: number | null
          check_in_longitude?: number | null
          check_out_at?: string | null
          clinical_summary?: string | null
          created_at?: string
          followup_due_days?: number | null
          followup_notes?: string | null
          id?: string
          okvet_clinical_record_id?: string | null
          organization_id?: string
          prescriptions_issued?: boolean
          requires_followup?: boolean
          samples_collected?: boolean
          status?: string
          updated_at?: string
          veterinarian_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "visits_assigned_assistant_id_fkey"
            columns: ["assigned_assistant_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_assigned_assistant_id_fkey"
            columns: ["assigned_assistant_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
          {
            foreignKeyName: "visits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_veterinarian_id_fkey"
            columns: ["veterinarian_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_veterinarian_id_fkey"
            columns: ["veterinarian_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["veterinarian_id"]
          },
        ]
      }
      webhook_delivery_logs: {
        Row: {
          created_at: string
          direction: string
          endpoint_url: string
          headers: Json
          http_status: number | null
          id: string
          ip_address: string | null
          latency_ms: number | null
          payload_summary: Json | null
          verified_hmac: boolean
        }
        Insert: {
          created_at?: string
          direction: string
          endpoint_url: string
          headers?: Json
          http_status?: number | null
          id?: string
          ip_address?: string | null
          latency_ms?: number | null
          payload_summary?: Json | null
          verified_hmac?: boolean
        }
        Update: {
          created_at?: string
          direction?: string
          endpoint_url?: string
          headers?: Json
          http_status?: number | null
          id?: string
          ip_address?: string | null
          latency_ms?: number | null
          payload_summary?: Json | null
          verified_hmac?: boolean
        }
        Relationships: []
      }
      whatsapp_contact_suppressions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          organization_id: string
          owner_id: string | null
          reason: string
          recipient_phone: string
          suppression_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          organization_id: string
          owner_id?: string | null
          reason: string
          recipient_phone: string
          suppression_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string
          owner_id?: string | null
          reason?: string
          recipient_phone?: string
          suppression_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_contact_suppressions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_contact_suppressions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_contact_suppressions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_daily_schedule"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "whatsapp_contact_suppressions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_patient_360"
            referencedColumns: ["primary_owner_id"]
          },
        ]
      }
      whatsapp_conversation_windows: {
        Row: {
          conversation_id: string | null
          created_at: string
          id: string
          is_window_open: boolean
          last_user_message_at: string
          organization_id: string
          recipient_phone: string
          updated_at: string
          window_expires_at: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          is_window_open?: boolean
          last_user_message_at: string
          organization_id: string
          recipient_phone: string
          updated_at?: string
          window_expires_at: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          is_window_open?: boolean
          last_user_message_at?: string
          organization_id?: string
          recipient_phone?: string
          updated_at?: string
          window_expires_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_conversation_windows_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_conversation_windows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_delivery_events: {
        Row: {
          created_at: string
          error_code: string | null
          error_message: string | null
          id: string
          organization_id: string
          provider_message_id: string
          provider_timestamp: string
          raw_payload: Json | null
          reconciled: boolean
          status: string
        }
        Insert: {
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          organization_id: string
          provider_message_id: string
          provider_timestamp: string
          raw_payload?: Json | null
          reconciled?: boolean
          status: string
        }
        Update: {
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          organization_id?: string
          provider_message_id?: string
          provider_timestamp?: string
          raw_payload?: Json | null
          reconciled?: boolean
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_delivery_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_daily_schedule: {
        Row: {
          access_instructions: string | null
          address_line: string | null
          appointment_id: string | null
          appointment_status: string | null
          duration_minutes: number | null
          end_time: string | null
          neighborhood: string | null
          okvet_appointment_id: string | null
          okvet_sync_status: string | null
          organization_id: string | null
          owner_full_name: string | null
          owner_id: string | null
          owner_phone: string | null
          pet_id: string | null
          pet_name: string | null
          pet_species: string | null
          service_category: string | null
          service_name: string | null
          start_time: string | null
          veterinarian_id: string | null
          veterinarian_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_n8n_outbox_queue: {
        Row: {
          aggregate_id: string | null
          aggregate_type: string | null
          causation_id: string | null
          claim_expires_at: string | null
          claimed_at: string | null
          claimed_by: string | null
          correlation_id: string | null
          created_at: string | null
          event_type: string | null
          id: string | null
          idempotency_key: string | null
          max_retries: number | null
          organization_id: string | null
          payload: Json | null
          retry_count: number | null
          schema_version: number | null
          source_system: string | null
        }
        Insert: {
          aggregate_id?: string | null
          aggregate_type?: string | null
          causation_id?: string | null
          claim_expires_at?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          correlation_id?: string | null
          created_at?: string | null
          event_type?: string | null
          id?: string | null
          idempotency_key?: string | null
          max_retries?: number | null
          organization_id?: string | null
          payload?: Json | null
          retry_count?: number | null
          schema_version?: number | null
          source_system?: string | null
        }
        Update: {
          aggregate_id?: string | null
          aggregate_type?: string | null
          causation_id?: string | null
          claim_expires_at?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          correlation_id?: string | null
          created_at?: string | null
          event_type?: string | null
          id?: string | null
          idempotency_key?: string | null
          max_retries?: number | null
          organization_id?: string | null
          payload?: Json | null
          retry_count?: number | null
          schema_version?: number | null
          source_system?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactional_outbox_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_patient_360: {
        Row: {
          birth_date: string | null
          breed: string | null
          created_at: string | null
          is_in_bereavement: boolean | null
          is_temperament_warning: boolean | null
          is_vip: boolean | null
          organization_id: string | null
          owner_name: string | null
          pending_preventives: Json | null
          pet_id: string | null
          pet_name: string | null
          pet_status: string | null
          primary_owner_id: string | null
          primary_phone: string | null
          sex: string | null
          species: string | null
          suppress_marketing_until: string | null
          temperament: string | null
          weight_kg: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_commitment_assignment: {
        Args: { p_commitment_id: string; p_staff_id: string }
        Returns: Json
      }
      accept_operational_task: {
        Args: { p_task_id: string; p_user_id: string }
        Returns: Json
      }
      accept_quote: {
        Args: { p_owner_id: string; p_quote_id: string; p_version: number }
        Returns: Json
      }
      acquire_calendar_sync_lease: {
        Args: {
          p_connection_id: string
          p_duration_seconds?: number
          p_lease_holder: string
          p_org_id: string
        }
        Returns: boolean
      }
      activate_maintenance_window: {
        Args: { p_window_id: string }
        Returns: Json
      }
      approve_action_proposal: {
        Args: { p_approver_id: string; p_notes?: string; p_proposal_id: string }
        Returns: Json
      }
      approve_document_version: {
        Args: {
          p_approval_type?: string
          p_approver_id: string
          p_notes?: string
          p_version_id: string
        }
        Returns: Json
      }
      approve_quote_discount: {
        Args: {
          p_approver_id: string
          p_notes?: string
          p_quote_id: string
          p_version: number
        }
        Returns: Json
      }
      approve_reconciliation_repair: {
        Args: {
          p_approver_id: string
          p_decision: string
          p_org_id: string
          p_proposal_id: string
          p_reason: string
        }
        Returns: Json
      }
      approve_specialist_referral: {
        Args: {
          p_approval_notes?: string
          p_approving_vet_id: string
          p_referral_id: string
        }
        Returns: Json
      }
      assign_or_delegate_commitment: {
        Args: {
          p_actor_id: string
          p_commitment_id: string
          p_is_founder_absence: boolean
          p_new_staff_id: string
          p_reason: string
          p_role: string
        }
        Returns: Json
      }
      assign_recovery_owner: {
        Args: {
          p_assigned_by: string
          p_case_id: string
          p_role: string
          p_user_id: string
        }
        Returns: boolean
      }
      authorize_ai_resume: {
        Args: {
          p_authorizing_user_id: string
          p_conversation_id: string
          p_reason?: string
        }
        Returns: Json
      }
      authorize_daily_report_delivery: {
        Args: {
          p_authorized_by: string
          p_channel?: string
          p_report_id: string
        }
        Returns: Json
      }
      authorize_document_recipient: {
        Args: {
          p_actor_id: string
          p_document_id: string
          p_recipient_id: string
          p_recipient_type: string
          p_valid_hours?: number
        }
        Returns: Json
      }
      cancel_appointment_authorized: {
        Args: {
          p_actor_role?: string
          p_appointment_id: string
          p_cancelled_by: string
          p_reason: string
        }
        Returns: Json
      }
      cancel_obsolete_outbound_request: {
        Args: { p_reason?: string; p_request_id: string }
        Returns: Json
      }
      check_external_heartbeats: {
        Args: { p_max_staleness_seconds?: number; p_organization_id: string }
        Returns: Json
      }
      claim_and_accept_handoff: {
        Args: { p_agent_user_id: string; p_handoff_id: string }
        Returns: Json
      }
      claim_authorized_outbound_message: {
        Args: { p_request_id: string; p_worker_id?: string }
        Returns: Json
      }
      claim_daily_report_generation: {
        Args: { p_org_id: string; p_report_date: string; p_user_id?: string }
        Returns: Json
      }
      claim_outbox_events: {
        Args: {
          p_batch_size?: number
          p_lease_seconds?: number
          p_worker_id: string
        }
        Returns: {
          aggregate_id: string
          aggregate_type: string
          causation_id: string
          correlation_id: string
          event_id: string
          event_type: string
          idempotency_key: string
          occurred_at: string
          organization_id: string
          payload: Json
          retry_count: number
          schema_version: number
          source_system: string
        }[]
      }
      claim_reconciliation_run: {
        Args: {
          p_mode: string
          p_org_id: string
          p_scope: string
          p_worker_id: string
        }
        Returns: Json
      }
      claim_retryable_incidents: {
        Args: { p_batch_size?: number; p_worker_id: string }
        Returns: {
          attempt_number: number
          correlation_id: string
          error_category: string
          idempotency_key: string
          incident_id: string
          max_attempts: number
          organization_id: string
          source_workflow_id: string
          source_workflow_name: string
        }[]
      }
      claim_weekly_report_generation: {
        Args: { p_organization_id: string; p_week_label: string }
        Returns: Json
      }
      classify_feedback_candidate: {
        Args: {
          p_confidence: number
          p_feedback_id: string
          p_label: string
          p_rationale: string
        }
        Returns: string
      }
      classify_reconciliation_discrepancy: {
        Args: {
          p_auth_sys: string
          p_disc_type: string
          p_entity_type: string
          p_expl: string
          p_ext_ref: string
          p_ext_val?: Json
          p_internal_id: string
          p_local_val?: Json
          p_org_id: string
          p_run_id: string
          p_severity: string
          p_src_sys: string
          p_tgt_sys: string
        }
        Returns: Json
      }
      close_maintenance_window: {
        Args: { p_status?: string; p_window_id: string }
        Returns: Json
      }
      close_post_visit_continuity_verified: {
        Args: {
          p_actor_id: string
          p_case_id: string
          p_exception_reason?: string
          p_is_exceptional?: boolean
        }
        Returns: Json
      }
      close_recovery_case: {
        Args: { p_case_id: string; p_summary: string; p_user_id: string }
        Returns: boolean
      }
      close_specialist_referral_verified: {
        Args: {
          p_closed_by: string
          p_closure_reason?: string
          p_closure_status?: string
          p_referral_id: string
        }
        Returns: Json
      }
      complete_outbox_event: {
        Args: { p_event_id: string; p_result?: Json }
        Returns: boolean
      }
      confirm_appointment_reschedule_okvet: {
        Args: {
          p_okvet_reference: string
          p_proposal_id: string
          p_verified_by: string
        }
        Returns: Json
      }
      confirm_external_specialist_booking: {
        Args: {
          p_clinic_name: string
          p_confirmed_by: string
          p_confirmed_time: string
          p_evidence_details?: string
          p_evidence_type: string
          p_external_ref: string
          p_referral_id: string
        }
        Returns: Json
      }
      create_appointment_hold: {
        Args: {
          p_end_at: string
          p_org_id: string
          p_staff_profile_id: string
          p_start_at: string
          p_ttl_minutes?: number
        }
        Returns: Json
      }
      create_daily_report_version: {
        Args: {
          p_narrative: string
          p_narrative_status: string
          p_quick_brief: string
          p_snapshot_id: string
        }
        Returns: Json
      }
      create_feedback_record: {
        Args: {
          p_category: string
          p_customer_id: string
          p_org_id: string
          p_pet_id: string
          p_sentiment: string
          p_text: string
          p_visit_id: string
        }
        Returns: string
      }
      create_neutral_review_invitation: {
        Args: {
          p_customer_id: string
          p_idempotency_key: string
          p_org_id: string
          p_pet_id: string
          p_visit_id: string
        }
        Returns: string
      }
      create_operational_task: {
        Args: {
          p_assigned_user_id?: string
          p_description?: string
          p_due_at: string
          p_idempotency_key?: string
          p_is_clinically_sensitive?: boolean
          p_org_id: string
          p_owner_client_id?: string
          p_owner_team?: string
          p_pet_id?: string
          p_priority?: string
          p_requires_evidence?: boolean
          p_source_entity_id?: string
          p_source_entity_type?: string
          p_source_system?: string
          p_task_type: string
          p_title: string
        }
        Returns: Json
      }
      create_or_init_post_visit_case: {
        Args: { p_organization_id: string; p_visit_id: string }
        Returns: Json
      }
      create_or_version_quote: {
        Args: {
          p_appointment_id: string
          p_created_by?: string
          p_items: Json
          p_owner_id: string
          p_pet_id: string
          p_quote_id: string
          p_valid_days?: number
        }
        Returns: Json
      }
      create_payment_request: {
        Args: {
          p_amount: number
          p_appointment_id: string
          p_due_hours?: number
          p_idempotency_key?: string
          p_owner_id: string
          p_pet_id: string
          p_quote_id: string
        }
        Returns: Json
      }
      create_post_visit_commitment: {
        Args: { p_actor_id: string; p_commitment_payload: Json }
        Returns: Json
      }
      create_quality_improvement_proposal: {
        Args: {
          p_cluster: string
          p_core_module: string
          p_org_id: string
          p_proposal: string
          p_team: string
        }
        Returns: string
      }
      create_recovery_case: {
        Args: {
          p_category: string
          p_customer_id: string
          p_desc: string
          p_feedback_id: string
          p_idempotency_key: string
          p_org_id: string
          p_pet_id: string
          p_priority: string
          p_visit_id: string
        }
        Returns: string
      }
      create_schedule_simulation: {
        Args: {
          p_created_by: string
          p_end_date: string
          p_name: string
          p_objective: string
          p_organization_id: string
          p_scenario_payload?: Json
          p_start_date: string
        }
        Returns: Json
      }
      create_specialist_referral: {
        Args: {
          p_clinical_indication: string
          p_notes?: string
          p_organization_id: string
          p_owner_id: string
          p_pet_id: string
          p_priority?: string
          p_specialty_code: string
          p_vet_id: string
        }
        Returns: string
      }
      current_user_role: {
        Args: { p_org_id: string }
        Returns: Database["public"]["Enums"]["app_role_type"]
      }
      detect_calendar_conflicts: {
        Args: {
          p_connection_id: string
          p_end_at: string
          p_org_id: string
          p_staff_profile_id: string
          p_start_at: string
        }
        Returns: Json
      }
      disconnect_calendar_connection: {
        Args: { p_connection_id: string; p_org_id: string; p_reason?: string }
        Returns: undefined
      }
      escalate_incident_to_dead_letter: {
        Args: { p_incident_id: string; p_reason: string }
        Returns: boolean
      }
      escalate_overdue_tasks: {
        Args: { p_limit?: number; p_org_id?: string }
        Returns: Json
      }
      evaluate_action_risk: {
        Args: { p_action_type: string; p_payload?: Json }
        Returns: string
      }
      evaluate_financial_reminder_eligibility: {
        Args: { p_owner_id: string; p_payment_request_id: string }
        Returns: Json
      }
      evaluate_followup_eligibility: {
        Args: { p_visit_id: string }
        Returns: Json
      }
      evaluate_review_invitation_eligibility: {
        Args: { p_customer_id: string; p_pet_id: string }
        Returns: Json
      }
      execute_approved_action: {
        Args: { p_executor_id: string; p_proposal_id: string }
        Returns: Json
      }
      execute_authorized_safe_repair: {
        Args: { p_executor?: string; p_org_id: string; p_proposal_id: string }
        Returns: Json
      }
      expire_stale_appointment_holds: {
        Args: { p_org_id?: string }
        Returns: number
      }
      expire_unaccepted_handoffs: { Args: never; Returns: Json }
      fail_outbox_event: {
        Args: { p_error: string; p_event_id: string; p_is_retryable?: boolean }
        Returns: boolean
      }
      finalize_document_upload: {
        Args: {
          p_actor_id?: string
          p_detected_type: string
          p_sha256_digest: string
          p_version_id: string
        }
        Returns: Json
      }
      generate_and_dispatch_client_offer: {
        Args: {
          p_expiry_hours?: number
          p_option_ids: string[]
          p_referral_id: string
        }
        Returns: Json
      }
      generate_appointment_notification_plan: {
        Args: { p_appointment_id: string; p_org_id?: string }
        Returns: Json
      }
      get_authorized_handoff_context: {
        Args: { p_conversation_id: string }
        Returns: Json
      }
      get_backup_and_maintenance_status: {
        Args: { p_organization_id: string }
        Returns: Json
      }
      get_business_snapshot: {
        Args: {
          p_date?: string
          p_filters?: Json
          p_organization_id: string
          p_requested_by: string
        }
        Returns: Json
      }
      get_conversation_context: {
        Args: { p_conversation_id: string }
        Returns: Json
      }
      get_daily_appointment_metrics: {
        Args: { p_org_id: string; p_report_date: string }
        Returns: Json
      }
      get_daily_continuity_metrics: {
        Args: { p_org_id: string; p_report_date: string }
        Returns: Json
      }
      get_daily_experience_metrics: {
        Args: { p_org_id: string; p_report_date: string }
        Returns: Json
      }
      get_daily_financial_metrics: {
        Args: { p_org_id: string; p_report_date: string }
        Returns: Json
      }
      get_daily_integration_metrics: {
        Args: { p_org_id: string }
        Returns: Json
      }
      get_daily_operations: {
        Args: { p_date?: string; p_organization_id: string }
        Returns: Json
      }
      get_daily_route_metrics: {
        Args: { p_org_id: string; p_report_date: string }
        Returns: Json
      }
      get_daily_staff_metrics: {
        Args: { p_org_id: string; p_report_date: string }
        Returns: Json
      }
      get_daily_visit_metrics: {
        Args: { p_org_id: string; p_report_date: string }
        Returns: Json
      }
      get_financial_summary: {
        Args: {
          p_end_date: string
          p_organization_id: string
          p_start_date: string
        }
        Returns: Json
      }
      get_system_health_summary: {
        Args: { p_organization_id: string }
        Returns: Json
      }
      get_weekly_capacity_metrics: {
        Args: {
          p_end_at: string
          p_organization_id: string
          p_start_at: string
        }
        Returns: Json
      }
      get_weekly_financial_metrics: {
        Args: {
          p_end_at: string
          p_organization_id: string
          p_source_available?: boolean
          p_start_at: string
        }
        Returns: Json
      }
      get_weekly_operation_metrics: {
        Args: {
          p_end_at: string
          p_organization_id: string
          p_start_at: string
        }
        Returns: Json
      }
      grant_external_document_access: {
        Args: {
          p_document_id: string
          p_granted_by: string
          p_referral_id: string
          p_specialist_id: string
          p_valid_hours?: number
        }
        Returns: Json
      }
      handle_calendar_410_invalidation: {
        Args: { p_connection_id: string; p_org_id: string }
        Returns: undefined
      }
      ingest_calendar_busy_slot: {
        Args: {
          p_block_type?: string
          p_connection_id: string
          p_end_at: string
          p_org_id: string
          p_staff_profile_id: string
          p_start_at: string
        }
        Returns: string
      }
      ingest_location_observation: {
        Args: {
          p_accuracy_meters: number
          p_heading_degrees?: number
          p_latitude: number
          p_longitude: number
          p_session_id: string
          p_source?: string
          p_speed_mps?: number
        }
        Returns: Json
      }
      ingest_whatsapp_inbound_message: {
        Args: { p_payload: Json }
        Returns: Json
      }
      is_org_admin: { Args: { p_org_id: string }; Returns: boolean }
      is_org_member: { Args: { p_org_id: string }; Returns: boolean }
      is_org_staff: { Args: { p_org_id: string }; Returns: boolean }
      issue_customer_tracking_token: {
        Args: { p_appointment_id: string; p_duration_hours?: number }
        Returns: Json
      }
      match_external_identity: {
        Args: {
          p_confidence?: string
          p_entity_type: string
          p_ext_id: string
          p_ext_system: string
          p_internal_id: string
          p_org_id: string
        }
        Returns: Json
      }
      persist_daily_snapshot: {
        Args: {
          p_created_by?: string
          p_metrics: Json
          p_org_id: string
          p_quality_status?: string
          p_report_date: string
        }
        Returns: Json
      }
      process_due_appointment_notification_jobs: {
        Args: { p_batch_size?: number }
        Returns: Json
      }
      process_whatsapp_delivery_status: {
        Args: {
          p_error_details?: Json
          p_provider_message_id: string
          p_provider_timestamp?: string
          p_status: string
        }
        Returns: Json
      }
      propose_appointment_reschedule: {
        Args: {
          p_actor_type?: string
          p_appointment_id: string
          p_proposed_end: string
          p_proposed_start: string
          p_proposed_vet_id: string
          p_reason: string
          p_requested_by: string
        }
        Returns: Json
      }
      propose_safe_repair: {
        Args: {
          p_action: string
          p_approver_role?: string
          p_discrepancy_id: string
          p_org_id: string
          p_payload?: Json
          p_repair_type: string
          p_requires_approval?: boolean
        }
        Returns: Json
      }
      publish_operational_calendar_event: {
        Args: {
          p_appointment_id: string
          p_connection_id: string
          p_google_cal_id: string
          p_google_evt_id: string
          p_hash: string
          p_org_id: string
        }
        Returns: string
      }
      reassign_or_delegate_task: {
        Args: {
          p_assignment_type?: string
          p_new_user_id: string
          p_reason: string
          p_reassigned_by: string
          p_task_id: string
        }
        Returns: Json
      }
      reconcile_and_allocate_payment: {
        Args: {
          p_bank_ref: string
          p_notes?: string
          p_payment_request_id: string
          p_staff_id: string
          p_transaction_id: string
        }
        Returns: Json
      }
      record_and_review_specialist_report: {
        Args: {
          p_clinical_assessment: string
          p_continuity_plan?: string
          p_referral_id: string
          p_report_url: string
          p_review_outcome?: string
          p_reviewing_vet_id: string
        }
        Returns: Json
      }
      record_appointment_no_show_or_uncompleted: {
        Args: {
          p_appointment_id: string
          p_incident_type: string
          p_notes: string
          p_reported_by: string
        }
        Returns: Json
      }
      record_backup_execution: { Args: { p_backup: Json }; Returns: string }
      record_calendar_audit: {
        Args: {
          p_action: string
          p_actor?: string
          p_connection_id: string
          p_details: Json
          p_org_id: string
        }
        Returns: string
      }
      record_client_slot_selection: {
        Args: {
          p_offer_id: string
          p_selected_by_user_id?: string
          p_selected_item_id: string
        }
        Returns: Json
      }
      record_daily_report_audit: {
        Args: {
          p_action: string
          p_actor_id?: string
          p_details?: Json
          p_entity_id?: string
          p_org_id: string
        }
        Returns: undefined
      }
      record_daily_report_exception: {
        Args: {
          p_action?: string
          p_category: string
          p_desc: string
          p_role?: string
          p_severity: string
          p_snapshot_id: string
          p_title: string
        }
        Returns: Json
      }
      record_experience_audit: {
        Args: {
          p_action: string
          p_actor_id: string
          p_actor_type: string
          p_details: Json
          p_entity_id: string
          p_entity_type: string
          p_org_id: string
        }
        Returns: string
      }
      record_human_response: {
        Args: {
          p_agent_user_id: string
          p_conversation_id: string
          p_message_text: string
        }
        Returns: Json
      }
      record_monitoring_cycle: { Args: { p_cycle: Json }; Returns: string }
      record_post_visit_checklist: {
        Args: {
          p_actor_id: string
          p_case_id: string
          p_checklist_payload: Json
          p_service_type: string
        }
        Returns: Json
      }
      record_post_visit_operational_close: {
        Args: { p_actor_id: string; p_case_id: string; p_notes: string }
        Returns: Json
      }
      record_probe_result: { Args: { p_probe: Json }; Returns: string }
      record_provider_send_result: {
        Args: {
          p_http_status: number
          p_is_uncertain?: boolean
          p_provider_message_id: string
          p_raw_response: Json
          p_request_id: string
        }
        Returns: Json
      }
      record_reconciliation_audit: {
        Args: {
          p_actor?: string
          p_details?: Json
          p_entity_id: string
          p_entity_type: string
          p_event: string
          p_org_id: string
        }
        Returns: string
      }
      record_recovery_action: {
        Args: {
          p_action_type: string
          p_case_id: string
          p_details: string
          p_evidence: string
          p_performer_id: string
        }
        Returns: string
      }
      record_service_heartbeat: { Args: { p_heartbeat: Json }; Returns: string }
      record_specialist_availability_response: {
        Args: {
          p_channel?: string
          p_recorded_by?: string
          p_referral_id: string
          p_slots: Json
          p_specialist_id: string
          p_validity_hours?: number
        }
        Returns: Json
      }
      record_testimonial_consent: {
        Args: {
          p_allow_customer: boolean
          p_allow_pet: boolean
          p_allow_photo: boolean
          p_channels: Json
          p_customer_id: string
          p_org_id: string
          p_pet_id: string
        }
        Returns: string
      }
      record_visit_timing_event: {
        Args: {
          p_estimated_finish_at?: string
          p_event_timestamp: string
          p_event_type: string
          p_performed_by?: string
          p_visit_id: string
        }
        Returns: Json
      }
      record_weekly_report_audit: {
        Args: {
          p_event_name: string
          p_metadata?: Json
          p_organization_id: string
          p_report_version_id: string
        }
        Returns: string
      }
      register_calendar_connection: {
        Args: {
          p_account_email?: string
          p_calendar_id: string
          p_calendar_name?: string
          p_org_id: string
          p_permission_mode: string
          p_provider: string
          p_staff_profile_id: string
        }
        Returns: string
      }
      register_experience_response: {
        Args: {
          p_channel: string
          p_customer_id: string
          p_followup_id: string
          p_idempotency_key: string
          p_org_id: string
          p_pet_id: string
          p_raw_text: string
        }
        Returns: string
      }
      register_or_update_incident: {
        Args: { p_incident: Json }
        Returns: string
      }
      register_provider_payment_event: {
        Args: {
          p_amount: number
          p_currency: string
          p_external_tx_id: string
          p_fee: number
          p_payload: Json
          p_payment_request_id: string
          p_provider: string
          p_signature_ok: boolean
          p_status: string
        }
        Returns: Json
      }
      reject_document_version: {
        Args: { p_approver_id: string; p_reason: string; p_version_id: string }
        Returns: Json
      }
      release_calendar_sync_lease: {
        Args: { p_connection_id: string; p_lease_holder: string }
        Returns: boolean
      }
      reopen_recovery_case: {
        Args: { p_case_id: string; p_reason: string; p_user_id: string }
        Returns: boolean
      }
      report_and_verify_commitment: {
        Args: {
          p_actor_id: string
          p_commitment_id: string
          p_evidence: string
          p_is_verified: boolean
        }
        Returns: Json
      }
      report_bank_transfer: {
        Args: {
          p_amount: number
          p_bank_name: string
          p_owner_id: string
          p_payment_request_id: string
          p_reference: string
          p_screenshot_path?: string
        }
        Returns: Json
      }
      report_task_completion: {
        Args: {
          p_completed_by: string
          p_evidence_ref?: string
          p_evidence_type?: string
          p_notes?: string
          p_task_id: string
        }
        Returns: Json
      }
      request_action_proposal: {
        Args: {
          p_action_type: string
          p_assistant_code: string
          p_organization_id: string
          p_payload: Json
          p_reasoning: string
          p_requested_by: string
          p_target_entity_id: string
          p_target_entity_type: string
        }
        Returns: Json
      }
      request_and_approve_refund: {
        Args: {
          p_amount: number
          p_approved_by?: string
          p_owner_id: string
          p_payment_request_id: string
          p_reason: string
          p_requested_by: string
          p_transaction_id: string
        }
        Returns: Json
      }
      request_clinical_handoff: {
        Args: {
          p_customer_id: string
          p_feedback_id: string
          p_is_urgent: boolean
          p_notes: string
          p_pet_id: string
        }
        Returns: boolean
      }
      request_document_delivery: {
        Args: {
          p_delivery_channel: string
          p_idempotency_key: string
          p_purpose: string
          p_recipient_id: string
          p_recipient_type: string
          p_valid_hours?: number
          p_version_id: string
        }
        Returns: Json
      }
      request_document_upload: {
        Args: {
          p_correlation_id?: string
          p_created_by?: string
          p_customer_id: string
          p_declared_mime: string
          p_document_type: string
          p_file_name: string
          p_file_size: number
          p_organization_id: string
          p_pet_id: string
          p_referral_id?: string
          p_visit_id?: string
        }
        Returns: Json
      }
      request_human_handoff: {
        Args: {
          p_conversation_id: string
          p_priority?: string
          p_reason: string
          p_role?: string
          p_summary?: string
          p_team?: string
        }
        Returns: Json
      }
      resolve_incident: {
        Args: {
          p_evidence?: Json
          p_incident_id: string
          p_resolution_type: string
          p_resolver_user_id?: string
        }
        Returns: boolean
      }
      resolve_weekly_period: {
        Args: { p_ref_date?: string; p_timezone?: string }
        Returns: Json
      }
      revoke_document_access: {
        Args: {
          p_document_id: string
          p_reason: string
          p_recipient_id: string
          p_revoked_by: string
        }
        Returns: Json
      }
      revoke_testimonial_consent: {
        Args: { p_consent_id: string; p_user_id: string }
        Returns: boolean
      }
      schedule_experience_followup: {
        Args: {
          p_category: string
          p_customer_id: string
          p_idempotency_key: string
          p_org_id: string
          p_pet_id: string
          p_visit_id: string
        }
        Returns: string
      }
      schedule_incident_retry: {
        Args: { p_delay_seconds: number; p_incident_id: string }
        Returns: boolean
      }
      schedule_maintenance_window: { Args: { p_window: Json }; Returns: string }
      set_conversation_bot_lock: {
        Args: {
          p_conversation_id: string
          p_locked: boolean
          p_reason?: string
        }
        Returns: Json
      }
      snooze_operational_task: {
        Args: {
          p_reason: string
          p_snooze_until: string
          p_snoozed_by: string
          p_task_id: string
        }
        Returns: Json
      }
      snooze_post_visit_commitment: {
        Args: {
          p_actor_id: string
          p_commitment_id: string
          p_new_due_at: string
          p_reason: string
        }
        Returns: Json
      }
      start_tracking_session: {
        Args: {
          p_device_id: string
          p_duration_hours?: number
          p_organization_id: string
          p_purpose: string
          p_route_id?: string
          p_staff_id: string
          p_visit_id?: string
        }
        Returns: Json
      }
      stop_tracking_session: {
        Args: { p_reason?: string; p_session_id: string }
        Returns: Json
      }
      submit_okvet_human_confirmation: {
        Args: {
          p_appointment_id: string
          p_confirmed_by: string
          p_notes?: string
          p_okvet_reference: string
          p_org_id: string
        }
        Returns: Json
      }
      supersede_document_version: {
        Args: {
          p_actor_id: string
          p_new_version_id: string
          p_old_version_id: string
          p_reason: string
        }
        Returns: Json
      }
      suppress_experience_followup: {
        Args: { p_followup_id: string; p_reason: string }
        Returns: boolean
      }
      update_calendar_sync_state: {
        Args: {
          p_connection_id: string
          p_error_msg?: string
          p_events_synced?: number
          p_next_sync_token?: string
          p_status: string
        }
        Returns: undefined
      }
      update_system_health_snapshot: {
        Args: { p_snapshot: Json }
        Returns: Json
      }
      update_whatsapp_conversation_window: {
        Args: {
          p_conversation_id?: string
          p_message_received_at?: string
          p_organization_id: string
          p_recipient_phone: string
        }
        Returns: Json
      }
      validate_customer_tracking_view: {
        Args: { p_token: string }
        Returns: Json
      }
      validate_document_access: {
        Args: {
          p_access_token: string
          p_actor_id?: string
          p_ip_masked?: string
        }
        Returns: Json
      }
      verify_and_close_task: {
        Args: {
          p_is_approved?: boolean
          p_rejection_reason?: string
          p_task_id: string
          p_verified_by: string
        }
        Returns: Json
      }
      verify_and_confirm_appointment_okvet: {
        Args: {
          p_appointment_id: string
          p_notes?: string
          p_okvet_reference: string
          p_verified_by: string
        }
        Returns: Json
      }
      verify_backup_restorability: {
        Args: { p_verification: Json }
        Returns: Json
      }
      verify_outbound_permission: {
        Args: {
          p_conversation_id: string
          p_draft_version?: number
          p_sender_type: string
        }
        Returns: Json
      }
      verify_reconciliation_result: {
        Args: {
          p_discrepancy_id: string
          p_execution_id: string
          p_is_clean: boolean
          p_notes: string
          p_org_id: string
        }
        Returns: Json
      }
      verify_recovery_outcome: {
        Args: {
          p_case_id: string
          p_customer_confirmed: boolean
          p_outcome_type: string
          p_summary: string
          p_verifier_id: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role_type:
        | "OWNER_CLIENT"
        | "CAREGIVER"
        | "VETERINARIAN"
        | "VET_ASSISTANT"
        | "COORDINATOR"
        | "RECEPTION"
        | "FINANCE"
        | "ADMINISTRATOR"
        | "DIRECTOR"
        | "TECH_SUPPORT"
        | "ALPHA_CONSULTANT"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role_type: [
        "OWNER_CLIENT",
        "CAREGIVER",
        "VETERINARIAN",
        "VET_ASSISTANT",
        "COORDINATOR",
        "RECEPTION",
        "FINANCE",
        "ADMINISTRATOR",
        "DIRECTOR",
        "TECH_SUPPORT",
        "ALPHA_CONSULTANT",
      ],
    },
  },
} as const
