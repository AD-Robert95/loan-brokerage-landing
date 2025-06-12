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
  
  // 1~2인 사업장 보안 강화 상태
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockEndTime, setBlockEndTime] = useState<number | null>(null);
  const [sessionWarning, setSessionWarning] = useState(false);

  useEffect(() => {
    // 컴포넌트 마운트시 기존 인증 정보 체크
    const checkAuthStatus = () => {
      try {
        const authTime = localStorage.getItem('admin_auth_time');
        const attempts = localStorage.getItem('admin_failed_attempts');
        const blockTime = localStorage.getItem('admin_block_time');
        
        // 실패 횟수 복원
        if (attempts) {
          setFailedAttempts(parseInt(attempts));
        }
        
        // 차단 상태 확인
        if (blockTime) {
          const blockEnd = parseInt(blockTime);
          const now = Date.now();
          if (now < blockEnd) {
            setIsBlocked(true);
            setBlockEndTime(blockEnd);
          } else {
            // 차단 시간 만료시 초기화
            localStorage.removeItem('admin_block_time');
            localStorage.removeItem('admin_failed_attempts');
            setFailedAttempts(0);
          }
        }
        
        if (authTime) {
          const now = Date.now();
          const authDate = parseInt(authTime);
          // 2시간 동안 유효 (보안 강화: 24시간 → 2시간)
          if (now - authDate < 2 * 60 * 60 * 1000) {
            setIsAuthorized(true);
            
            // 세션 만료 30분 전 경고 (1시간 30분 후)
            const warningTime = authDate + (1.5 * 60 * 60 * 1000);
            if (now > warningTime) {
              setSessionWarning(true);
            }
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
    
    // 1분마다 세션 상태 체크
    const interval = setInterval(checkAuthStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAuth = () => {
    // 차단 상태 확인
    if (isBlocked && blockEndTime) {
      const remainingTime = Math.ceil((blockEndTime - Date.now()) / 1000 / 60);
      setError(`보안상 ${remainingTime}분 후에 다시 시도해주세요.`);
      return;
    }
    
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin2024!';
    
    if (password === adminPassword) {
      // 성공시 초기화
      setIsAuthorized(true);
      setFailedAttempts(0);
      setIsBlocked(false);
      setBlockEndTime(null);
      
      try {
        localStorage.setItem('admin_auth_time', Date.now().toString());
        localStorage.removeItem('admin_failed_attempts');
        localStorage.removeItem('admin_block_time');
      } catch (error) {
        console.log('localStorage save error:', error);
      }
      setError('');
      setPassword('');
    } else {
      // 실패시 보안 강화 로직
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      
      try {
        localStorage.setItem('admin_failed_attempts', newFailedAttempts.toString());
      } catch (error) {
        console.log('localStorage save error:', error);
      }
      
      if (newFailedAttempts >= 3) {
        // 3회 실패시 15분 차단
        const blockTime = Date.now() + (15 * 60 * 1000);
        setIsBlocked(true);
        setBlockEndTime(blockTime);
        
        try {
          localStorage.setItem('admin_block_time', blockTime.toString());
        } catch (error) {
          console.log('localStorage save error:', error);
        }
        
        setError('3회 연속 실패로 15분간 접근이 차단됩니다.');
      } else {
        setError(`패스워드가 올바르지 않습니다. (${newFailedAttempts}/3회 실패)`);
      }
      
      setPassword('');
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
      {/* 세션 만료 경고 */}
      {sessionWarning && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  세션 만료 경고
                </p>
                <p className="text-xs text-yellow-600">
                  30분 후 자동 로그아웃됩니다. 작업을 저장해주세요.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSessionWarning(false)}
                className="text-yellow-600 border-yellow-300"
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}
      
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