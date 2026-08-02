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
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["account_kind"]
          label: string | null
          merchant_id: string | null
          owner_user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["account_kind"]
          label?: string | null
          merchant_id?: string | null
          owner_user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["account_kind"]
          label?: string | null
          merchant_id?: string | null
          owner_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          code: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          sort_order: number
          threshold_points: number
        }
        Insert: {
          code: string
          created_at?: string
          description: string
          icon?: string
          id?: string
          name: string
          sort_order?: number
          threshold_points?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          sort_order?: number
          threshold_points?: number
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_name: string
          body_md: string
          body_md_en: string | null
          cover_url: string | null
          created_at: string
          excerpt: string
          excerpt_en: string | null
          id: string
          published_at: string | null
          slug: string
          tags: string[]
          title: string
          title_en: string | null
          updated_at: string
        }
        Insert: {
          author_name?: string
          body_md: string
          body_md_en?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt: string
          excerpt_en?: string | null
          id?: string
          published_at?: string | null
          slug: string
          tags?: string[]
          title: string
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          author_name?: string
          body_md?: string
          body_md_en?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string
          excerpt_en?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          tags?: string[]
          title?: string
          title_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          id: string
          merchant_id: string
          multiplier: number
          name: string
          starts_at: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          merchant_id: string
          multiplier?: number
          name: string
          starts_at?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          merchant_id?: string
          multiplier?: number
          name?: string
          starts_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          admin_notes: string | null
          category: string
          created_at: string
          email: string
          id: string
          membership_number: string | null
          message: string
          name: string
          status: string
          subject: string
          submitted_by: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          category: string
          created_at?: string
          email: string
          id?: string
          membership_number?: string | null
          message: string
          name: string
          status?: string
          subject: string
          submitted_by?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          category?: string
          created_at?: string
          email?: string
          id?: string
          membership_number?: string | null
          message?: string
          name?: string
          status?: string
          subject?: string
          submitted_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      earn_challenges: {
        Row: {
          amount_cents: number
          claimed_at: string | null
          claimed_by: string | null
          code: string
          created_at: string
          expires_at: string
          id: string
          issued_by: string
          memo: string | null
          merchant_id: string
          transaction_id: string | null
        }
        Insert: {
          amount_cents: number
          claimed_at?: string | null
          claimed_by?: string | null
          code: string
          created_at?: string
          expires_at: string
          id?: string
          issued_by: string
          memo?: string | null
          merchant_id: string
          transaction_id?: string | null
        }
        Update: {
          amount_cents?: number
          claimed_at?: string | null
          claimed_by?: string | null
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          issued_by?: string
          memo?: string | null
          merchant_id?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "earn_challenges_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "earn_challenges_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_entries: {
        Row: {
          account_id: string
          amount_points: number
          created_at: string
          direction: Database["public"]["Enums"]["entry_direction"]
          id: string
          transaction_id: string
        }
        Insert: {
          account_id: string
          amount_points: number
          created_at?: string
          direction: Database["public"]["Enums"]["entry_direction"]
          id?: string
          transaction_id: string
        }
        Update: {
          account_id?: string
          amount_points?: number
          created_at?: string
          direction?: Database["public"]["Enums"]["entry_direction"]
          id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "ledger_entries_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_funding_ledger: {
        Row: {
          amount_cents: number
          created_at: string
          created_by: string | null
          id: string
          kind: string
          memo: string | null
          merchant_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          created_by?: string | null
          id?: string
          kind: string
          memo?: string | null
          merchant_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          memo?: string | null
          merchant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_funding_ledger_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_funding_wallets: {
        Row: {
          balance_cents: number
          created_at: string
          merchant_id: string
          updated_at: string
        }
        Insert: {
          balance_cents?: number
          created_at?: string
          merchant_id: string
          updated_at?: string
        }
        Update: {
          balance_cents?: number
          created_at?: string
          merchant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_funding_wallets_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: true
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_members: {
        Row: {
          created_at: string
          id: string
          merchant_id: string
          role: Database["public"]["Enums"]["merchant_member_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          merchant_id: string
          role?: Database["public"]["Enums"]["merchant_member_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          merchant_id?: string
          role?: Database["public"]["Enums"]["merchant_member_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_members_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          address: string | null
          brand_color: string | null
          category: string | null
          city: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          location: unknown
          logo_url: string | null
          name: string
          points_per_euro: number
          slug: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          brand_color?: string | null
          category?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location?: unknown
          logo_url?: string | null
          name: string
          points_per_euro?: number
          slug: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          brand_color?: string | null
          category?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location?: unknown
          logo_url?: string | null
          name?: string
          points_per_euro?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      missing_points_claims: {
        Row: {
          amount_cents: number
          created_at: string
          id: string
          merchant_id: string | null
          merchant_name: string | null
          notes: string | null
          purchase_date: string
          reference: string | null
          resolution_txn_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          id?: string
          merchant_id?: string | null
          merchant_name?: string | null
          notes?: string | null
          purchase_date: string
          reference?: string | null
          resolution_txn_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: string
          merchant_id?: string | null
          merchant_name?: string | null
          notes?: string | null
          purchase_date?: string
          reference?: string | null
          resolution_txn_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "missing_points_claims_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missing_points_claims_resolution_txn_id_fkey"
            columns: ["resolution_txn_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json
          id: string
          kind: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          kind: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          kind?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          bonus_points: number
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          is_active: boolean
          merchant_id: string
          min_spend_cents: number
          reward_multiplier: number
          starts_at: string
          title: string
          updated_at: string
        }
        Insert: {
          bonus_points?: number
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          merchant_id: string
          min_spend_cents?: number
          reward_multiplier?: number
          starts_at?: string
          title: string
          updated_at?: string
        }
        Update: {
          bonus_points?: number
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          merchant_id?: string
          min_spend_cents?: number
          reward_multiplier?: number
          starts_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          first_name: string | null
          id: string
          last_name: string | null
          marketing_consent: boolean
          membership_number: string
          phone: string | null
          preferred_language: string
          referral_code: string | null
          referred_by: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          marketing_consent?: boolean
          membership_number?: string
          phone?: string | null
          preferred_language?: string
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          marketing_consent?: boolean
          membership_number?: string
          phone?: string | null
          preferred_language?: string
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_api_keys: {
        Row: {
          created_at: string
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
          scopes: string[]
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          revoked_at?: string | null
          scopes?: string[]
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          scopes?: string[]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_api_keys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_attributions: {
        Row: {
          campaign_id: string | null
          created_at: string
          event_id: string
          funding_source: string
          id: string
          ledger_entry_id: string | null
          membership_id: string
          reward_amount: number
          reward_value_cents: number
          wallet_id: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          event_id: string
          funding_source: string
          id?: string
          ledger_entry_id?: string | null
          membership_id: string
          reward_amount: number
          reward_value_cents?: number
          wallet_id: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          event_id?: string
          funding_source?: string
          id?: string
          ledger_entry_id?: string | null
          membership_id?: string
          reward_amount?: number
          reward_value_cents?: number
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_attributions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "reward_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_attributions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "reward_external_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_attributions_ledger_entry_id_fkey"
            columns: ["ledger_entry_id"]
            isOneToOne: false
            referencedRelation: "reward_ledger_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_attributions_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "reward_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_attributions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "reward_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_campaigns: {
        Row: {
          audience: Json
          budget: Json
          campaign_type: string
          created_at: string
          ends_at: string | null
          id: string
          merchant_id: string | null
          name: string
          reward_rules: Json
          starts_at: string | null
          status: string
          tenant_id: string
          trigger_rules: Json
        }
        Insert: {
          audience?: Json
          budget?: Json
          campaign_type: string
          created_at?: string
          ends_at?: string | null
          id?: string
          merchant_id?: string | null
          name: string
          reward_rules?: Json
          starts_at?: string | null
          status?: string
          tenant_id: string
          trigger_rules?: Json
        }
        Update: {
          audience?: Json
          budget?: Json
          campaign_type?: string
          created_at?: string
          ends_at?: string | null
          id?: string
          merchant_id?: string | null
          name?: string
          reward_rules?: Json
          starts_at?: string | null
          status?: string
          tenant_id?: string
          trigger_rules?: Json
        }
        Relationships: [
          {
            foreignKeyName: "reward_campaigns_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "reward_merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          ends_at: string | null
          id: string
          max_redemptions: number | null
          merchant_id: string | null
          redemption_count: number
          starts_at: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          ends_at?: string | null
          id?: string
          max_redemptions?: number | null
          merchant_id?: string | null
          redemption_count?: number
          starts_at?: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          ends_at?: string | null
          id?: string
          max_redemptions?: number | null
          merchant_id?: string | null
          redemption_count?: number
          starts_at?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_coupons_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "reward_merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_coupons_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_external_events: {
        Row: {
          amount_cents: number | null
          attempts: number
          currency: string | null
          error: string | null
          event_type: string
          id: string
          merchant_id: string | null
          payload: Json
          platform_user_id: string | null
          processed_at: string | null
          provider: string
          provider_event_id: string
          received_at: string
          status: Database["public"]["Enums"]["reward_event_status"]
          tenant_id: string
        }
        Insert: {
          amount_cents?: number | null
          attempts?: number
          currency?: string | null
          error?: string | null
          event_type: string
          id?: string
          merchant_id?: string | null
          payload: Json
          platform_user_id?: string | null
          processed_at?: string | null
          provider: string
          provider_event_id: string
          received_at?: string
          status?: Database["public"]["Enums"]["reward_event_status"]
          tenant_id: string
        }
        Update: {
          amount_cents?: number | null
          attempts?: number
          currency?: string | null
          error?: string | null
          event_type?: string
          id?: string
          merchant_id?: string | null
          payload?: Json
          platform_user_id?: string | null
          processed_at?: string | null
          provider?: string
          provider_event_id?: string
          received_at?: string
          status?: Database["public"]["Enums"]["reward_event_status"]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_external_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_funding_accounts: {
        Row: {
          balance_cents: number
          currency: string
          id: string
          merchant_id: string | null
          minimum_threshold_cents: number
          reserved_cents: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          balance_cents?: number
          currency?: string
          id?: string
          merchant_id?: string | null
          minimum_threshold_cents?: number
          reserved_cents?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          balance_cents?: number
          currency?: string
          id?: string
          merchant_id?: string | null
          minimum_threshold_cents?: number
          reserved_cents?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_funding_accounts_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "reward_merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_funding_accounts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_gift_cards: {
        Row: {
          code: string
          created_at: string
          currency: string
          expires_at: string | null
          id: string
          initial_value_cents: number
          issued_to_membership_id: string | null
          merchant_id: string | null
          remaining_value_cents: number
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          initial_value_cents: number
          issued_to_membership_id?: string | null
          merchant_id?: string | null
          remaining_value_cents: number
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          initial_value_cents?: number
          issued_to_membership_id?: string | null
          merchant_id?: string | null
          remaining_value_cents?: number
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_gift_cards_issued_to_membership_id_fkey"
            columns: ["issued_to_membership_id"]
            isOneToOne: false
            referencedRelation: "reward_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_gift_cards_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "reward_merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_gift_cards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_integrations: {
        Row: {
          config: Json
          created_at: string
          id: string
          integration_type: string
          last_event_at: string | null
          provider: string
          secret_reference: string | null
          status: string
          tenant_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          integration_type: string
          last_event_at?: string | null
          provider: string
          secret_reference?: string | null
          status?: string
          tenant_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          integration_type?: string
          last_event_at?: string | null
          provider?: string
          secret_reference?: string | null
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_integrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_ledger_entries: {
        Row: {
          amount: number
          available_at: string | null
          counterparty_wallet_id: string | null
          created_at: string
          description: string | null
          direction: Database["public"]["Enums"]["reward_entry_direction"]
          expires_at: string | null
          funding_source: string | null
          id: string
          metadata: Json
          reversed_entry_id: string | null
          source: Database["public"]["Enums"]["reward_source"]
          source_reference: string
          status: Database["public"]["Enums"]["reward_entry_status"]
          tenant_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          available_at?: string | null
          counterparty_wallet_id?: string | null
          created_at?: string
          description?: string | null
          direction: Database["public"]["Enums"]["reward_entry_direction"]
          expires_at?: string | null
          funding_source?: string | null
          id?: string
          metadata?: Json
          reversed_entry_id?: string | null
          source: Database["public"]["Enums"]["reward_source"]
          source_reference: string
          status: Database["public"]["Enums"]["reward_entry_status"]
          tenant_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          available_at?: string | null
          counterparty_wallet_id?: string | null
          created_at?: string
          description?: string | null
          direction?: Database["public"]["Enums"]["reward_entry_direction"]
          expires_at?: string | null
          funding_source?: string | null
          id?: string
          metadata?: Json
          reversed_entry_id?: string | null
          source?: Database["public"]["Enums"]["reward_source"]
          source_reference?: string
          status?: Database["public"]["Enums"]["reward_entry_status"]
          tenant_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_ledger_entries_reversed_entry_id_fkey"
            columns: ["reversed_entry_id"]
            isOneToOne: false
            referencedRelation: "reward_ledger_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_ledger_entries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_ledger_entries_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "reward_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_locations: {
        Row: {
          address: Json
          id: string
          merchant_id: string
          name: string
          provider_store_ids: Json
          status: string
          timezone: string
        }
        Insert: {
          address?: Json
          id?: string
          merchant_id: string
          name: string
          provider_store_ids?: Json
          status?: string
          timezone?: string
        }
        Update: {
          address?: Json
          id?: string
          merchant_id?: string
          name?: string
          provider_store_ids?: Json
          status?: string
          timezone?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_locations_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "reward_merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_memberships: {
        Row: {
          external_customer_id: string | null
          family_group_id: string | null
          id: string
          joined_at: string
          membership_number: string
          platform_user_id: string
          preferences: Json
          status: string
          tenant_id: string
          tier: string
        }
        Insert: {
          external_customer_id?: string | null
          family_group_id?: string | null
          id?: string
          joined_at?: string
          membership_number: string
          platform_user_id: string
          preferences?: Json
          status?: string
          tenant_id: string
          tier?: string
        }
        Update: {
          external_customer_id?: string | null
          family_group_id?: string | null
          id?: string
          joined_at?: string
          membership_number?: string
          platform_user_id?: string
          preferences?: Json
          status?: string
          tenant_id?: string
          tier?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_merchants: {
        Row: {
          card_match_rules: Json
          created_at: string
          id: string
          mcc: string | null
          merchant_group: string | null
          name: string
          organisation_id: string | null
          provider_merchant_ids: Json
          status: string
          tenant_id: string
        }
        Insert: {
          card_match_rules?: Json
          created_at?: string
          id?: string
          mcc?: string | null
          merchant_group?: string | null
          name: string
          organisation_id?: string | null
          provider_merchant_ids?: Json
          status?: string
          tenant_id: string
        }
        Update: {
          card_match_rules?: Json
          created_at?: string
          id?: string
          mcc?: string | null
          merchant_group?: string | null
          name?: string
          organisation_id?: string | null
          provider_merchant_ids?: Json
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_merchants_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_onboarding_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          merchant_id: string | null
          notes: string | null
          status: string
          step: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          merchant_id?: string | null
          notes?: string | null
          status?: string
          step: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          merchant_id?: string | null
          notes?: string | null
          status?: string
          step?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_onboarding_progress_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "reward_merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_onboarding_progress_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_outbox: {
        Row: {
          aggregate_id: string | null
          attempts: number
          available_at: string
          created_at: string
          id: string
          payload: Json
          status: string
          tenant_id: string
          topic: string
        }
        Insert: {
          aggregate_id?: string | null
          attempts?: number
          available_at?: string
          created_at?: string
          id?: string
          payload: Json
          status?: string
          tenant_id: string
          topic: string
        }
        Update: {
          aggregate_id?: string | null
          attempts?: number
          available_at?: string
          created_at?: string
          id?: string
          payload?: Json
          status?: string
          tenant_id?: string
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_outbox_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_programmes: {
        Row: {
          conversion: Json
          created_at: string
          currency: Database["public"]["Enums"]["reward_currency"]
          id: string
          name: string
          programme_type: string
          rules: Json
          status: string
          tenant_id: string
        }
        Insert: {
          conversion?: Json
          created_at?: string
          currency: Database["public"]["Enums"]["reward_currency"]
          id?: string
          name: string
          programme_type: string
          rules?: Json
          status?: string
          tenant_id: string
        }
        Update: {
          conversion?: Json
          created_at?: string
          currency?: Database["public"]["Enums"]["reward_currency"]
          id?: string
          name?: string
          programme_type?: string
          rules?: Json
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_programmes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_redemption_orders: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          membership_id: string
          merchant_id: string | null
          payment_provider: string | null
          payment_reference: string | null
          points: number
          status: string
          tenant_id: string
          token_hash: string | null
          value_cents: number
          wallet_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          membership_id: string
          merchant_id?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          points: number
          status?: string
          tenant_id: string
          token_hash?: string | null
          value_cents: number
          wallet_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          membership_id?: string
          merchant_id?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          points?: number
          status?: string
          tenant_id?: string
          token_hash?: string | null
          value_cents?: number
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemption_orders_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "reward_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemption_orders_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "reward_merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemption_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemption_orders_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "reward_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_redemptions: {
        Row: {
          code: string
          cost_points: number
          created_at: string
          id: string
          merchant_id: string
          reward_id: string
          reward_title: string
          status: string
          transaction_id: string | null
          used_at: string | null
          used_by: string | null
          user_id: string
        }
        Insert: {
          code: string
          cost_points: number
          created_at?: string
          id?: string
          merchant_id: string
          reward_id: string
          reward_title: string
          status?: string
          transaction_id?: string | null
          used_at?: string | null
          used_by?: string | null
          user_id: string
        }
        Update: {
          code?: string
          cost_points?: number
          created_at?: string
          id?: string
          merchant_id?: string
          reward_id?: string
          reward_title?: string
          status?: string
          transaction_id?: string | null
          used_at?: string | null
          used_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_subscriptions: {
        Row: {
          billing_interval: string
          created_at: string
          currency: string
          current_period_end: string | null
          id: string
          plan: string
          price_cents: number
          status: string
          tenant_id: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          billing_interval?: string
          created_at?: string
          currency?: string
          current_period_end?: string | null
          id?: string
          plan?: string
          price_cents?: number
          status?: string
          tenant_id: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          billing_interval?: string
          created_at?: string
          currency?: string
          current_period_end?: string | null
          id?: string
          plan?: string
          price_cents?: number
          status?: string
          tenant_id?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_tenant_members: {
        Row: {
          created_at: string
          location_ids: string[]
          role: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          location_ids?: string[]
          role: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          location_ids?: string[]
          role?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_tenant_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_tenants: {
        Row: {
          brand: Json
          created_at: string
          id: string
          mode: Database["public"]["Enums"]["reward_tenant_mode"]
          name: string
          owner_organisation_id: string | null
          settings: Json
          slug: string
          status: string
        }
        Insert: {
          brand?: Json
          created_at?: string
          id?: string
          mode?: Database["public"]["Enums"]["reward_tenant_mode"]
          name: string
          owner_organisation_id?: string | null
          settings?: Json
          slug: string
          status?: string
        }
        Update: {
          brand?: Json
          created_at?: string
          id?: string
          mode?: Database["public"]["Enums"]["reward_tenant_mode"]
          name?: string
          owner_organisation_id?: string | null
          settings?: Json
          slug?: string
          status?: string
        }
        Relationships: []
      }
      reward_wallets: {
        Row: {
          available: number
          id: string
          lifetime_earned: number
          lifetime_redeemed: number
          membership_id: string
          pending: number
          programme_id: string
          updated_at: string
          version: number
        }
        Insert: {
          available?: number
          id?: string
          lifetime_earned?: number
          lifetime_redeemed?: number
          membership_id: string
          pending?: number
          programme_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          available?: number
          id?: string
          lifetime_earned?: number
          lifetime_redeemed?: number
          membership_id?: string
          pending?: number
          programme_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "reward_wallets_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "reward_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_wallets_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "reward_programmes"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          active: boolean
          cost_points: number
          created_at: string
          description: string | null
          id: string
          merchant_id: string
          stock: number | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          cost_points: number
          created_at?: string
          description?: string | null
          id?: string
          merchant_id: string
          stock?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          cost_points?: number
          created_at?: string
          description?: string | null
          id?: string
          merchant_id?: string
          stock?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_periods: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          created_at: string
          id: string
          merchant_id: string
          net_liability_cents: number
          period_end: string
          period_start: string
          points_issued: number
          points_redeemed: number
          status: string
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          id?: string
          merchant_id: string
          net_liability_cents?: number
          period_end: string
          period_start: string
          points_issued?: number
          points_redeemed?: number
          status?: string
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          id?: string
          merchant_id?: string
          net_liability_cents?: number
          period_end?: string
          period_start?: string
          points_issued?: number
          points_redeemed?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_periods_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          actor_user_id: string | null
          created_at: string
          id: string
          idempotency_key: string | null
          kind: Database["public"]["Enums"]["transaction_kind"]
          memo: string | null
          merchant_id: string | null
          metadata: Json
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          id?: string
          idempotency_key?: string | null
          kind: Database["public"]["Enums"]["transaction_kind"]
          memo?: string | null
          merchant_id?: string | null
          metadata?: Json
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          id?: string
          idempotency_key?: string | null
          kind?: Database["public"]["Enums"]["transaction_kind"]
          memo?: string | null
          merchant_id?: string | null
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "transactions_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      zr_api_credentials: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          last_used_at: string | null
          name: string
          public_key: string
          revoked_at: string | null
          scopes: string[]
          secret_hash: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          name: string
          public_key: string
          revoked_at?: string | null
          scopes?: string[]
          secret_hash: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          name?: string
          public_key?: string
          revoked_at?: string | null
          scopes?: string[]
          secret_hash?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zr_api_credentials_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      zr_automations: {
        Row: {
          action_config: Json
          created_at: string
          id: string
          name: string
          status: string
          tenant_id: string
          trigger_config: Json
          trigger_type: string
          updated_at: string
        }
        Insert: {
          action_config?: Json
          created_at?: string
          id?: string
          name: string
          status?: string
          tenant_id: string
          trigger_config?: Json
          trigger_type: string
          updated_at?: string
        }
        Update: {
          action_config?: Json
          created_at?: string
          id?: string
          name?: string
          status?: string
          tenant_id?: string
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "zr_automations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      zr_backup_restore_evidence: {
        Row: {
          backup_reference: string
          created_at: string
          environment: string
          id: string
          ledger_verified: boolean
          restored_at: string
          tenant_isolation_verified: boolean
          verification_notes: string | null
          verified_by: string | null
        }
        Insert: {
          backup_reference: string
          created_at?: string
          environment: string
          id?: string
          ledger_verified?: boolean
          restored_at: string
          tenant_isolation_verified?: boolean
          verification_notes?: string | null
          verified_by?: string | null
        }
        Update: {
          backup_reference?: string
          created_at?: string
          environment?: string
          id?: string
          ledger_verified?: boolean
          restored_at?: string
          tenant_isolation_verified?: boolean
          verification_notes?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      zr_billing_plans: {
        Row: {
          active: boolean
          annual_price_minor: number
          api_request_limit: number | null
          campaign_limit: number | null
          code: string
          created_at: string
          id: string
          location_limit: number | null
          monthly_price_minor: number
          name: string
          staff_limit: number | null
          white_label_enabled: boolean
        }
        Insert: {
          active?: boolean
          annual_price_minor?: number
          api_request_limit?: number | null
          campaign_limit?: number | null
          code: string
          created_at?: string
          id?: string
          location_limit?: number | null
          monthly_price_minor?: number
          name: string
          staff_limit?: number | null
          white_label_enabled?: boolean
        }
        Update: {
          active?: boolean
          annual_price_minor?: number
          api_request_limit?: number | null
          campaign_limit?: number | null
          code?: string
          created_at?: string
          id?: string
          location_limit?: number | null
          monthly_price_minor?: number
          name?: string
          staff_limit?: number | null
          white_label_enabled?: boolean
        }
        Relationships: []
      }
      zr_consent_records: {
        Row: {
          consent_type: string
          created_at: string
          granted: boolean
          id: string
          policy_version: string
          source: string
          user_id: string
        }
        Insert: {
          consent_type: string
          created_at?: string
          granted: boolean
          id?: string
          policy_version: string
          source?: string
          user_id: string
        }
        Update: {
          consent_type?: string
          created_at?: string
          granted?: boolean
          id?: string
          policy_version?: string
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      zr_customer_segments: {
        Row: {
          created_at: string
          description: string | null
          estimated_members: number
          id: string
          name: string
          rules: Json
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          estimated_members?: number
          id?: string
          name: string
          rules?: Json
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          estimated_members?: number
          id?: string
          name?: string
          rules?: Json
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "zr_customer_segments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      zr_gift_cards_v4: {
        Row: {
          code_hash: string
          created_at: string
          deliver_at: string | null
          expires_at: string | null
          id: string
          initial_value_cents: number
          message: string | null
          purchaser_user_id: string | null
          recipient_email: string | null
          remaining_value_cents: number
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          code_hash: string
          created_at?: string
          deliver_at?: string | null
          expires_at?: string | null
          id?: string
          initial_value_cents: number
          message?: string | null
          purchaser_user_id?: string | null
          recipient_email?: string | null
          remaining_value_cents: number
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          code_hash?: string
          created_at?: string
          deliver_at?: string | null
          expires_at?: string | null
          id?: string
          initial_value_cents?: number
          message?: string | null
          purchaser_user_id?: string | null
          recipient_email?: string | null
          remaining_value_cents?: number
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "zr_gift_cards_v4_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      zr_job_runs: {
        Row: {
          completed_at: string | null
          details: Json
          error_count: number
          id: string
          job_name: string
          processed_count: number
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          details?: Json
          error_count?: number
          id?: string
          job_name: string
          processed_count?: number
          started_at?: string
          status: string
        }
        Update: {
          completed_at?: string | null
          details?: Json
          error_count?: number
          id?: string
          job_name?: string
          processed_count?: number
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      zr_launch_acceptance: {
        Row: {
          approved: boolean | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          engineering_passed: boolean
          environment: string
          id: string
          legal_passed: boolean
          notes: string | null
          operations_passed: boolean
          pilot_passed: boolean
          release_name: string
          security_passed: boolean
          updated_at: string
        }
        Insert: {
          approved?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          engineering_passed?: boolean
          environment: string
          id?: string
          legal_passed?: boolean
          notes?: string | null
          operations_passed?: boolean
          pilot_passed?: boolean
          release_name: string
          security_passed?: boolean
          updated_at?: string
        }
        Update: {
          approved?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          engineering_passed?: boolean
          environment?: string
          id?: string
          legal_passed?: boolean
          notes?: string | null
          operations_passed?: boolean
          pilot_passed?: boolean
          release_name?: string
          security_passed?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      zr_liability_snapshots: {
        Row: {
          calculated_at: string
          cashback_minor: number
          funding_available_minor: number
          gift_credit_minor: number
          id: string
          merchant_points_minor: number
          pending_points_minor: number
          redemption_payable_minor: number
          tenant_id: string
          universal_points_minor: number
        }
        Insert: {
          calculated_at?: string
          cashback_minor?: number
          funding_available_minor?: number
          gift_credit_minor?: number
          id?: string
          merchant_points_minor?: number
          pending_points_minor?: number
          redemption_payable_minor?: number
          tenant_id: string
          universal_points_minor?: number
        }
        Update: {
          calculated_at?: string
          cashback_minor?: number
          funding_available_minor?: number
          gift_credit_minor?: number
          id?: string
          merchant_points_minor?: number
          pending_points_minor?: number
          redemption_payable_minor?: number
          tenant_id?: string
          universal_points_minor?: number
        }
        Relationships: [
          {
            foreignKeyName: "zr_liability_snapshots_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      zr_merchant_onboarding_cases: {
        Row: {
          beneficial_owners: Json
          created_at: string
          id: string
          legal_form: string | null
          legal_name: string | null
          registration_number: string | null
          required_actions: Json
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          beneficial_owners?: Json
          created_at?: string
          id?: string
          legal_form?: string | null
          legal_name?: string | null
          registration_number?: string | null
          required_actions?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          beneficial_owners?: Json
          created_at?: string
          id?: string
          legal_form?: string | null
          legal_name?: string | null
          registration_number?: string | null
          required_actions?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "zr_merchant_onboarding_cases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      zr_mobile_devices: {
        Row: {
          biometric_enabled: boolean
          created_at: string
          device_name: string | null
          device_token_hash: string | null
          id: string
          last_seen_at: string
          platform: string
          push_enabled: boolean
          revoked_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          biometric_enabled?: boolean
          created_at?: string
          device_name?: string | null
          device_token_hash?: string | null
          id?: string
          last_seen_at?: string
          platform: string
          push_enabled?: boolean
          revoked_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          biometric_enabled?: boolean
          created_at?: string
          device_name?: string | null
          device_token_hash?: string | null
          id?: string
          last_seen_at?: string
          platform?: string
          push_enabled?: boolean
          revoked_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      zr_monitoring_checks: {
        Row: {
          check_name: string
          checked_at: string
          created_at: string
          details: Json
          id: string
          latency_ms: number | null
          status: string
        }
        Insert: {
          check_name: string
          checked_at?: string
          created_at?: string
          details?: Json
          id?: string
          latency_ms?: number | null
          status: string
        }
        Update: {
          check_name?: string
          checked_at?: string
          created_at?: string
          details?: Json
          id?: string
          latency_ms?: number | null
          status?: string
        }
        Relationships: []
      }
      zr_notification_outbox: {
        Row: {
          attempt_count: number
          channel: string
          created_at: string
          id: string
          last_error: string | null
          next_attempt_at: string | null
          payload: Json
          sent_at: string | null
          status: string
          template_key: string
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          attempt_count?: number
          channel: string
          created_at?: string
          id?: string
          last_error?: string | null
          next_attempt_at?: string | null
          payload?: Json
          sent_at?: string | null
          status?: string
          template_key: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          attempt_count?: number
          channel?: string
          created_at?: string
          id?: string
          last_error?: string | null
          next_attempt_at?: string | null
          payload?: Json
          sent_at?: string | null
          status?: string
          template_key?: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zr_notification_outbox_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      zr_operational_alerts: {
        Row: {
          alert_type: string
          assigned_to: string | null
          created_at: string
          details: Json
          id: string
          resolved_at: string | null
          severity: string
          status: string
          tenant_id: string | null
          title: string
        }
        Insert: {
          alert_type: string
          assigned_to?: string | null
          created_at?: string
          details?: Json
          id?: string
          resolved_at?: string | null
          severity: string
          status?: string
          tenant_id?: string | null
          title: string
        }
        Update: {
          alert_type?: string
          assigned_to?: string | null
          created_at?: string
          details?: Json
          id?: string
          resolved_at?: string | null
          severity?: string
          status?: string
          tenant_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "zr_operational_alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      zr_privacy_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          due_at: string
          id: string
          request_type: string
          status: string
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          due_at?: string
          id?: string
          request_type: string
          status?: string
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          due_at?: string
          id?: string
          request_type?: string
          status?: string
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zr_privacy_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      zr_qr_challenges: {
        Row: {
          action_type: string
          amount_cents: number | null
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          location_id: string | null
          member_id: string | null
          merchant_id: string | null
          nonce: string
          tenant_id: string
          token_hash: string
        }
        Insert: {
          action_type: string
          amount_cents?: number | null
          consumed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          location_id?: string | null
          member_id?: string | null
          merchant_id?: string | null
          nonce: string
          tenant_id: string
          token_hash: string
        }
        Update: {
          action_type?: string
          amount_cents?: number | null
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          location_id?: string | null
          member_id?: string | null
          merchant_id?: string | null
          nonce?: string
          tenant_id?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "zr_qr_challenges_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      zr_reconciliation_runs: {
        Row: {
          actual_minor: number
          completed_at: string | null
          details: Json
          difference_minor: number | null
          expected_minor: number
          id: string
          run_type: string
          started_at: string
          status: string
          tenant_id: string | null
        }
        Insert: {
          actual_minor?: number
          completed_at?: string | null
          details?: Json
          difference_minor?: number | null
          expected_minor?: number
          id?: string
          run_type: string
          started_at?: string
          status?: string
          tenant_id?: string | null
        }
        Update: {
          actual_minor?: number
          completed_at?: string | null
          details?: Json
          difference_minor?: number | null
          expected_minor?: number
          id?: string
          run_type?: string
          started_at?: string
          status?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zr_reconciliation_runs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      zr_release_acceptance: {
        Row: {
          approved: boolean
          approved_at: string | null
          approved_by: string | null
          checklist: Json
          created_at: string
          environment: string
          id: string
          release_name: string
        }
        Insert: {
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          checklist?: Json
          created_at?: string
          environment: string
          id?: string
          release_name: string
        }
        Update: {
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          checklist?: Json
          created_at?: string
          environment?: string
          id?: string
          release_name?: string
        }
        Relationships: []
      }
      zr_release_blockers: {
        Row: {
          area: string
          created_at: string
          details: string | null
          due_at: string | null
          evidence_reference: string | null
          id: string
          owner: string | null
          resolved_at: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          area: string
          created_at?: string
          details?: string | null
          due_at?: string | null
          evidence_reference?: string | null
          id?: string
          owner?: string | null
          resolved_at?: string | null
          severity: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          area?: string
          created_at?: string
          details?: string | null
          due_at?: string | null
          evidence_reference?: string | null
          id?: string
          owner?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      zr_release_security_evidence: {
        Row: {
          created_at: string
          details: Json
          environment: string
          evidence_reference: string | null
          evidence_type: string
          executed_at: string
          executed_by: string | null
          id: string
          release_name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: Json
          environment: string
          evidence_reference?: string | null
          evidence_type: string
          executed_at?: string
          executed_by?: string | null
          id?: string
          release_name: string
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: Json
          environment?: string
          evidence_reference?: string | null
          evidence_type?: string
          executed_at?: string
          executed_by?: string | null
          id?: string
          release_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      zr_scheduled_job_configs: {
        Row: {
          configuration: Json
          created_at: string
          enabled: boolean
          id: string
          job_name: string
          last_run_at: string | null
          next_run_at: string | null
          schedule_expression: string
          updated_at: string
        }
        Insert: {
          configuration?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          job_name: string
          last_run_at?: string | null
          next_run_at?: string | null
          schedule_expression: string
          updated_at?: string
        }
        Update: {
          configuration?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          job_name?: string
          last_run_at?: string | null
          next_run_at?: string | null
          schedule_expression?: string
          updated_at?: string
        }
        Relationships: []
      }
      zr_security_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          reasons: Json
          risk_score: number
          severity: string
          status: string
          tenant_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          reasons?: Json
          risk_score?: number
          severity: string
          status?: string
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          reasons?: Json
          risk_score?: number
          severity?: string
          status?: string
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zr_security_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      zr_stamp_cards: {
        Row: {
          completed_count: number
          created_at: string
          current_stamps: number
          id: string
          member_id: string
          programme_name: string
          reward_description: string
          stamps_required: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          completed_count?: number
          created_at?: string
          current_stamps?: number
          id?: string
          member_id: string
          programme_name: string
          reward_description: string
          stamps_required: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          completed_count?: number
          created_at?: string
          current_stamps?: number
          id?: string
          member_id?: string
          programme_name?: string
          reward_description?: string
          stamps_required?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "zr_stamp_cards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      zr_subscriptions_v2: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          provider_customer_id: string | null
          provider_subscription_id: string | null
          status: string
          tenant_id: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          tenant_id: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          tenant_id?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "zr_subscriptions_v2_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "zr_billing_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zr_subscriptions_v2_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      zr_support_case_events: {
        Row: {
          actor_user_id: string | null
          case_id: string
          created_at: string
          event_type: string
          id: string
          metadata: Json
          note: string | null
        }
        Insert: {
          actor_user_id?: string | null
          case_id: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          note?: string | null
        }
        Update: {
          actor_user_id?: string | null
          case_id?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zr_support_case_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "zr_support_cases_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      zr_support_cases_v2: {
        Row: {
          assigned_to: string | null
          case_type: string
          created_at: string
          description: string | null
          due_at: string | null
          id: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          tenant_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          case_type: string
          created_at?: string
          description?: string | null
          due_at?: string | null
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          case_type?: string
          created_at?: string
          description?: string | null
          due_at?: string | null
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zr_support_cases_v2_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "reward_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      account_balances: {
        Row: {
          account_id: string | null
          balance_points: number | null
          kind: Database["public"]["Enums"]["account_kind"] | null
          merchant_id: string | null
          owner_user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      admin_close_settlement: {
        Args: { _settlement_id: string }
        Returns: undefined
      }
      admin_list_complaints: {
        Args: never
        Returns: {
          admin_notes: string | null
          category: string
          created_at: string
          email: string
          id: string
          membership_number: string | null
          message: string
          name: string
          status: string
          subject: string
          submitted_by: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "complaints"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_list_merchants: {
        Args: never
        Returns: {
          address: string | null
          brand_color: string | null
          category: string | null
          city: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          location: unknown
          logo_url: string | null
          name: string
          points_per_euro: number
          slug: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "merchants"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_platform_series: {
        Args: never
        Returns: {
          day: string
          earned: number
          new_users: number
          redeemed: number
        }[]
      }
      admin_recent_audit: {
        Args: { _limit?: number }
        Returns: {
          action: string
          actor_user_id: string | null
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string
          id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "audit_log"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_resolve_claim: {
        Args: { _approve: boolean; _claim_id: string; _points?: number }
        Returns: Json
      }
      admin_set_merchant_active: {
        Args: { _active: boolean; _merchant_id: string }
        Returns: undefined
      }
      admin_top_merchants: {
        Args: { _limit?: number }
        Returns: {
          earned: number
          merchant_id: string
          name: string
          redeemed: number
          slug: string
          txns: number
        }[]
      }
      admin_update_complaint: {
        Args: { _id: string; _notes: string; _status: string }
        Returns: {
          admin_notes: string | null
          category: string
          created_at: string
          email: string
          id: string
          membership_number: string | null
          message: string
          name: string
          status: string
          subject: string
          submitted_by: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "complaints"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      apply_referral: {
        Args: { _code: string; _user_id: string }
        Returns: Json
      }
      award_badges_for_user: { Args: { _user_id: string }; Returns: number }
      claim_earn_challenge: {
        Args: { _code: string; _user_id: string }
        Returns: {
          merchant_name: string
          offer_title: string
          points_awarded: number
          transaction_id: string
        }[]
      }
      compute_settlement: {
        Args: { _merchant_id: string; _period_start: string }
        Returns: string
      }
      create_merchant_with_owner: {
        Args: {
          _brand_color: string
          _category: string
          _description: string
          _name: string
          _points_per_euro: number
          _slug: string
        }
        Returns: string
      }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      earn_points: {
        Args: {
          _amount: number
          _idempotency_key: string
          _memo?: string
          _merchant_id: string
          _user_id: string
        }
        Returns: string
      }
      enablelongtransactions: { Args: never; Returns: string }
      ensure_user_wallet: { Args: { _user_id: string }; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      gen_referral_code: { Args: never; Returns: string }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_wallet_balance: { Args: { _user_id: string }; Returns: number }
      gettransactionid: { Args: never; Returns: unknown }
      global_search: {
        Args: { _limit?: number; _q: string }
        Returns: {
          id: string
          image_url: string
          kind: string
          score: number
          slug: string
          subtitle: string
          title: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_merchant_member: {
        Args: {
          _merchant_id: string
          _min_role?: Database["public"]["Enums"]["merchant_member_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_reward_tenant_member: {
        Args: { _tenant_id: string }
        Returns: boolean
      }
      list_settlements: {
        Args: { _merchant_id: string }
        Returns: {
          closed_at: string | null
          closed_by: string | null
          created_at: string
          id: string
          merchant_id: string
          net_liability_cents: number
          period_end: string
          period_start: string
          points_issued: number
          points_redeemed: number
          status: string
        }[]
        SetofOptions: {
          from: "*"
          to: "settlement_periods"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      longtransactionsenabled: { Args: never; Returns: boolean }
      lookup_customer_by_membership: {
        Args: { _membership: string; _merchant_id: string }
        Returns: {
          display_name: string
          membership_number: string
          user_id: string
        }[]
      }
      merchant_analytics_series: {
        Args: { _merchant_id: string }
        Returns: {
          day: string
          earned: number
          redeemed: number
          txn_count: number
        }[]
      }
      merchant_deposit_funds: {
        Args: { _amount_cents: number; _memo?: string; _merchant_id: string }
        Returns: string
      }
      merchant_earn_points: {
        Args: {
          _amount: number
          _customer_user_id: string
          _idempotency_key: string
          _memo?: string
          _merchant_id: string
        }
        Returns: string
      }
      merchant_funding_overview: {
        Args: { _merchant_id: string }
        Returns: {
          balance_cents: number
          ledger: Json
        }[]
      }
      merchant_redeem_points: {
        Args: {
          _amount: number
          _customer_user_id: string
          _idempotency_key: string
          _memo?: string
          _merchant_id: string
        }
        Returns: string
      }
      merchant_top_customers: {
        Args: { _limit?: number; _merchant_id: string }
        Returns: {
          display_name: string
          earned: number
          redeemed: number
          user_id: string
          visits: number
        }[]
      }
      nearby_merchants: {
        Args: { _lat: number; _lng: number; _radius_m?: number }
        Returns: {
          address: string
          brand_color: string
          category: string
          city: string
          distance_m: number
          id: string
          latitude: number
          longitude: number
          name: string
          points_per_euro: number
          slug: string
        }[]
      }
      platform_admin_overview: { Args: never; Returns: Json }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      redeem_points: {
        Args: {
          _amount: number
          _idempotency_key: string
          _memo?: string
          _merchant_id?: string
          _user_id: string
        }
        Returns: string
      }
      redeem_reward: {
        Args: { _idempotency_key: string; _reward_id: string; _user_id: string }
        Returns: {
          code: string
          redemption_id: string
          transaction_id: string
        }[]
      }
      reward_ensure_membership: {
        Args: { _tenant: string; _user: string }
        Returns: string
      }
      reward_ensure_wallet: {
        Args: { _membership: string; _programme: string }
        Returns: string
      }
      reward_is_tenant_member: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      reward_post_entry: {
        Args: {
          p_amount: number
          p_description?: string
          p_direction: Database["public"]["Enums"]["reward_entry_direction"]
          p_metadata?: Json
          p_reference: string
          p_source: Database["public"]["Enums"]["reward_source"]
          p_status: Database["public"]["Enums"]["reward_entry_status"]
          p_wallet_id: string
        }
        Returns: string
      }
      reward_process_event: { Args: { _event_id: string }; Returns: Json }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
      use_reward_code: {
        Args: { _code: string; _merchant_id: string; _staff_user_id: string }
        Returns: {
          cost_points: number
          customer_user_id: string
          redemption_id: string
          reward_title: string
        }[]
      }
      write_audit: {
        Args: {
          _action: string
          _details?: Json
          _entity_id: string
          _entity_type: string
        }
        Returns: undefined
      }
      zr_create_liability_snapshot: {
        Args: { p_tenant_id: string }
        Returns: string
      }
      zr_enforce_funding_thresholds: { Args: never; Returns: number }
      zr_execute_reward_action: {
        Args: {
          p_actor: string
          p_entries: Json
          p_idempotency_key: string
          p_metadata?: Json
          p_tenant_id: string
          p_transaction_type: string
        }
        Returns: Json
      }
      zr_has_tenant_role: {
        Args: { allowed_roles: string[]; target_tenant: string }
        Returns: boolean
      }
      zr_qr_consume: { Args: { p_token_hash: string }; Returns: Json }
      zr_qr_issue: {
        Args: {
          p_action_type: string
          p_amount_cents: number
          p_location_id: string
          p_member_id: string
          p_merchant_id: string
          p_nonce: string
          p_tenant_id: string
          p_token_hash: string
          p_ttl_seconds?: number
        }
        Returns: string
      }
      zr_queue_notification: {
        Args: {
          p_channel: string
          p_payload?: Json
          p_template_key: string
          p_tenant_id: string
          p_user_id: string
        }
        Returns: string
      }
      zr_reverse_reward_transaction: {
        Args: {
          p_idempotency_key: string
          p_original_reference: string
          p_reason: string
          p_tenant_id: string
        }
        Returns: Json
      }
      zr_update_campaign_states: { Args: never; Returns: number }
    }
    Enums: {
      account_kind:
        | "user_wallet"
        | "merchant_liability"
        | "system_issuance"
        | "system_expense"
      app_role:
        | "consumer"
        | "family_admin"
        | "family_member"
        | "premium"
        | "merchant_owner"
        | "merchant_admin"
        | "finance_manager"
        | "marketing_manager"
        | "location_manager"
        | "cashier"
        | "analyst"
        | "super_admin"
        | "ops_admin"
        | "support"
        | "merchant_support"
        | "finance_admin"
        | "fraud_analyst"
        | "compliance_officer"
        | "campaign_admin"
        | "affiliate_manager"
        | "auditor"
        | "admin"
      entry_direction: "debit" | "credit"
      merchant_member_role: "owner" | "manager" | "staff"
      reward_currency:
        | "universal_points"
        | "merchant_points"
        | "cashback_cents"
        | "gift_credit_cents"
        | "promo_credit_cents"
      reward_entry_direction: "credit" | "debit"
      reward_entry_status:
        | "pending"
        | "available"
        | "reversed"
        | "expired"
        | "cancelled"
      reward_event_status:
        | "received"
        | "processing"
        | "processed"
        | "ignored"
        | "failed"
      reward_source:
        | "card"
        | "payment"
        | "qr"
        | "affiliate"
        | "referral"
        | "campaign"
        | "manual"
        | "gift_card"
        | "loungetech_app"
        | "adjustment"
      reward_tenant_mode: "standalone" | "zoryn_integrated" | "white_label"
      transaction_kind: "earn" | "redeem" | "adjust" | "transfer" | "expire"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
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
      account_kind: [
        "user_wallet",
        "merchant_liability",
        "system_issuance",
        "system_expense",
      ],
      app_role: [
        "consumer",
        "family_admin",
        "family_member",
        "premium",
        "merchant_owner",
        "merchant_admin",
        "finance_manager",
        "marketing_manager",
        "location_manager",
        "cashier",
        "analyst",
        "super_admin",
        "ops_admin",
        "support",
        "merchant_support",
        "finance_admin",
        "fraud_analyst",
        "compliance_officer",
        "campaign_admin",
        "affiliate_manager",
        "auditor",
        "admin",
      ],
      entry_direction: ["debit", "credit"],
      merchant_member_role: ["owner", "manager", "staff"],
      reward_currency: [
        "universal_points",
        "merchant_points",
        "cashback_cents",
        "gift_credit_cents",
        "promo_credit_cents",
      ],
      reward_entry_direction: ["credit", "debit"],
      reward_entry_status: [
        "pending",
        "available",
        "reversed",
        "expired",
        "cancelled",
      ],
      reward_event_status: [
        "received",
        "processing",
        "processed",
        "ignored",
        "failed",
      ],
      reward_source: [
        "card",
        "payment",
        "qr",
        "affiliate",
        "referral",
        "campaign",
        "manual",
        "gift_card",
        "loungetech_app",
        "adjustment",
      ],
      reward_tenant_mode: ["standalone", "zoryn_integrated", "white_label"],
      transaction_kind: ["earn", "redeem", "adjust", "transfer", "expire"],
    },
  },
} as const
