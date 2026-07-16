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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      asiento: {
        Row: {
          codigo_iva: number
          concepto: string
          cotizacion: number
          created_at: string
          debe: string
          dia: number
          empresa_id: string
          haber: string
          id: string
          iva: number
          libro: string
          moneda: number
          rut: string
          tipo: string | null
          total: number
        }
        Insert: {
          codigo_iva: number
          concepto: string
          cotizacion: number
          created_at?: string
          debe: string
          dia: number
          empresa_id: string
          haber: string
          id?: string
          iva: number
          libro: string
          moneda: number
          rut: string
          tipo?: string | null
          total: number
        }
        Update: {
          codigo_iva?: number
          concepto?: string
          cotizacion?: number
          created_at?: string
          debe?: string
          dia?: number
          empresa_id?: string
          haber?: string
          id?: string
          iva?: number
          libro?: string
          moneda?: number
          rut?: string
          tipo?: string | null
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "asiento_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["id"]
          },
        ]
      }
      cuenta: {
        Row: {
          created_at: string
          email: string
          id: string
          nombre: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          nombre?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nombre?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      data_fields: {
        Row: {
          code: string
          created_at: string
          data_type: string
          description: string | null
          id: string
          is_active: boolean
          is_common: boolean
          label: string
        }
        Insert: {
          code: string
          created_at?: string
          data_type: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_common?: boolean
          label: string
        }
        Update: {
          code?: string
          created_at?: string
          data_type?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_common?: boolean
          label?: string
        }
        Relationships: []
      }
      declaration_required_fields: {
        Row: {
          created_at: string
          data_field_id: string
          declaration_id: string
          display_order: number
          is_required: boolean
        }
        Insert: {
          created_at?: string
          data_field_id: string
          declaration_id: string
          display_order?: number
          is_required?: boolean
        }
        Update: {
          created_at?: string
          data_field_id?: string
          declaration_id?: string
          display_order?: number
          is_required?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "declaration_required_fields_data_field_id_fkey"
            columns: ["data_field_id"]
            isOneToOne: false
            referencedRelation: "data_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "declaration_required_fields_declaration_id_fkey"
            columns: ["declaration_id"]
            isOneToOne: false
            referencedRelation: "declarations"
            referencedColumns: ["id"]
          },
        ]
      }
      declarations: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      empresa: {
        Row: {
          created_at: string
          cuenta_id: string
          estado: string
          id: string
          nombre: string
          responsable: string | null
          rut: string
          ultimo_movimiento: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cuenta_id: string
          estado?: string
          id?: string
          nombre: string
          responsable?: string | null
          rut: string
          ultimo_movimiento?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cuenta_id?: string
          estado?: string
          id?: string
          nombre?: string
          responsable?: string | null
          rut?: string
          ultimo_movimiento?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresa_cuenta_id_fkey"
            columns: ["cuenta_id"]
            isOneToOne: false
            referencedRelation: "cuenta"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_cuentas: {
        Row: {
          codigo_iva: number | null
          codigo_padi: string
          created_at: string
          cuenta_contable: string
          empresa_id: string
          id: string
        }
        Insert: {
          codigo_iva?: number | null
          codigo_padi: string
          created_at?: string
          cuenta_contable: string
          empresa_id: string
          id?: string
        }
        Update: {
          codigo_iva?: number | null
          codigo_padi?: string
          created_at?: string
          cuenta_contable?: string
          empresa_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_cuentas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      crear_empresa_con_plan_cuentas: {
        Args: { p_cuentas: Json; p_nombre: string; p_rut: string }
        Returns: string
      }
      insertar_asientos: {
        Args: { p_empresa_id: string; p_lineas: Json }
        Returns: undefined
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
