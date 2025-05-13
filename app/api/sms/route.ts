import { NextResponse } from 'next/server';
import { generateVerificationCode, sendVerificationSMS, storeVerificationCode, verifyCode } from '@/lib/notion';

// 인증번호 발송
export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) return NextResponse.json({ error: '전화번호가 필요합니다.' }, { status: 400 });
    const code = generateVerificationCode();
    storeVerificationCode(phone, code);
    const sent = await sendVerificationSMS(phone, code);
    if (!sent) return NextResponse.json({ error: '문자 발송 실패' }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

// 인증번호 검증
export async function PUT(req: Request) {
  try {
    const { phone, code } = await req.json();
    if (!phone || !code) return NextResponse.json({ error: '필수 값 누락' }, { status: 400 });
    const valid = verifyCode(phone, code);
    if (!valid) return NextResponse.json({ error: '인증 실패' }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
} 