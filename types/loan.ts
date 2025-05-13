// export interface LoanConsultation {
//   id?: string;
//   name: string;
//   phone: string;
//   region: string;
//   employment_status: 'employed' | 'unemployed';
//   loan_amount: number;
//   created_at?: string;
//   status?: 'pending' | 'processing' | 'completed';
// }

// export interface LoanConsultationFormData {
//   name: string;
//   phone: string;
//   region: string;
//   employment_status: 'employed' | 'unemployed';
//   loan_amount: number;
// }

import { Database } from './supabase';

// Database 타입에서 loanbrothers 테이블의 Row 타입을 가져옵니다
export type Lead = Database['public']['Tables']['loanbrothers']['Row'];

// 폼 제출용 타입 (id와 created_at 제외)
export type LoanFormData = Omit<Lead, 'id' | 'created_at'>;

// API 응답 타입
export type LoanResponse = {
  success: boolean;
  error?: unknown;
}; 