import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import type { Lead } from '@/types/loan';

// 타입 단언으로 any 타입 사용
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
) as any;  // 타입을 any로 단언

type ApiResponse = {
  success: boolean;
  data?: any[];  // 타입을 any[]로 변경
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    // loanbrothers_kst 테이블에서 최근 데이터 5개 조회
    const { data, error } = await supabase
      .from('loanbrothers_kst')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      throw error;
    }
    
    return res.status(200).json({ success: true, data });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
    return res.status(500).json({ success: false, error: errorMessage });
  }
} 