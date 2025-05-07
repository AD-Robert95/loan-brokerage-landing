export interface LoanConsultation {
  id?: string;
  name: string;
  phone: string;
  region: string;
  employment_status: 'employed' | 'unemployed';
  loan_amount: number;
  created_at?: string;
  status?: 'pending' | 'processing' | 'completed';
}

export interface LoanConsultationFormData {
  name: string;
  phone: string;
  region: string;
  employment_status: 'employed' | 'unemployed';
  loan_amount: number;
} 