import axios from 'axios';
import crypto from 'crypto';

// 환경 변수에서 SOLAPI 정보 불러오기
const SOLAPI_API_KEY = process.env.SOLAPI_API_KEY as string;
const SOLAPI_API_SECRET = process.env.SOLAPI_API_SECRET as string;
const SOLAPI_SENDER = process.env.SOLAPI_SENDER as string;

// 인증번호 임시 저장 (실서비스는 DB/Redis 권장)
const verificationStore = new Map<string, { code: string; timestamp: number }>();

// 인증번호 생성 함수
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 문자 발송 함수 (SOLAPI REST API, HMAC-SHA256 인증)
export async function sendVerificationSMS(phone: string, code: string): Promise<boolean> {
  try {
    const date = new Date().toISOString();
    const salt = crypto.randomBytes(12).toString('hex'); // 24자리(12바이트) 랜덤 salt
    const signature = crypto.createHmac('sha256', SOLAPI_API_SECRET)
      .update(date + salt)
      .digest('base64');
    const authorization =
      `HMAC-SHA256 apiKey=${SOLAPI_API_KEY},date=${date},salt=${salt},signature=${signature}`;

    const response = await axios.post(
      'https://api.solapi.com/messages/v4/send',
      {
        messages: [
          {
            to: phone,
            from: SOLAPI_SENDER,
            text: `인증번호는 [${code}] 입니다.`,
          }
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authorization,
        },
      }
    );
    return response.status === 200;
  } catch (error: any) {
    if (error.response) {
      console.error('SMS 전송 실패:', error.response.data);
    } else {
      console.error('SMS 전송 실패:', error);
    }
    return false;
  }
}

// 인증번호 저장
export function storeVerificationCode(phone: string, code: string) {
  verificationStore.set(phone, { code, timestamp: Date.now() });
}

// 인증번호 검증
export function verifyCode(phone: string, code: string): boolean {
  const data = verificationStore.get(phone);
  if (!data) return false;
  // 5분 유효
  if (Date.now() - data.timestamp > 5 * 60 * 1000) {
    verificationStore.delete(phone);
    return false;
  }
  if (data.code === code) {
    verificationStore.delete(phone);
    return true;
  }
  return false;
} 