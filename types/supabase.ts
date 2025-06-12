export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type CounselStatus = 
  | 'pending'     // 대기중 (기본값)
  | 'contacted'   // 연락완료
  | 'consulting'  // 상담중  
  | 'completed'   // 상담완료
  | 'cancelled'   // 취소

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
          status?: CounselStatus  // 상담 상태 (선택적 - 기존 데이터 호환성)
          memo?: string  // Phase 3: 메모 (선택적)
        }
        Insert: {
          id?: string | number // 삽입 시 선택적
          age: number
          phone_number: string
          location: string
          loan_amount: number
          employed: boolean
          created_at?: string // 삽입 시 선택적
          status?: CounselStatus // 삽입 시 선택적 (기본값: pending)
          memo?: string // Phase 3: 삽입 시 선택적
        }
        Update: {
          id?: string | number
          age?: number
          phone_number?: string
          location?: string
          loan_amount?: number
          employed?: boolean
          created_at?: string
          status?: CounselStatus // 업데이트 시 선택적
          memo?: string // Phase 3: 업데이트 시 선택적
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