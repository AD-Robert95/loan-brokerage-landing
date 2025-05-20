"use client"

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// TODO: 서버에서 IP 화이트리스트 체크 후 접근 허용 (API/미들웨어)
// TODO: 1차 인증(이메일/비밀번호) 성공 시 2차 인증(보안코드/OTP) UI 노출
// TODO: 실제 인증 로직, 세션/쿠키 저장, 리다이렉트 등 구현 필요

export default function AdminLoginPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secondPassword, setSecondPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1차 인증 핸들러 (실제 인증 로직은 추후 구현)
  const handleFirstLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // TODO: 서버에 이메일/비밀번호, IP 전달 → 인증 및 IP 체크
    // 예시: const res = await fetch('/api/admin/login', ...)
    setTimeout(() => {
      // 임시: 1차 인증 성공 시 2차 인증 단계로
      setStep(2);
      setLoading(false);
    }, 800);
  };

  // 2차 인증 핸들러 (실제 인증 로직은 추후 구현)
  const handleSecondLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // TODO: 서버에 2차 비밀번호(OTP/보안코드) 전달 → 인증
    setTimeout(() => {
      // 임시: 2차 인증 성공 시 어드민 대시보드로 이동
      setLoading(false);
      // window.location.href = "/admin";
    }, 800);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-sm p-6">
        <h2 className="text-xl font-bold mb-4">관리자 로그인</h2>
        {step === 1 && (
          <form onSubmit={handleFirstLogin}>
            <Input
              type="email"
              placeholder="이메일"
              className="mb-3"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="비밀번호"
              className="mb-3"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "확인중..." : "로그인"}
            </Button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleSecondLogin}>
            <Input
              type="password"
              placeholder="2차 비밀번호 (OTP/보안코드)"
              className="mb-3"
              value={secondPassword}
              onChange={e => setSecondPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "확인중..." : "2차 인증 완료"}
            </Button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </form>
        )}
      </Card>
    </main>
  );
} 