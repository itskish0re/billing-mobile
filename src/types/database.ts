export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      financial_year: {
        Row: {
          financial_year_id: number;
          code: string;
          name: string;
          is_enabled: boolean;
          is_active: boolean;
          is_deleted: boolean;
        };
        Insert: {
          financial_year_id?: number;
          code: string;
          name: string;
          is_enabled?: boolean;
          is_active?: boolean;
          is_deleted?: boolean;
        };
        Update: {
          financial_year_id?: number;
          code?: string;
          name?: string;
          is_enabled?: boolean;
          is_active?: boolean;
          is_deleted?: boolean;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role_id: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role_id: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role_id?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      suggest_next_bill_number: {
        Args: { p_financial_year_id: number };
        Returns: string;
      };
      heartbeat: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
