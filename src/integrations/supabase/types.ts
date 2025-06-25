export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      auction_images: {
        Row: {
          auction_id: string
          created_at: string
          id: string
          image_url: string
          is_primary: boolean | null
        }
        Insert: {
          auction_id: string
          created_at?: string
          id?: string
          image_url: string
          is_primary?: boolean | null
        }
        Update: {
          auction_id?: string
          created_at?: string
          id?: string
          image_url?: string
          is_primary?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "auction_images_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_winners: {
        Row: {
          auction_id: string
          created_at: string
          id: string
          winner_id: string
          winning_bid: number
          won_at: string
        }
        Insert: {
          auction_id: string
          created_at?: string
          id?: string
          winner_id: string
          winning_bid: number
          won_at?: string
        }
        Update: {
          auction_id?: string
          created_at?: string
          id?: string
          winner_id?: string
          winning_bid?: number
          won_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_winners_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auction_winners_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      auctions: {
        Row: {
          auction_duration: number
          bid_increment: number
          bidder_count: number
          category: string
          condition: Database["public"]["Enums"]["auction_condition"]
          created_at: string
          created_by: string
          current_bid: number | null
          description: string
          dimensions: string | null
          end_time: string | null
          id: string
          image_urls: string[] | null
          provenance: string | null
          reserve_price: number | null
          start_time: string | null
          starting_bid: number
          status: Database["public"]["Enums"]["auction_status"]
          title: string
          updated_at: string
          weight: string | null
        }
        Insert: {
          auction_duration?: number
          bid_increment?: number
          bidder_count?: number
          category: string
          condition: Database["public"]["Enums"]["auction_condition"]
          created_at?: string
          created_by: string
          current_bid?: number | null
          description: string
          dimensions?: string | null
          end_time?: string | null
          id?: string
          image_urls?: string[] | null
          provenance?: string | null
          reserve_price?: number | null
          start_time?: string | null
          starting_bid: number
          status?: Database["public"]["Enums"]["auction_status"]
          title: string
          updated_at?: string
          weight?: string | null
        }
        Update: {
          auction_duration?: number
          bid_increment?: number
          bidder_count?: number
          category?: string
          condition?: Database["public"]["Enums"]["auction_condition"]
          created_at?: string
          created_by?: string
          current_bid?: number | null
          description?: string
          dimensions?: string | null
          end_time?: string | null
          id?: string
          image_urls?: string[] | null
          provenance?: string | null
          reserve_price?: number | null
          start_time?: string | null
          starting_bid?: number
          status?: Database["public"]["Enums"]["auction_status"]
          title?: string
          updated_at?: string
          weight?: string | null
        }
        Relationships: []
      }
      bids: {
        Row: {
          amount: number
          auction_id: string
          bidder_id: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          amount: number
          auction_id: string
          bidder_id: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          auction_id?: string
          bidder_id?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          password_reset_required: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          password_reset_required?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          password_reset_required?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_create_user: {
        Args: {
          user_email: string
          user_name: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Returns: Json
      }
      can_user_bid: {
        Args: { user_id: string }
        Returns: boolean
      }
      get_auction_bids_admin: {
        Args: { p_auction_id: string }
        Returns: {
          bid_id: string
          bidder_name: string
          bidder_email: string
          bid_amount: number
          bid_timestamp: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_highest_bidder: {
        Args: { p_auction_id: string }
        Returns: {
          bidder_name: string
          bidder_email: string
          highest_bid: number
          bid_time: string
        }[]
      }
      get_temp_passwords: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_id: string
          user_email: string
          user_name: string
          temporary_password: string
          created_by: string
          created_at: string
          expires_at: string
          password_used: boolean
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_valid_email_domain: {
        Args: { email: string }
        Returns: boolean
      }
      place_bid: {
        Args: { p_auction_id: string; p_bidder_id: string; p_amount: number }
        Returns: Json
      }
    }
    Enums: {
      auction_condition: "excellent" | "very_good" | "good" | "fair" | "poor"
      auction_status: "draft" | "upcoming" | "active" | "ended" | "cancelled"
      user_role: "admin" | "bidder"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      auction_condition: ["excellent", "very_good", "good", "fair", "poor"],
      auction_status: ["draft", "upcoming", "active", "ended", "cancelled"],
      user_role: ["admin", "bidder"],
    },
  },
} as const
