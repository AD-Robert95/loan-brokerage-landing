import { NextResponse } from 'next/server';
import { appendLoanDataToSheet } from '@/lib/google-sheets';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Supabase Webhook 검증 (필요시)
    // const signature = request.headers.get('x-supabase-signature');
    // if (!validateSignature(payload, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }
    
    // payload.record에는 삽입된 레코드 정보가 포함됨
    const record = payload.record;
    
    if (!record) {
      throw new Error('Webhook 페이로드에 record 필드가 없습니다');
    }
    
    // Google Sheets에 데이터 추가
    const result = await appendLoanDataToSheet(record);
    
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      throw new Error(result.error as string);
    }
  } catch (error) {
    console.error('Webhook 처리 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 