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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      documents: {
        Row: {
          added_at: string
          id: string
          name: string
          property_id: string
          type: string
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          name: string
          property_id: string
          type: string
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          name?: string
          property_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      inductions: {
        Row: {
          completed_at: string | null
          created_at: string
          eicr_received: boolean
          electric_meter_photo_url: string | null
          electric_meter_reading: string | null
          epc_received: boolean
          gas_meter_photo_url: string | null
          gas_meter_reading: string | null
          gas_safety_received: boolean
          gov_info_sheet_received: boolean
          how_to_rent_received: boolean
          id: string
          property_id: string
          smoke_alarms_tested: boolean
          stopcock_located: boolean
          tenant_signature: string | null
          updated_at: string
          user_id: string
          water_meter_photo_url: string | null
          water_meter_reading: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          eicr_received?: boolean
          electric_meter_photo_url?: string | null
          electric_meter_reading?: string | null
          epc_received?: boolean
          gas_meter_photo_url?: string | null
          gas_meter_reading?: string | null
          gas_safety_received?: boolean
          gov_info_sheet_received?: boolean
          how_to_rent_received?: boolean
          id?: string
          property_id: string
          smoke_alarms_tested?: boolean
          stopcock_located?: boolean
          tenant_signature?: string | null
          updated_at?: string
          user_id: string
          water_meter_photo_url?: string | null
          water_meter_reading?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          eicr_received?: boolean
          electric_meter_photo_url?: string | null
          electric_meter_reading?: string | null
          epc_received?: boolean
          gas_meter_photo_url?: string | null
          gas_meter_reading?: string | null
          gas_safety_received?: boolean
          gov_info_sheet_received?: boolean
          how_to_rent_received?: boolean
          id?: string
          property_id?: string
          smoke_alarms_tested?: boolean
          stopcock_located?: boolean
          tenant_signature?: string | null
          updated_at?: string
          user_id?: string
          water_meter_photo_url?: string | null
          water_meter_reading?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inductions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          email: string | null
          full_name: string | null
          id: string
          property_count: number | null
          subscription_tier: string | null
        }
        Insert: {
          email?: string | null
          full_name?: string | null
          id: string
          property_count?: number | null
          subscription_tier?: string | null
        }
        Update: {
          email?: string | null
          full_name?: string | null
          id?: string
          property_count?: number | null
          subscription_tier?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          created_at: string
          eicr: boolean
          epc: boolean
          gas_safety: boolean
          id: string
          renters_rights_act_2026: boolean
          tenant_info_statement: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          eicr?: boolean
          epc?: boolean
          gas_safety?: boolean
          id?: string
          renters_rights_act_2026?: boolean
          tenant_info_statement?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          eicr?: boolean
          epc?: boolean
          gas_safety?: boolean
          id?: string
          renters_rights_act_2026?: boolean
          tenant_info_statement?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
