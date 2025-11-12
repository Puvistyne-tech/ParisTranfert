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
    PostgrestVersion: "13.0.5"
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
      categories: {
        Row: {
          category_type: Database["public"]["Enums"]["category_type_enum"]
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          category_type: Database["public"]["Enums"]["category_type_enum"]
          created_at?: string | null
          description?: string | null
          id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          category_type?: Database["public"]["Enums"]["category_type_enum"]
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          phone: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_trigger_config: {
        Row: {
          id: number
          service_role_key: string
          supabase_url: string
          updated_at: string | null
        }
        Insert: {
          id?: number
          service_role_key: string
          supabase_url: string
          updated_at?: string | null
        }
        Update: {
          id?: number
          service_role_key?: string
          supabase_url?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      features: {
        Row: {
          created_at: string | null
          gradient: string
          icon: string
          key: string
        }
        Insert: {
          created_at?: string | null
          gradient: string
          icon: string
          key: string
        }
        Update: {
          created_at?: string | null
          gradient?: string
          icon?: string
          key?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      reservations: {
        Row: {
          baby_seats: number | null
          booster_seats: number | null
          client_id: string
          created_at: string | null
          date: string
          destination_location: string | null
          id: string
          meet_and_greet: boolean | null
          notes: string | null
          passengers: number
          pickup_location: string
          service_id: string
          service_sub_data: Json | null
          status: Database["public"]["Enums"]["reservation_status_enum"]
          time: string
          total_price: number
          updated_at: string | null
          vehicle_type_id: string
        }
        Insert: {
          baby_seats?: number | null
          booster_seats?: number | null
          client_id: string
          created_at?: string | null
          date: string
          destination_location?: string | null
          id?: string
          meet_and_greet?: boolean | null
          notes?: string | null
          passengers: number
          pickup_location: string
          service_id: string
          service_sub_data?: Json | null
          status?: Database["public"]["Enums"]["reservation_status_enum"]
          time: string
          total_price: number
          updated_at?: string | null
          vehicle_type_id: string
        }
        Update: {
          baby_seats?: number | null
          booster_seats?: number | null
          client_id?: string
          created_at?: string | null
          date?: string
          destination_location?: string | null
          id?: string
          meet_and_greet?: boolean | null
          notes?: string | null
          passengers?: number
          pickup_location?: string
          service_id?: string
          service_sub_data?: Json | null
          status?: Database["public"]["Enums"]["reservation_status_enum"]
          time?: string
          total_price?: number
          updated_at?: string | null
          vehicle_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_vehicle_type_id_fkey"
            columns: ["vehicle_type_id"]
            isOneToOne: false
            referencedRelation: "vehicle_types"
            referencedColumns: ["id"]
          },
        ]
      }
      service_fields: {
        Row: {
          created_at: string | null
          default_value: string | null
          field_key: string
          field_order: number | null
          field_type: Database["public"]["Enums"]["service_field_type_enum"]
          id: string
          is_destination: boolean | null
          is_pickup: boolean | null
          label: string
          max_value: number | null
          min_value: number | null
          options: Json | null
          required: boolean | null
          service_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_value?: string | null
          field_key: string
          field_order?: number | null
          field_type: Database["public"]["Enums"]["service_field_type_enum"]
          id?: string
          is_destination?: boolean | null
          is_pickup?: boolean | null
          label: string
          max_value?: number | null
          min_value?: number | null
          options?: Json | null
          required?: boolean | null
          service_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_value?: string | null
          field_key?: string
          field_order?: number | null
          field_type?: Database["public"]["Enums"]["service_field_type_enum"]
          id?: string
          is_destination?: boolean | null
          is_pickup?: boolean | null
          label?: string
          max_value?: number | null
          min_value?: number | null
          options?: Json | null
          required?: boolean | null
          service_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_fields_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_locations: {
        Row: {
          is_destination: boolean | null
          is_pickup: boolean | null
          location_id: string
          service_id: string
        }
        Insert: {
          is_destination?: boolean | null
          is_pickup?: boolean | null
          location_id: string
          service_id: string
        }
        Update: {
          is_destination?: boolean | null
          is_pickup?: boolean | null
          location_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_locations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_vehicle_pricing: {
        Row: {
          created_at: string | null
          destination_location_id: string
          id: string
          pickup_location_id: string
          price: number
          service_id: string
          updated_at: string | null
          vehicle_type_id: string
        }
        Insert: {
          created_at?: string | null
          destination_location_id: string
          id?: string
          pickup_location_id: string
          price: number
          service_id: string
          updated_at?: string | null
          vehicle_type_id: string
        }
        Update: {
          created_at?: string | null
          destination_location_id?: string
          id?: string
          pickup_location_id?: string
          price?: number
          service_id?: string
          updated_at?: string | null
          vehicle_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_vehicle_pricing_destination_location_id_fkey"
            columns: ["destination_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_vehicle_pricing_pickup_location_id_fkey"
            columns: ["pickup_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_vehicle_pricing_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_vehicle_pricing_vehicle_type_id_fkey"
            columns: ["vehicle_type_id"]
            isOneToOne: false
            referencedRelation: "vehicle_types"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          duration: string | null
          features: Json | null
          icon: string | null
          id: string
          image: string | null
          is_available: boolean | null
          is_popular: boolean | null
          key: string
          languages: Json | null
          name: string
          price_range: string | null
          short_description: string | null
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          features?: Json | null
          icon?: string | null
          id: string
          image?: string | null
          is_available?: boolean | null
          is_popular?: boolean | null
          key: string
          languages?: Json | null
          name: string
          price_range?: string | null
          short_description?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          features?: Json | null
          icon?: string | null
          id?: string
          image?: string | null
          is_available?: boolean | null
          is_popular?: boolean | null
          key?: string
          languages?: Json | null
          name?: string
          price_range?: string | null
          short_description?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          comment: string
          created_at: string | null
          gradient: string | null
          id: string
          initials: string
          name: string
          rating: number
        }
        Insert: {
          comment: string
          created_at?: string | null
          gradient?: string | null
          id?: string
          initials: string
          name: string
          rating: number
        }
        Update: {
          comment?: string
          created_at?: string | null
          gradient?: string | null
          id?: string
          initials?: string
          name?: string
          rating?: number
        }
        Relationships: []
      }
      vehicle_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image: string | null
          max_passengers: number | null
          min_passengers: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          image?: string | null
          max_passengers?: number | null
          min_passengers?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          max_passengers?: number | null
          min_passengers?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_super_admin: { Args: { user_id: string }; Returns: boolean }
    }
    Enums: {
      category_type_enum:
        | "transport"
        | "luxury"
        | "tour"
        | "security"
        | "special"
      CategoryType: "TRANSPORT" | "LUXURY" | "TOUR" | "SECURITY" | "SPECIAL"
      reservation_status_enum:
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "quote_sent"
        | "quote_accepted"
        | "quote_requested"
      ReservationStatus: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
      service_field_type_enum:
        | "text"
        | "number"
        | "select"
        | "textarea"
        | "date"
        | "time"
        | "location_select"
        | "address_autocomplete"
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
    Enums: {
      category_type_enum: [
        "transport",
        "luxury",
        "tour",
        "security",
        "special",
      ],
      CategoryType: ["TRANSPORT", "LUXURY", "TOUR", "SECURITY", "SPECIAL"],
      reservation_status_enum: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "quote_sent",
        "quote_accepted",
        "quote_requested",
      ],
      ReservationStatus: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"],
      service_field_type_enum: [
        "text",
        "number",
        "select",
        "textarea",
        "date",
        "time",
        "location_select",
        "address_autocomplete",
      ],
    },
  },
} as const
