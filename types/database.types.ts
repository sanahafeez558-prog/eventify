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
      audit_logs: {
        Row: {
          id: string
          actor_id: string | null
          actor_email: string | null
          action: string
          target_type: string
          target_id: string | null
          ip_address: string | null
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          actor_email?: string | null
          action: string
          target_type: string
          target_id?: string | null
          ip_address?: string | null
          details?: Json
          created_at?: string
        }
        Update: {
          id?: string
          actor_id?: string | null
          actor_email?: string | null
          action?: string
          target_type?: string
          target_id?: string | null
          ip_address?: string | null
          details?: Json
          created_at?: string
        }
        Relationships: []
      }
      chatbot_sessions: {
        Row: {
          id: string
          session_id: string
          user_id: string | null
          tokens_used: number
          max_tokens: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id?: string | null
          tokens_used?: number
          max_tokens?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string | null
          tokens_used?: number
          max_tokens?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          category_id: string | null
          created_at: string
          description: string
          end_time: string
          event_date: string
          id: string
          image_url: string | null
          location: string
          max_attendees: number
          organizer_id: string
          start_time: string
          status: "draft" | "published" | "cancelled" | "completed"
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description: string
          end_time: string
          event_date: string
          id?: string
          image_url?: string | null
          location: string
          max_attendees: number
          organizer_id: string
          start_time: string
          status?: "draft" | "published" | "cancelled" | "completed"
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string
          end_time?: string
          event_date?: string
          id?: string
          image_url?: string | null
          location?: string
          max_attendees?: number
          organizer_id?: string
          start_time?: string
          status?: "draft" | "published" | "cancelled" | "completed"
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          username: string | null
          phone: string | null
          country_code: string | null
          id: string
          role: "attendee" | "organizer" | "admin"
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          username?: string | null
          phone?: string | null
          country_code?: string | null
          id: string
          role?: "attendee" | "organizer" | "admin"
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          username?: string | null
          phone?: string | null
          country_code?: string | null
          id?: string
          role?: "attendee" | "organizer" | "admin"
          updated_at?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          event_id: string
          id: string
          registered_at: string
          status: "confirmed" | "cancelled"
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registered_at?: string
          status?: "confirmed" | "cancelled"
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registered_at?: string
          status?: "confirmed" | "cancelled"
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]
