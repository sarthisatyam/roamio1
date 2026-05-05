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
      co_companions: {
        Row: {
          companion_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          companion_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          companion_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      community_bookings: {
        Row: {
          amount_paid: number
          commission_amount: number
          contact_phone: string | null
          created_at: string
          emergency_contact: Json | null
          id: string
          seats: number
          status: string
          stripe_session_id: string | null
          travellers: Json
          trip_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid?: number
          commission_amount?: number
          contact_phone?: string | null
          created_at?: string
          emergency_contact?: Json | null
          id?: string
          seats?: number
          status?: string
          stripe_session_id?: string | null
          travellers?: Json
          trip_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number
          commission_amount?: number
          contact_phone?: string | null
          created_at?: string
          emergency_contact?: Json | null
          id?: string
          seats?: number
          status?: string
          stripe_session_id?: string | null
          travellers?: Json
          trip_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_bookings_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "community_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      community_trips: {
        Row: {
          cancellation_policy: string | null
          cover_url: string | null
          created_at: string
          destination: string
          end_date: string
          exclusions: string[] | null
          gallery_urls: string[] | null
          group_id: string | null
          group_type: string
          host_id: string
          id: string
          inclusions: string[] | null
          itinerary: Json | null
          languages: string[] | null
          latitude: number | null
          longitude: number | null
          meeting_point: string | null
          price_inr: number
          seats_left: number
          seats_total: number
          start_date: string
          status: string
          title: string
          trip_type: string
          updated_at: string
        }
        Insert: {
          cancellation_policy?: string | null
          cover_url?: string | null
          created_at?: string
          destination: string
          end_date: string
          exclusions?: string[] | null
          gallery_urls?: string[] | null
          group_id?: string | null
          group_type?: string
          host_id: string
          id?: string
          inclusions?: string[] | null
          itinerary?: Json | null
          languages?: string[] | null
          latitude?: number | null
          longitude?: number | null
          meeting_point?: string | null
          price_inr: number
          seats_left: number
          seats_total: number
          start_date: string
          status?: string
          title: string
          trip_type?: string
          updated_at?: string
        }
        Update: {
          cancellation_policy?: string | null
          cover_url?: string | null
          created_at?: string
          destination?: string
          end_date?: string
          exclusions?: string[] | null
          gallery_urls?: string[] | null
          group_id?: string | null
          group_type?: string
          host_id?: string
          id?: string
          inclusions?: string[] | null
          itinerary?: Json | null
          languages?: string[] | null
          latitude?: number | null
          longitude?: number | null
          meeting_point?: string | null
          price_inr?: number
          seats_left?: number
          seats_total?: number
          start_date?: string
          status?: string
          title?: string
          trip_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_trips_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "host_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companion_connections: {
        Row: {
          created_at: string
          from_user_id: string
          id: string
          message: string | null
          status: string | null
          to_user_id: string
        }
        Insert: {
          created_at?: string
          from_user_id: string
          id?: string
          message?: string | null
          status?: string | null
          to_user_id: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          id?: string
          message?: string | null
          status?: string | null
          to_user_id?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_messages: {
        Row: {
          content: string
          created_at: string
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          category: string
          created_at: string
          created_by: string
          description: string | null
          icon: string | null
          id: string
          name: string
          plan_id: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          plan_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          plan_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      host_profiles: {
        Row: {
          bio: string | null
          business_name: string | null
          city: string | null
          commission_pct: number
          created_at: string
          experience_years: number | null
          gstin: string | null
          id: string
          legal_name: string
          rating: number | null
          social_links: Json | null
          status: string
          total_trips: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          business_name?: string | null
          city?: string | null
          commission_pct?: number
          created_at?: string
          experience_years?: number | null
          gstin?: string | null
          id?: string
          legal_name: string
          rating?: number | null
          social_links?: Json | null
          status?: string
          total_trips?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          business_name?: string | null
          city?: string | null
          commission_pct?: number
          created_at?: string
          experience_years?: number | null
          gstin?: string | null
          id?: string
          legal_name?: string
          rating?: number | null
          social_links?: Json | null
          status?: string
          total_trips?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      host_reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewer_id: string
          trip_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewer_id: string
          trip_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewer_id?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "host_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "community_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "host_reviews_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "community_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      join_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          plan_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          plan_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          plan_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "join_requests_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_invites: {
        Row: {
          created_at: string
          from_user_id: string
          id: string
          message: string | null
          status: string
          to_user_id: string
        }
        Insert: {
          created_at?: string
          from_user_id: string
          id?: string
          message?: string | null
          status?: string
          to_user_id: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          id?: string
          message?: string | null
          status?: string
          to_user_id?: string
        }
        Relationships: []
      }
      liked_companions: {
        Row: {
          created_at: string
          id: string
          liked_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          liked_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          liked_user_id?: string
          user_id?: string
        }
        Relationships: []
      }
      parental_guardians: {
        Row: {
          created_at: string
          id: string
          parent_email: string
          parent_name: string
          parent_phone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          parent_email: string
          parent_name: string
          parent_phone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          parent_email?: string
          parent_name?: string
          parent_phone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      parental_location_logs: {
        Row: {
          created_at: string
          id: string
          latitude: number
          longitude: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          user_id?: string
        }
        Relationships: []
      }
      parental_settings: {
        Row: {
          checkin_reminders: boolean
          created_at: string
          id: string
          location_sharing: boolean
          restrict_late_bookings: boolean
          sos_alerts: boolean
          trip_notifications: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          checkin_reminders?: boolean
          created_at?: string
          id?: string
          location_sharing?: boolean
          restrict_late_bookings?: boolean
          sos_alerts?: boolean
          trip_notifications?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          checkin_reminders?: boolean
          created_at?: string
          id?: string
          location_sharing?: boolean
          restrict_late_bookings?: boolean
          sos_alerts?: boolean
          trip_notifications?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      parental_sos_alerts: {
        Row: {
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      parental_trip_updates: {
        Row: {
          created_at: string
          id: string
          trip_details: Json | null
          update_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          trip_details?: Json | null
          update_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          trip_details?: Json | null
          update_type?: string
          user_id?: string
        }
        Relationships: []
      }
      plan_members: {
        Row: {
          id: string
          joined_at: string
          plan_id: string
          role: string
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          plan_id: string
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          plan_id?: string
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_members_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          cover_image_url: string | null
          created_at: string
          creator_id: string
          destination_name: string
          end_date: string
          group_type: string
          id: string
          interests: string[] | null
          latitude: number | null
          longitude: number | null
          max_members: number
          plan_name: string
          plan_visibility: string
          start_date: string
          status: string
          trip_description: string | null
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          creator_id: string
          destination_name: string
          end_date: string
          group_type?: string
          id?: string
          interests?: string[] | null
          latitude?: number | null
          longitude?: number | null
          max_members?: number
          plan_name: string
          plan_visibility?: string
          start_date: string
          status?: string
          trip_description?: string | null
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          creator_id?: string
          destination_name?: string
          end_date?: string
          group_type?: string
          id?: string
          interests?: string[] | null
          latitude?: number | null
          longitude?: number | null
          max_members?: number
          plan_name?: string
          plan_visibility?: string
          start_date?: string
          status?: string
          trip_description?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          display_name: string | null
          gender: string | null
          id: string
          interests: string[] | null
          is_verified: boolean | null
          location_lat: number | null
          location_lng: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          is_verified?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          is_verified?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trip_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          trip_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          trip_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_members_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          trip_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          trip_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_messages_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_requests: {
        Row: {
          answers: Json | null
          created_at: string
          id: string
          message: string | null
          reviewed_by: string | null
          status: string
          trip_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json | null
          created_at?: string
          id?: string
          message?: string | null
          reviewed_by?: string | null
          status?: string
          trip_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json | null
          created_at?: string
          id?: string
          message?: string | null
          reviewed_by?: string | null
          status?: string
          trip_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_requests_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          budget_range: string
          created_at: string
          created_by: string
          description: string | null
          destination: string
          end_date: string
          group_type: string
          id: string
          max_members: number
          start_date: string
          status: string
          trip_style: string | null
          trip_type: string
          updated_at: string
        }
        Insert: {
          budget_range: string
          created_at?: string
          created_by: string
          description?: string | null
          destination: string
          end_date: string
          group_type: string
          id?: string
          max_members?: number
          start_date: string
          status?: string
          trip_style?: string | null
          trip_type: string
          updated_at?: string
        }
        Update: {
          budget_range?: string
          created_at?: string
          created_by?: string
          description?: string | null
          destination?: string
          end_date?: string
          group_type?: string
          id?: string
          max_members?: number
          start_date?: string
          status?: string
          trip_style?: string | null
          trip_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          created_at: string
          id: string
          is_online: boolean | null
          last_seen: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      book_community_trip:
        | {
            Args: {
              p_contact_phone: string
              p_emergency: Json
              p_seats: number
              p_trip_id: string
            }
            Returns: string
          }
        | {
            Args: {
              p_contact_phone: string
              p_emergency: Json
              p_seats: number
              p_travellers?: Json
              p_trip_id: string
            }
            Returns: string
          }
      handle_join_request: {
        Args: {
          p_action: string
          p_plan_id: string
          p_request_id: string
          p_request_user_id: string
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      remove_plan_member: {
        Args: { p_plan_id: string; p_user_id: string }
        Returns: undefined
      }
      sync_plan_group_members: {
        Args: { p_plan_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "host" | "user"
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
    Enums: {
      app_role: ["admin", "host", "user"],
    },
  },
} as const
