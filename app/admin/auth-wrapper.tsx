"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, LogOut, Shield } from "lucide-react";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 컴포넌트 마운트시 기존 인증 정보 체크
    const checkAuthStatus = () => {
      try {
        const authTime = localStorage.getItem('admin_auth_time');
        if (authTime) {
          const now = Date.now();
          const authDate = parseInt(authTime);
          // 24시간 동안 유효 (24 * 60 * 60 * 1000ms)
          if (now - authDate < 24 * 60 * 60 * 1000) {
            setIsAuthorized(true);
          } else {
            // 만료된 인증 정보 제거
            localStorage.removeItem('admin_auth_time');
          }
        }
      } catch (error) {
        // localStorage 접근 오류시 무시
        console.log('localStorage access error:', error);
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const handleAuth = () => {
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin2024!';
    
    if (password === adminPassword) {
      setIsAuthorized(true);
      try {
        localStorage.setItem('admin_auth_time', Date.now().toString());
      } catch (error) {
        console.log('localStorage save error:', error);
      }
      setError('');
      setPassword(''); // 패스워드 입력값 초기화
    } else {
      setError('패스워드가 올바르지 않습니다.');
      setPassword(''); // 잘못된 패스워드 입력값 초기화
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    try {
      localStorage.removeItem('admin_auth_time');
    } catch (error) {
      console.log('localStorage remove error:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAuth();
    }
  };

  // 초기 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 인증되지 않은 경우 로그인 화면 표시
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl">관리자 접근</CardTitle>
            <p className="text-sm text-gray-600">
              대출브라더스 어드민 대시보드
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="password"
                placeholder="관리자 패스워드를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
                autoFocus
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <Button 
              onClick={handleAuth} 
              className="w-full"
              disabled={!password.trim()}
            >
              접속하기
            </Button>
            
            <div className="text-center space-y-1">
              <p className="text-xs text-gray-500">
                로그인 상태는 24시간 동안 유지됩니다.
              </p>
              <p className="text-xs text-gray-400">
                보안을 위해 공용 컴퓨터에서는 사용을 자제해주세요.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 인증된 경우 대시보드와 로그아웃 버튼 표시
  return (
    <div className="relative">
      {/* 로그아웃 버튼 */}
      <div className="fixed top-4 right-4 z-50">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="bg-white shadow-sm hover:bg-gray-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          로그아웃
        </Button>
      </div>
      
      {/* 실제 대시보드 컨텐츠 */}
      {children}
    </div>
  );
} 