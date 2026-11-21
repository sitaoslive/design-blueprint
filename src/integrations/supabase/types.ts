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
      absence_plans: {
        Row: {
          active: boolean
          coordinator: string
          created_at: string
          created_by: string | null
          date_from: string
          date_to: string
          id: string
          limits: string
          replacements: string[]
        }
        Insert: {
          active?: boolean
          coordinator: string
          created_at?: string
          created_by?: string | null
          date_from: string
          date_to: string
          id?: string
          limits?: string
          replacements: string[]
        }
        Update: {
          active?: boolean
          coordinator?: string
          created_at?: string
          created_by?: string | null
          date_from?: string
          date_to?: string
          id?: string
          limits?: string
          replacements?: string[]
        }
        Relationships: []
      }
      approvals: {
        Row: {
          decided_at: string | null
          decided_by: string | null
          detail: string
          id: string
          kind: string
          status: string
          title: string
        }
        Insert: {
          decided_at?: string | null
          decided_by?: string | null
          detail?: string
          id?: string
          kind: string
          status?: string
          title: string
        }
        Update: {
          decided_at?: string | null
          decided_by?: string | null
          detail?: string
          id?: string
          kind?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      assistant_messages: {
        Row: {
          created_at: string
          id: string
          proposal: Json | null
          sender: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          proposal?: Json | null
          sender: string
          text: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          proposal?: Json | null
          sender?: string
          text?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor: string | null
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      client_settings: {
        Row: {
          addresses: Json
          consents: Json
          preferences: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          addresses?: Json
          consents?: Json
          preferences?: Json
          updated_at?: string
          user_id?: string
        }
        Update: {
          addresses?: Json
          consents?: Json
          preferences?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      communication_suppressions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          phone: string
          reason: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          phone: string
          reason?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          phone?: string
          reason?: string
        }
        Relationships: []
      }
      conversation_events: {
        Row: {
          actor: string | null
          conversation_id: string
          created_at: string
          detail: string
          id: string
          kind: string
        }
        Insert: {
          actor?: string | null
          conversation_id: string
          created_at?: string
          detail?: string
          id?: string
          kind: string
        }
        Update: {
          actor?: string | null
          conversation_id?: string
          created_at?: string
          detail?: string
          id?: string
          kind?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_events_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_messages: {
        Row: {
          attachment_path: string | null
          body: string
          conversation_id: string
          created_at: string
          created_by: string | null
          delivery_status: string
          direction: string
          id: string
          idempotency_key: string | null
          intents: string[]
          provider_message_id: string | null
          sender: string
        }
        Insert: {
          attachment_path?: string | null
          body: string
          conversation_id: string
          created_at?: string
          created_by?: string | null
          delivery_status?: string
          direction: string
          id?: string
          idempotency_key?: string | null
          intents?: string[]
          provider_message_id?: string | null
          sender: string
        }
        Update: {
          attachment_path?: string | null
          body?: string
          conversation_id?: string
          created_at?: string
          created_by?: string | null
          delivery_status?: string
          direction?: string
          id?: string
          idempotency_key?: string | null
          intents?: string[]
          provider_message_id?: string | null
          sender?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assigned_user_id: string | null
          channel: string
          closed_at: string | null
          contact_name: string
          contact_phone: string
          control_mode: string
          created_at: string
          id: string
          last_human_response_at: string | null
          last_inbound_at: string | null
          last_message_at: string
          owner_id: string | null
          pet_id: string | null
          priority: string
          sensitive: boolean
          status: string
          synthetic: boolean
          verified: boolean
          version: number
        }
        Insert: {
          assigned_user_id?: string | null
          channel?: string
          closed_at?: string | null
          contact_name: string
          contact_phone: string
          control_mode?: string
          created_at?: string
          id?: string
          last_human_response_at?: string | null
          last_inbound_at?: string | null
          last_message_at?: string
          owner_id?: string | null
          pet_id?: string | null
          priority?: string
          sensitive?: boolean
          status?: string
          synthetic?: boolean
          verified?: boolean
          version?: number
        }
        Update: {
          assigned_user_id?: string | null
          channel?: string
          closed_at?: string | null
          contact_name?: string
          contact_phone?: string
          control_mode?: string
          created_at?: string
          id?: string
          last_human_response_at?: string | null
          last_inbound_at?: string | null
          last_message_at?: string
          owner_id?: string | null
          pet_id?: string | null
          priority?: string
          sensitive?: boolean
          status?: string
          synthetic?: boolean
          verified?: boolean
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "conversations_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          body: string
          course_id: string
          id: string
          position: number
          title: string
        }
        Insert: {
          body?: string
          course_id: string
          id?: string
          position?: number
          title: string
        }
        Update: {
          body?: string
          course_id?: string
          id?: string
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          id: string
          progress: number
          required: boolean
          reviewed: string
          role: string
          title: string
        }
        Insert: {
          id?: string
          progress?: number
          required?: boolean
          reviewed?: string
          role?: string
          title: string
        }
        Update: {
          id?: string
          progress?: number
          required?: boolean
          reviewed?: string
          role?: string
          title?: string
        }
        Relationships: []
      }
      customer_memory: {
        Row: {
          author: string | null
          client_id: string
          consent: string | null
          content: string
          created_at: string
          id: string
          kind: string
          last_confirmed_at: string | null
          pet_id: string | null
          sensitivity: string
          source: string
          valid_until: string | null
          validation: string
        }
        Insert: {
          author?: string | null
          client_id: string
          consent?: string | null
          content: string
          created_at?: string
          id?: string
          kind?: string
          last_confirmed_at?: string | null
          pet_id?: string | null
          sensitivity?: string
          source?: string
          valid_until?: string | null
          validation?: string
        }
        Update: {
          author?: string | null
          client_id?: string
          consent?: string | null
          content?: string
          created_at?: string
          id?: string
          kind?: string
          last_confirmed_at?: string | null
          pet_id?: string | null
          sensitivity?: string
          source?: string
          valid_until?: string | null
          validation?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_memory_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      event_outbox: {
        Row: {
          actor_id: string | null
          attempt_count: number
          causation_id: string | null
          correlation_id: string
          entity_id: string | null
          event_id: string
          event_type: string
          idempotency_key: string
          occurred_at: string
          organization_id: string
          payload: Json
          schema_version: number
          status: string
        }
        Insert: {
          actor_id?: string | null
          attempt_count?: number
          causation_id?: string | null
          correlation_id?: string
          entity_id?: string | null
          event_id?: string
          event_type: string
          idempotency_key: string
          occurred_at?: string
          organization_id?: string
          payload?: Json
          schema_version?: number
          status?: string
        }
        Update: {
          actor_id?: string | null
          attempt_count?: number
          causation_id?: string | null
          correlation_id?: string
          entity_id?: string | null
          event_id?: string
          event_type?: string
          idempotency_key?: string
          occurred_at?: string
          organization_id?: string
          payload?: Json
          schema_version?: number
          status?: string
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          enabled: boolean
          key: string
          label: string
          requires_integration: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          enabled?: boolean
          key: string
          label: string
          requires_integration?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          enabled?: boolean
          key?: string
          label?: string
          requires_integration?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      field_files: {
        Row: {
          created_at: string
          mime: string
          name: string
          path: string
          size_bytes: number
          task_id: string | null
          to_staff: string | null
          user_id: string
          visit_id: string | null
        }
        Insert: {
          created_at?: string
          mime: string
          name: string
          path: string
          size_bytes: number
          task_id?: string | null
          to_staff?: string | null
          user_id?: string
          visit_id?: string | null
        }
        Update: {
          created_at?: string
          mime?: string
          name?: string
          path?: string
          size_bytes?: number
          task_id?: string | null
          to_staff?: string | null
          user_id?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "field_files_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_files_to_staff_fkey"
            columns: ["to_staff"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_files_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      field_kits: {
        Row: {
          active: boolean
          description: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          description?: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          description?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      incidents: {
        Row: {
          assignee_staff: string | null
          created_at: string
          created_by: string | null
          detail: string
          id: string
          owner: string
          severity: string
          status: string
          title: string
        }
        Insert: {
          assignee_staff?: string | null
          created_at?: string
          created_by?: string | null
          detail?: string
          id?: string
          owner?: string
          severity?: string
          status?: string
          title: string
        }
        Update: {
          assignee_staff?: string | null
          created_at?: string
          created_by?: string | null
          detail?: string
          id?: string
          owner?: string
          severity?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_assignee_staff_fkey"
            columns: ["assignee_staff"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          id: string
          name: string
          note: string
          purpose: string
          status: string
        }
        Insert: {
          id: string
          name: string
          note?: string
          purpose: string
          status?: string
        }
        Update: {
          id?: string
          name?: string
          note?: string
          purpose?: string
          status?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          expires: string
          id: string
          lot: string
          min: number
          name: string
          stock: number
        }
        Insert: {
          expires?: string
          id?: string
          lot?: string
          min?: number
          name: string
          stock?: number
        }
        Update: {
          expires?: string
          id?: string
          lot?: string
          min?: number
          name?: string
          stock?: number
        }
        Relationships: []
      }
      inventory_reservations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          idempotency_key: string
          item_id: string
          qty: number
          status: string
          updated_at: string
          visit_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          idempotency_key: string
          item_id: string
          qty: number
          status?: string
          updated_at?: string
          visit_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          idempotency_key?: string
          item_id?: string
          qty?: number
          status?: string
          updated_at?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_reservations_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_reservations_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      kit_assignments: {
        Row: {
          created_at: string
          history: Json
          id: string
          kit_id: string
          staff_id: string
          state: string
          version: number
          visit_id: string
        }
        Insert: {
          created_at?: string
          history?: Json
          id?: string
          kit_id: string
          staff_id: string
          state?: string
          version?: number
          visit_id: string
        }
        Update: {
          created_at?: string
          history?: Json
          id?: string
          kit_id?: string
          staff_id?: string
          state?: string
          version?: number
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kit_assignments_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "field_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kit_assignments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kit_assignments_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_articles: {
        Row: {
          approved_by: string | null
          category: string
          content: string
          created_at: string
          id: string
          reviewed_at: string | null
          source: string
          status: string
          title: string
          valid_until: string | null
          version: number
        }
        Insert: {
          approved_by?: string | null
          category: string
          content: string
          created_at?: string
          id?: string
          reviewed_at?: string | null
          source?: string
          status?: string
          title: string
          valid_until?: string | null
          version?: number
        }
        Update: {
          approved_by?: string | null
          category?: string
          content?: string
          created_at?: string
          id?: string
          reviewed_at?: string | null
          source?: string
          status?: string
          title?: string
          valid_until?: string | null
          version?: number
        }
        Relationships: []
      }
      lesson_completions: {
        Row: {
          completed_at: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          lesson_id: string
          user_id?: string
        }
        Update: {
          completed_at?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_completions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          body: string
          category: string
          id: string
          label: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          body: string
          category?: string
          id?: string
          label: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          body?: string
          category?: string
          id?: string
          label?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          read: boolean
          title: string
          user_id: string | null
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          read?: boolean
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      org_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      outbound_messages: {
        Row: {
          body: string
          conversation_id: string
          conversation_version: number | null
          created_at: string
          created_by: string | null
          error: string | null
          id: string
          idempotency_key: string
          sender: string
          status: string
          template_id: string | null
        }
        Insert: {
          body: string
          conversation_id: string
          conversation_version?: number | null
          created_at?: string
          created_by?: string | null
          error?: string | null
          id?: string
          idempotency_key: string
          sender?: string
          status?: string
          template_id?: string | null
        }
        Update: {
          body?: string
          conversation_id?: string
          conversation_version?: number | null
          created_at?: string
          created_by?: string | null
          error?: string | null
          id?: string
          idempotency_key?: string
          sender?: string
          status?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outbound_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outbound_messages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          client: string
          client_id: string | null
          concept: string
          date: string
          id: string
          status: string
        }
        Insert: {
          amount: number
          client: string
          client_id?: string | null
          concept: string
          date?: string
          id?: string
          status?: string
        }
        Update: {
          amount?: number
          client?: string
          client_id?: string | null
          concept?: string
          date?: string
          id?: string
          status?: string
        }
        Relationships: []
      }
      pet_caregivers: {
        Row: {
          caregiver_id: string
          caregiver_name: string
          created_at: string
          created_by: string | null
          id: string
          pet_id: string
          tasks: string
        }
        Insert: {
          caregiver_id: string
          caregiver_name?: string
          created_at?: string
          created_by?: string | null
          id?: string
          pet_id: string
          tasks?: string
        }
        Update: {
          caregiver_id?: string
          caregiver_name?: string
          created_at?: string
          created_by?: string | null
          id?: string
          pet_id?: string
          tasks?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_caregivers_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          age: string
          allergies: string
          breed: string
          created_at: string
          id: string
          name: string
          owner_id: string | null
          owner_name: string
          photo: string | null
          species: string
        }
        Insert: {
          age?: string
          allergies?: string
          breed?: string
          created_at?: string
          id?: string
          name: string
          owner_id?: string | null
          owner_name?: string
          photo?: string | null
          species?: string
        }
        Update: {
          age?: string
          allergies?: string
          breed?: string
          created_at?: string
          id?: string
          name?: string
          owner_id?: string | null
          owner_name?: string
          photo?: string | null
          species?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      quality_audit: {
        Row: {
          action: string
          actor_id: string
          at: string
          entity_id: string
          id: string
          new_payload: Json
          new_version: number
          old_payload: Json | null
          old_version: number
          reason: string
          request_hash: string
          request_key: string
          result: Json
        }
        Insert: {
          action: string
          actor_id: string
          at?: string
          entity_id: string
          id?: string
          new_payload: Json
          new_version: number
          old_payload?: Json | null
          old_version: number
          reason: string
          request_hash: string
          request_key: string
          result: Json
        }
        Update: {
          action?: string
          actor_id?: string
          at?: string
          entity_id?: string
          id?: string
          new_payload?: Json
          new_version?: number
          old_payload?: Json | null
          old_version?: number
          reason?: string
          request_hash?: string
          request_key?: string
          result?: Json
        }
        Relationships: [
          {
            foreignKeyName: "quality_audit_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "quality_items"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_items: {
        Row: {
          assigned_user_id: string | null
          created_at: string
          created_by: string
          id: string
          kind: string
          owner_id: string | null
          payload: Json
          state: string
          updated_at: string
          version: number
        }
        Insert: {
          assigned_user_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          kind: string
          owner_id?: string | null
          payload?: Json
          state: string
          updated_at?: string
          version?: number
        }
        Update: {
          assigned_user_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          kind?: string
          owner_id?: string | null
          payload?: Json
          state?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      records: {
        Row: {
          created_at: string
          created_by: string | null
          data: Json
          detail: string
          id: string
          kind: string
          owner_id: string | null
          ref_id: string | null
          scope: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data?: Json
          detail?: string
          id?: string
          kind: string
          owner_id?: string | null
          ref_id?: string | null
          scope?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: Json
          detail?: string
          id?: string
          kind?: string
          owner_id?: string | null
          ref_id?: string | null
          scope?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      referral_cases: {
        Row: {
          choice: string | null
          history: Json
          offers: Json
          referral_id: string
          state: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          choice?: string | null
          history?: Json
          offers?: Json
          referral_id: string
          state?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          choice?: string | null
          history?: Json
          offers?: Json
          referral_id?: string
          state?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "referral_cases_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: true
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_choices: {
        Row: {
          created_at: string
          id: string
          offer_id: string
          owner_id: string
          referral_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          offer_id: string
          owner_id?: string
          referral_id: string
        }
        Update: {
          created_at?: string
          id?: string
          offer_id?: string
          owner_id?: string
          referral_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_choices_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_reminders: {
        Row: {
          assignee: string
          created_at: string
          created_by: string | null
          due_at: string
          id: string
          pet_id: string | null
          referral_id: string | null
          status: string
          title: string
        }
        Insert: {
          assignee?: string
          created_at?: string
          created_by?: string | null
          due_at: string
          id?: string
          pet_id?: string | null
          referral_id?: string | null
          status?: string
          title: string
        }
        Update: {
          assignee?: string
          created_at?: string
          created_by?: string | null
          due_at?: string
          id?: string
          pet_id?: string | null
          referral_id?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_reminders_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_reminders_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          id: string
          pet: string
          pet_id: string | null
          specialist: string | null
          specialty: string
          status: string
        }
        Insert: {
          id?: string
          pet: string
          pet_id?: string | null
          specialist?: string | null
          specialty: string
          status?: string
        }
        Update: {
          id?: string
          pet?: string
          pet_id?: string | null
          specialist?: string | null
          specialty?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          at: string
          channel: string
          client: string
          created_by: string | null
          id: string
          message: string
          pet: string
          phone: string
          status: string
        }
        Insert: {
          at?: string
          channel?: string
          client: string
          created_by?: string | null
          id?: string
          message: string
          pet?: string
          phone?: string
          status?: string
        }
        Update: {
          at?: string
          channel?: string
          client?: string
          created_by?: string | null
          id?: string
          message?: string
          pet?: string
          phone?: string
          status?: string
        }
        Relationships: []
      }
      shifts: {
        Row: {
          created_at: string
          day: string
          end_time: string
          id: string
          kind: string
          staff_id: string | null
          start_time: string
        }
        Insert: {
          created_at?: string
          day: string
          end_time?: string
          id?: string
          kind?: string
          staff_id?: string | null
          start_time?: string
        }
        Update: {
          created_at?: string
          day?: string
          end_time?: string
          id?: string
          kind?: string
          staff_id?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "shifts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      simulations: {
        Row: {
          approval_id: string | null
          created_at: string
          created_by: string | null
          errors: Json
          executed_at: string | null
          id: string
          params: Json
          result: Json
          sim_type: string
          status: string
          title: string
        }
        Insert: {
          approval_id?: string | null
          created_at?: string
          created_by?: string | null
          errors?: Json
          executed_at?: string | null
          id?: string
          params?: Json
          result?: Json
          sim_type: string
          status?: string
          title: string
        }
        Update: {
          approval_id?: string | null
          created_at?: string
          created_by?: string | null
          errors?: Json
          executed_at?: string | null
          id?: string
          params?: Json
          result?: Json
          sim_type?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      specialist_reports: {
        Row: {
          author: string
          body: string
          created_at: string
          id: string
          referral_id: string | null
          title: string
        }
        Insert: {
          author?: string
          body?: string
          created_at?: string
          id?: string
          referral_id?: string | null
          title: string
        }
        Update: {
          author?: string
          body?: string
          created_at?: string
          id?: string
          referral_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialist_reports_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_slots: {
        Row: {
          created_at: string
          day: string
          id: string
          time: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day: string
          id?: string
          time: string
          user_id?: string
        }
        Update: {
          created_at?: string
          day?: string
          id?: string
          time?: string
          user_id?: string
        }
        Relationships: []
      }
      specialists: {
        Row: {
          city: string
          id: string
          name: string
          specialty: string
          user_id: string | null
        }
        Insert: {
          city?: string
          id?: string
          name: string
          specialty: string
          user_id?: string | null
        }
        Update: {
          city?: string
          id?: string
          name?: string
          specialty?: string
          user_id?: string | null
        }
        Relationships: []
      }
      staff_locations: {
        Row: {
          accuracy: number | null
          lat: number
          lng: number
          staff_id: string
          updated_at: string
          user_id: string
          visit_id: string
        }
        Insert: {
          accuracy?: number | null
          lat: number
          lng: number
          staff_id: string
          updated_at?: string
          user_id?: string
          visit_id: string
        }
        Update: {
          accuracy?: number | null
          lat?: number
          lng?: number
          staff_id?: string
          updated_at?: string
          user_id?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_locations_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_locations_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_members: {
        Row: {
          id: string
          load: number
          name: string
          next_visit: string | null
          photo: string | null
          role: string
          short: string
          skills: string[]
          status: string
          user_id: string | null
          zone: string
        }
        Insert: {
          id?: string
          load?: number
          name: string
          next_visit?: string | null
          photo?: string | null
          role?: string
          short: string
          skills?: string[]
          status?: string
          user_id?: string | null
          zone: string
        }
        Update: {
          id?: string
          load?: number
          name?: string
          next_visit?: string | null
          photo?: string | null
          role?: string
          short?: string
          skills?: string[]
          status?: string
          user_id?: string | null
          zone?: string
        }
        Relationships: []
      }
      staff_messages: {
        Row: {
          attachment_path: string | null
          body: string
          created_at: string
          from_name: string
          from_user: string
          id: string
          read_at: string | null
          task_id: string | null
          to_staff: string | null
          urgent: boolean
          visit_id: string | null
        }
        Insert: {
          attachment_path?: string | null
          body: string
          created_at?: string
          from_name?: string
          from_user?: string
          id?: string
          read_at?: string | null
          task_id?: string | null
          to_staff?: string | null
          urgent?: boolean
          visit_id?: string | null
        }
        Update: {
          attachment_path?: string | null
          body?: string
          created_at?: string
          from_name?: string
          from_user?: string
          id?: string
          read_at?: string | null
          task_id?: string | null
          to_staff?: string | null
          urgent?: boolean
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_messages_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_messages_to_staff_fkey"
            columns: ["to_staff"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          critical: boolean
          done: boolean
          due_at: string | null
          history: Json
          id: string
          reason: string
          staff_id: string | null
          stage: string | null
          title: string
          version: number
          visit_id: string | null
        }
        Insert: {
          critical?: boolean
          done?: boolean
          due_at?: string | null
          history?: Json
          id?: string
          reason?: string
          staff_id?: string | null
          stage?: string | null
          title: string
          version?: number
          visit_id?: string | null
        }
        Update: {
          critical?: boolean
          done?: boolean
          due_at?: string | null
          history?: Json
          id?: string
          reason?: string
          staff_id?: string | null
          stage?: string | null
          title?: string
          version?: number
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      treatments: {
        Row: {
          done: number
          frequency: string
          id: string
          pet: string
          plan: string
          responsible: string
          total: number
        }
        Insert: {
          done?: number
          frequency: string
          id?: string
          pet: string
          plan: string
          responsible: string
          total?: number
        }
        Update: {
          done?: number
          frequency?: string
          id?: string
          pet?: string
          plan?: string
          responsible?: string
          total?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visit_billing_terms: {
        Row: {
          authorized_at: string
          authorized_by: string
          base_amount: number
          discount: number
          extras: number
          reason: string
          visit_id: string
        }
        Insert: {
          authorized_at?: string
          authorized_by?: string
          base_amount?: number
          discount?: number
          extras?: number
          reason?: string
          visit_id: string
        }
        Update: {
          authorized_at?: string
          authorized_by?: string
          base_amount?: number
          discount?: number
          extras?: number
          reason?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_billing_terms_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: true
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_executions: {
        Row: {
          prep_checked: string[]
          reason: string | null
          stamps: Json
          state: string
          updated_at: string
          updated_by: string | null
          version: number
          visit_id: string
        }
        Insert: {
          prep_checked?: string[]
          reason?: string | null
          stamps?: Json
          state?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
          visit_id: string
        }
        Update: {
          prep_checked?: string[]
          reason?: string | null
          stamps?: Json
          state?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_executions_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: true
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_participants: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          history: Json
          id: string
          prep_checked: string[]
          staff_id: string
          support_state: string
          version: number
          visit_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          history?: Json
          id?: string
          prep_checked?: string[]
          staff_id: string
          support_state?: string
          version?: number
          visit_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          history?: Json
          id?: string
          prep_checked?: string[]
          staff_id?: string
          support_state?: string
          version?: number
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_participants_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_participants_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_supply_requirements: {
        Row: {
          item_id: string
          qty: number
          visit_id: string
        }
        Insert: {
          item_id: string
          qty: number
          visit_id: string
        }
        Update: {
          item_id?: string
          qty?: number
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_supply_requirements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_supply_requirements_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          address: string
          created_at: string
          date: string
          id: string
          okvet_ref: string | null
          operational_on: string | null
          pet_id: string
          prep: string[]
          service: string
          staff_id: string | null
          status: string
          step: string
          time: string
          version: number
          zone: string
        }
        Insert: {
          address?: string
          created_at?: string
          date: string
          id?: string
          okvet_ref?: string | null
          operational_on?: string | null
          pet_id: string
          prep?: string[]
          service: string
          staff_id?: string | null
          status?: string
          step?: string
          time: string
          version?: number
          zone?: string
        }
        Update: {
          address?: string
          created_at?: string
          date?: string
          id?: string
          okvet_ref?: string | null
          operational_on?: string | null
          pet_id?: string
          prep?: string[]
          service?: string
          staff_id?: string | null
          status?: string
          step?: string
          time?: string
          version?: number
          zone?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          client: string
          created_at: string
          id: string
          note: string
          pet: string
          service: string
          status: string
          zone: string
        }
        Insert: {
          client: string
          created_at?: string
          id?: string
          note?: string
          pet?: string
          service?: string
          status?: string
          zone?: string
        }
        Update: {
          client?: string
          created_at?: string
          id?: string
          note?: string
          pet?: string
          service?: string
          status?: string
          zone?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aux_record_visible: {
        Args: { _creator: string; _data: Json; _kind: string }
        Returns: boolean
      }
      aux_sees_pet: { Args: { _pet: string }; Returns: boolean }
      can_access_field_visit: { Args: { _visit: string }; Returns: boolean }
      can_read_field_file: { Args: { _path: string }; Returns: boolean }
      can_refer: { Args: { _uid: string }; Returns: boolean }
      can_see_visit: { Args: { _staff: string }; Returns: boolean }
      consultant_metrics: { Args: never; Returns: Json }
      emit_event: {
        Args: { _entity: string; _key: string; _payload: Json; _type: string }
        Returns: undefined
      }
      field_billing_balance: { Args: { _visit: string }; Returns: Json }
      field_day_pending: {
        Args: { _day: string; _staff: string }
        Returns: Json
      }
      field_supplies_ready: { Args: { _visit: string }; Returns: boolean }
      field_task_transition: {
        Args: {
          _id: string
          _reason?: string
          _stage: string
          _version: number
        }
        Returns: undefined
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      inventory_availability: {
        Args: never
        Returns: {
          item_id: string
          reserved: number
        }[]
      }
      is_aux_only: { Args: { _uid: string }; Returns: boolean }
      is_caregiver_of: { Args: { _pet: string }; Returns: boolean }
      is_clinical: { Args: { _uid: string }; Returns: boolean }
      is_director: { Args: { _uid: string }; Returns: boolean }
      is_ops: { Args: { _uid: string }; Returns: boolean }
      is_staff: { Args: { _uid: string }; Returns: boolean }
      my_referral_offers: {
        Args: never
        Returns: {
          chosen: string
          offers: Json
          pet: string
          referral_id: string
          specialty: string
        }[]
      }
      my_specialist_name: { Args: never; Returns: string }
      my_staff_ids: { Args: never; Returns: string[] }
      offer_is_live: {
        Args: { _offer: string; _ref: string }
        Returns: boolean
      }
      owns_pet: { Args: { _pet: string }; Returns: boolean }
      owns_referral: { Args: { _ref: string }; Returns: boolean }
      quality_checked_command: { Args: { command: Json }; Returns: Json }
      quality_command: { Args: { command: Json }; Returns: Json }
      quality_family_cases: {
        Args: never
        Returns: {
          assigned_user_id: string | null
          created_at: string
          created_by: string
          id: string
          kind: string
          owner_id: string | null
          payload: Json
          state: string
          updated_at: string
          version: number
        }[]
        SetofOptions: {
          from: "*"
          to: "quality_items"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      quality_has_invitation: { Args: { _survey: string }; Returns: boolean }
      quality_timeline: {
        Args: { _entity: string }
        Returns: {
          action: string
          actor_id: string
          at: string
          new_version: number
          old_version: number
          reason: string
        }[]
      }
      reserve_supply: {
        Args: { _item: string; _key: string; _qty: number; _visit: string }
        Returns: string
      }
      set_account_profile: {
        Args: { _profile: string; _user_id: string }
        Returns: Json
      }
      settle_reservation: {
        Args: { _consume: boolean; _id: string }
        Returns: string
      }
    }
    Enums: {
      app_role:
        | "cliente"
        | "cuidador"
        | "veterinario"
        | "auxiliar"
        | "coordinador"
        | "recepcion"
        | "finanzas"
        | "administrador"
        | "luis"
        | "soporte"
        | "consultor"
        | "especialista"
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
      app_role: [
        "cliente",
        "cuidador",
        "veterinario",
        "auxiliar",
        "coordinador",
        "recepcion",
        "finanzas",
        "administrador",
        "luis",
        "soporte",
        "consultor",
        "especialista",
      ],
    },
  },
} as const
