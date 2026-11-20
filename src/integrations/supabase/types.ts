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
      incidents: {
        Row: {
          created_at: string
          detail: string
          id: string
          owner: string
          severity: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          detail?: string
          id?: string
          owner?: string
          severity?: string
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          detail?: string
          id?: string
          owner?: string
          severity?: string
          status?: string
          title?: string
        }
        Relationships: []
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
      tasks: {
        Row: {
          done: boolean
          id: string
          staff_id: string | null
          title: string
        }
        Insert: {
          done?: boolean
          id?: string
          staff_id?: string | null
          title: string
        }
        Update: {
          done?: boolean
          id?: string
          staff_id?: string | null
          title?: string
        }
        Relationships: []
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
      visits: {
        Row: {
          address: string
          created_at: string
          date: string
          id: string
          pet_id: string
          prep: string[]
          service: string
          staff_id: string | null
          status: string
          step: string
          time: string
          zone: string
        }
        Insert: {
          address?: string
          created_at?: string
          date: string
          id?: string
          pet_id: string
          prep?: string[]
          service: string
          staff_id?: string | null
          status?: string
          step?: string
          time: string
          zone?: string
        }
        Update: {
          address?: string
          created_at?: string
          date?: string
          id?: string
          pet_id?: string
          prep?: string[]
          service?: string
          staff_id?: string | null
          status?: string
          step?: string
          time?: string
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
      can_refer: { Args: { _uid: string }; Returns: boolean }
      can_see_visit: { Args: { _staff: string }; Returns: boolean }
      consultant_metrics: { Args: never; Returns: Json }
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
      is_aux_only: { Args: { _uid: string }; Returns: boolean }
      is_caregiver_of: { Args: { _pet: string }; Returns: boolean }
      is_clinical: { Args: { _uid: string }; Returns: boolean }
      is_director: { Args: { _uid: string }; Returns: boolean }
      is_ops: { Args: { _uid: string }; Returns: boolean }
      is_staff: { Args: { _uid: string }; Returns: boolean }
      my_specialist_name: { Args: never; Returns: string }
      owns_pet: { Args: { _pet: string }; Returns: boolean }
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
