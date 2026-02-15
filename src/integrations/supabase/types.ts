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
      action_alerts: {
        Row: {
          alert_type: string | null
          created_at: string | null
          id: string
          is_resolved: boolean | null
          property_id: string | null
          resolved_at: string | null
        }
        Insert: {
          alert_type?: string | null
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          property_id?: string | null
          resolved_at?: string | null
        }
        Update: {
          alert_type?: string | null
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          property_id?: string | null
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_alerts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
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
          co_alarm_tested: boolean | null
          completed_at: string | null
          created_at: string
          doc_eicr_provided: boolean | null
          doc_epc_provided: boolean | null
          doc_gov_info_sheet_2026: boolean | null
          doc_how_to_rent_2026: boolean | null
          eicr_received: boolean
          electric_meter_photo_url: string | null
          electric_meter_reading: string | null
          electric_photo_url: string | null
          electric_reading: string | null
          epc_received: boolean
          fire_doors_checked: boolean | null
          gas_meter_photo_url: string | null
          gas_meter_reading: string | null
          gas_photo_url: string | null
          gas_reading: string | null
          gas_safety_received: boolean
          gov_info_sheet_provided: boolean | null
          gov_info_sheet_received: boolean
          how_to_rent_2026_provided: boolean | null
          how_to_rent_received: boolean
          id: string
          is_gas_applicable: boolean | null
          is_oil_applicable: boolean | null
          is_stopcock_na: boolean | null
          is_water_meter_applicable: boolean | null
          is_window_restrictor_na: boolean | null
          mould_check_passed: boolean | null
          oil_level_reading: string | null
          oil_tank_photo_url: string | null
          property_id: string
          renters_rights_confirmed: boolean | null
          smoke_alarm_photo_url: string | null
          smoke_alarm_tested: boolean | null
          smoke_alarms_tested: boolean
          statement_due_date: string | null
          stopcock_located: boolean
          tenant_signature: string | null
          tenant_statement_sent: boolean | null
          updated_at: string
          user_id: string
          water_meter_photo_url: string | null
          water_meter_reading: string | null
          water_photo_url: string | null
          water_reading: string | null
          window_restrictors_ok: boolean | null
        }
        Insert: {
          co_alarm_tested?: boolean | null
          completed_at?: string | null
          created_at?: string
          doc_eicr_provided?: boolean | null
          doc_epc_provided?: boolean | null
          doc_gov_info_sheet_2026?: boolean | null
          doc_how_to_rent_2026?: boolean | null
          eicr_received?: boolean
          electric_meter_photo_url?: string | null
          electric_meter_reading?: string | null
          electric_photo_url?: string | null
          electric_reading?: string | null
          epc_received?: boolean
          fire_doors_checked?: boolean | null
          gas_meter_photo_url?: string | null
          gas_meter_reading?: string | null
          gas_photo_url?: string | null
          gas_reading?: string | null
          gas_safety_received?: boolean
          gov_info_sheet_provided?: boolean | null
          gov_info_sheet_received?: boolean
          how_to_rent_2026_provided?: boolean | null
          how_to_rent_received?: boolean
          id?: string
          is_gas_applicable?: boolean | null
          is_oil_applicable?: boolean | null
          is_stopcock_na?: boolean | null
          is_water_meter_applicable?: boolean | null
          is_window_restrictor_na?: boolean | null
          mould_check_passed?: boolean | null
          oil_level_reading?: string | null
          oil_tank_photo_url?: string | null
          property_id: string
          renters_rights_confirmed?: boolean | null
          smoke_alarm_photo_url?: string | null
          smoke_alarm_tested?: boolean | null
          smoke_alarms_tested?: boolean
          statement_due_date?: string | null
          stopcock_located?: boolean
          tenant_signature?: string | null
          tenant_statement_sent?: boolean | null
          updated_at?: string
          user_id: string
          water_meter_photo_url?: string | null
          water_meter_reading?: string | null
          water_photo_url?: string | null
          water_reading?: string | null
          window_restrictors_ok?: boolean | null
        }
        Update: {
          co_alarm_tested?: boolean | null
          completed_at?: string | null
          created_at?: string
          doc_eicr_provided?: boolean | null
          doc_epc_provided?: boolean | null
          doc_gov_info_sheet_2026?: boolean | null
          doc_how_to_rent_2026?: boolean | null
          eicr_received?: boolean
          electric_meter_photo_url?: string | null
          electric_meter_reading?: string | null
          electric_photo_url?: string | null
          electric_reading?: string | null
          epc_received?: boolean
          fire_doors_checked?: boolean | null
          gas_meter_photo_url?: string | null
          gas_meter_reading?: string | null
          gas_photo_url?: string | null
          gas_reading?: string | null
          gas_safety_received?: boolean
          gov_info_sheet_provided?: boolean | null
          gov_info_sheet_received?: boolean
          how_to_rent_2026_provided?: boolean | null
          how_to_rent_received?: boolean
          id?: string
          is_gas_applicable?: boolean | null
          is_oil_applicable?: boolean | null
          is_stopcock_na?: boolean | null
          is_water_meter_applicable?: boolean | null
          is_window_restrictor_na?: boolean | null
          mould_check_passed?: boolean | null
          oil_level_reading?: string | null
          oil_tank_photo_url?: string | null
          property_id?: string
          renters_rights_confirmed?: boolean | null
          smoke_alarm_photo_url?: string | null
          smoke_alarm_tested?: boolean | null
          smoke_alarms_tested?: boolean
          statement_due_date?: string | null
          stopcock_located?: boolean
          tenant_signature?: string | null
          tenant_statement_sent?: boolean | null
          updated_at?: string
          user_id?: string
          water_meter_photo_url?: string | null
          water_meter_reading?: string | null
          water_photo_url?: string | null
          water_reading?: string | null
          window_restrictors_ok?: boolean | null
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
          conversion_date: string | null
          created_at: string
          eicr: boolean
          epc: boolean
          gas_safety: boolean
          has_gas_supply: boolean | null
          heating_type: string | null
          id: string
          info_statement_version: string | null
          is_decent_homes_compliant: boolean | null
          last_mould_inspection: string | null
          last_oil_service: string | null
          oftec_due_date: string | null
          oil_tank_location: string | null
          renters_rights_act_2026: boolean
          requires_hmo_checks: boolean | null
          tenancy_type: string | null
          tenant_info_statement: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          conversion_date?: string | null
          created_at?: string
          eicr?: boolean
          epc?: boolean
          gas_safety?: boolean
          has_gas_supply?: boolean | null
          heating_type?: string | null
          id?: string
          info_statement_version?: string | null
          is_decent_homes_compliant?: boolean | null
          last_mould_inspection?: string | null
          last_oil_service?: string | null
          oftec_due_date?: string | null
          oil_tank_location?: string | null
          renters_rights_act_2026?: boolean
          requires_hmo_checks?: boolean | null
          tenancy_type?: string | null
          tenant_info_statement?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          conversion_date?: string | null
          created_at?: string
          eicr?: boolean
          epc?: boolean
          gas_safety?: boolean
          has_gas_supply?: boolean | null
          heating_type?: string | null
          id?: string
          info_statement_version?: string | null
          is_decent_homes_compliant?: boolean | null
          last_mould_inspection?: string | null
          last_oil_service?: string | null
          oftec_due_date?: string | null
          oil_tank_location?: string | null
          renters_rights_act_2026?: boolean
          requires_hmo_checks?: boolean | null
          tenancy_type?: string | null
          tenant_info_statement?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      induction_report_data: {
        Row: {
          completion_date: string | null
          electric_reading: string | null
          gas_reading: string | null
          induction_id: string | null
          landlord_name: string | null
          property_address: string | null
          tenant_signature: string | null
          water_reading: string | null
        }
        Relationships: []
      }
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
