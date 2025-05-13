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
    // 현재 시간을 YYYY-MM-DD HH:mm:ss 형식으로 생성
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    
    // YYYY-MM-DD HH:mm:ss 형식으로 포맷팅
    const date = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
    // 고유한 salt 생성 (길이 고정)
    const salt = crypto.randomBytes(16).toString('hex');
    
    // signature 생성: HMAC-SHA256(date + salt, API Secret)
    const message = date + salt;
    const signature = crypto
      .createHmac('sha256', SOLAPI_API_SECRET)
      .update(message)
      .digest('hex');
    
    // 인증 헤더 생성
    const authorization = `HMAC-SHA256 apiKey=${SOLAPI_API_KEY}, date=${date}, salt=${salt}, signature=${signature}`;

    // 디버깅을 위한 로그
    console.log('API 요청 정보:', {
      apiKey: SOLAPI_API_KEY,
      date,
      salt,
      message
    });

    const response = await axios.post(
      'https://api.solapi.com/messages/v4/send',
      {
        message: {
          to: phone,
          from: SOLAPI_SENDER,
          text: `인증번호는 [${code}] 입니다.`,
        }
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
  console.log(`인증번호 저장: ${phone} - ${code}`);
  verificationStore.set(phone, { code, timestamp: Date.now() });
  console.log('현재 저장된 인증번호:', [...verificationStore.entries()].map(([k, v]) => ({ phone: k, code: v.code })));
}

// 인증번호 검증
export function verifyCode(phone: string, code: string): boolean {
  console.log(`인증번호 검증 시도: ${phone} - ${code}`);
  console.log('현재 저장된 인증번호:', [...verificationStore.entries()].map(([k, v]) => ({ phone: k, code: v.code })));
  
  const data = verificationStore.get(phone);
  if (!data) {
    console.log(`${phone}에 대한 인증번호 없음`);
    return false;
  }
  
  // 5분 유효
  if (Date.now() - data.timestamp > 5 * 60 * 1000) {
    console.log(`${phone}에 대한 인증번호 만료됨`);
    verificationStore.delete(phone);
    return false;
  }
  
  if (data.code === code) {
    console.log(`${phone}에 대한 인증 성공`);
    verificationStore.delete(phone);
    return true;
  }
  
  console.log(`${phone}에 대한 인증번호 불일치: 입력=${code}, 저장=${data.code}`);
  return false;
} 