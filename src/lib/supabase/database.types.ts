export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type InvitationStatus = "draft" | "pending_payment" | "published" | "archived";

export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded";

export type RsvpStatus = "coming" | "not_coming" | "pending";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      template_categories: {
        Row: {
          id: string;
          label: string;
          description: string;
        };
        Insert: {
          id: string;
          label: string;
          description?: string;
        };
        Update: {
          id?: string;
          label?: string;
          description?: string;
        };
        Relationships: [];
      };
      templates: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          vibe: string;
          preview_couple: string;
          preview_date: string;
          preview_place: string;
          featured_on_landing: boolean;
          featured_in_gallery: boolean;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          category_id: string;
          name: string;
          vibe?: string;
          preview_couple?: string;
          preview_date?: string;
          preview_place?: string;
          featured_on_landing?: boolean;
          featured_in_gallery?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          vibe?: string;
          preview_couple?: string;
          preview_date?: string;
          preview_place?: string;
          featured_on_landing?: boolean;
          featured_in_gallery?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      invitations: {
        Row: {
          id: string;
          owner_id: string;
          template_id: string;
          slug: string;
          partner_a_name: string;
          partner_b_name: string;
          wedding_date: string | null;
          venue_name: string;
          venue_address: string;
          story: string;
          content: Json;
          status: InvitationStatus;
          payment_status: PaymentStatus;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          template_id: string;
          slug: string;
          partner_a_name?: string;
          partner_b_name?: string;
          wedding_date?: string | null;
          venue_name?: string;
          venue_address?: string;
          story?: string;
          content?: Json;
          status?: InvitationStatus;
          payment_status?: PaymentStatus;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          template_id?: string;
          slug?: string;
          partner_a_name?: string;
          partner_b_name?: string;
          wedding_date?: string | null;
          venue_name?: string;
          venue_address?: string;
          story?: string;
          content?: Json;
          status?: InvitationStatus;
          payment_status?: PaymentStatus;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invitation_photos: {
        Row: {
          id: string;
          invitation_id: string;
          storage_path: string;
          caption: string;
          sort_order: number;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          storage_path: string;
          caption?: string;
          sort_order?: number;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          invitation_id?: string;
          storage_path?: string;
          caption?: string;
          sort_order?: number;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      guests: {
        Row: {
          id: string;
          invitation_id: string;
          name: string;
          email: string | null;
          personalization_key: string | null;
          guest_group: string;
          note: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          name: string;
          email?: string | null;
          personalization_key?: string | null;
          guest_group?: string;
          note?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          invitation_id?: string;
          name?: string;
          email?: string | null;
          personalization_key?: string | null;
          guest_group?: string;
          note?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      rsvps: {
        Row: {
          id: string;
          invitation_id: string;
          guest_id: string | null;
          guest_name: string;
          status: RsvpStatus;
          party_size: number;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          guest_id?: string | null;
          guest_name: string;
          status?: RsvpStatus;
          party_size?: number;
          message?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          invitation_id?: string;
          guest_id?: string | null;
          guest_name?: string;
          status?: RsvpStatus;
          party_size?: number;
          message?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          invitation_id: string;
          amount_cents: number;
          currency: string;
          provider: string;
          provider_ref: string | null;
          status: PaymentStatus;
          invoice_number: string | null;
          checkout_url: string | null;
          expires_at: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          amount_cents: number;
          currency?: string;
          provider?: string;
          provider_ref?: string | null;
          status?: PaymentStatus;
          invoice_number?: string | null;
          checkout_url?: string | null;
          expires_at?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invitation_id?: string;
          amount_cents?: number;
          currency?: string;
          provider?: string;
          provider_ref?: string | null;
          status?: PaymentStatus;
          invoice_number?: string | null;
          checkout_url?: string | null;
          expires_at?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_users: {
        Row: {
          user_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      admin_audit_log: {
        Row: {
          id: number;
          admin_id: string | null;
          action: string;
          target_type: string;
          target_id: string | null;
          details: Json;
          created_at: string;
        };
        Insert: {
          admin_id?: string | null;
          action: string;
          target_type: string;
          target_id?: string | null;
          details?: Json;
          created_at?: string;
        };
        Update: {
          admin_id?: string | null;
          action?: string;
          target_type?: string;
          target_id?: string | null;
          details?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      resolve_guest_by_key: {
        Args: {
          p_invitation_id: string;
          p_key: string;
        };
        Returns: {
          id: string;
          name: string;
        }[];
      };
      mark_invitation_paid: {
        Args: { p_payment_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      invitation_status: InvitationStatus;
      payment_status: PaymentStatus;
      rsvp_status: RsvpStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
