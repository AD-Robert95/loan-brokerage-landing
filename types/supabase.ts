export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      loanbrothers: {
        Row: {
          id: string | number  // UUID 또는 숫자 ID
          age: number
          phone_number: string
          location: string
          loan_amount: number
          employed: boolean
          created_at: string
        }
        Insert: {
          id?: string | number // 삽입 시 선택적
          age: number
          phone_number: string
          location: string
          loan_amount: number
          employed: boolean
          created_at?: string // 삽입 시 선택적
        }
        Update: {
          id?: string | number
          age?: number
          phone_number?: string
          location?: string
          loan_amount?: number
          employed?: boolean
          created_at?: string
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
  }
} 