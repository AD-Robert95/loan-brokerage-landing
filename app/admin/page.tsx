"use client";

import AuthWrapper from './auth-wrapper';
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  MapPin, 
  RefreshCw, 
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  UserCheck,
  UserX,
  Phone,
  Eye,
  EyeOff,
  Download,
  Filter,
  FileSpreadsheet
} from "lucide-react";
import { createClient } from '@supabase/supabase-js';
import type { Database, CounselStatus } from '@/types/supabase';
import * as XLSX from 'xlsx';
import { format } from "date-fns";
import { ko } from "date-fns/locale";

// TODO: 추후 서버 연동 및 인증 처리 필요
// TODO: 로그인/권한 체크 후 접근 허용
// TODO: DB 연동 시 getServerSideProps 또는 server component로 데이터 fetch

// 목업 데이터 (현재 날짜 기준으로 생성)
const generateMockData = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return [
    {
      id: "clxyz1",
      name: "홍길동",
      phone: "010-1234-5678",
      createdAt: new Date(today.getTime() - (2 * 60 * 60 * 1000)).toISOString(), // 오늘 2시간 전
      status: "대기중",
    },
    {
      id: "clxyz2",
      name: "김철수",
      phone: "010-2345-6789",
      createdAt: new Date(today.getTime() - (24 * 60 * 60 * 1000)).toISOString(), // 어제
      status: "상담완료",
    },
    {
      id: "clxyz3",
      name: "박영희",
      phone: "010-3456-7890",
      createdAt: new Date(today.getTime() - (6 * 60 * 60 * 1000)).toISOString(), // 오늘 6시간 전
      status: "연락완료",
    },
    {
      id: "clxyz4",
      name: "이민수",
      phone: "010-4567-8901",
      createdAt: new Date(today.getTime() - (3 * 24 * 60 * 60 * 1000)).toISOString(), // 3일 전
      status: "상담중",
    },
    {
      id: "clxyz5",
      name: "정수진",
      phone: "010-5678-9012",
      createdAt: new Date(today.getTime() - (30 * 60 * 1000)).toISOString(), // 오늘 30분 전
      status: "pending",
    }
  ];
};

const mockCounsels = generateMockData();

// Supabase 클라이언트 설정
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 타입 정의
type Lead = Database['public']['Tables']['loanbrothers']['Row'];

// PRD Phase 2: 날짜 필터 타입 정의
type DateFilterPreset = 
  | 'today'        // 오늘
  | 'yesterday'    // 어제  
  | 'thisWeek'     // 이번 주
  | 'lastWeek'     // 지난 주
  | 'thisMonth'    // 이번 달
  | 'lastMonth'    // 지난 달
  | 'custom';      // 사용자 정의

interface DateFilter {
  preset: DateFilterPreset;
  startDate?: Date;
  endDate?: Date;
}

interface DashboardStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
}

interface EmploymentStats {
  employed: number;
  unemployed: number;
}

interface LocationStats {
  location: string;
  count: number;
}

interface DashboardData {
  applications: Lead[];
  stats: DashboardStats;
  employmentStats: EmploymentStats;
  locationStats: LocationStats[];
}

// 유틸리티 함수
function maskPhone(phone: string) {
  return phone.replace(/(\d{3})(\d{2,4})(\d{4})/, '$1-****-$3');
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
}

function getStatusVariant(status?: CounselStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'pending':
      return 'outline';
    case 'contacted':
      return 'secondary';
    case 'consulting':
      return 'default';
    case 'completed':
      return 'default';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
}

function getStatusLabel(status?: CounselStatus) {
  switch (status) {
    case 'pending':
      return '대기중';
    case 'contacted':
      return '연락완료';
    case 'consulting':
      return '상담중';
    case 'completed':
      return '상담완료';
    case 'cancelled':
      return '취소';
    default:
      return '대기중';
  }
}

function getStatusColor(status?: CounselStatus) {
  switch (status) {
    case 'pending':
      return 'bg-gray-100 text-gray-800';
    case 'contacted':
      return 'bg-blue-100 text-blue-800';
    case 'consulting':
      return 'bg-orange-100 text-orange-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// PRD Phase 2: 날짜 범위 계산 함수 (한국 시간대 문제 해결)
function getDateRange(filter: DateFilter): { startDate: Date; endDate: Date } {
  // 한국 시간 기준으로 현재 시간 계산
  const now = new Date();
  const kstOffset = 9 * 60; // 한국 시간 오프셋 (분)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const kstNow = new Date(utc + (kstOffset * 60000));
  
  // 한국 시간 기준 오늘 00:00:00
  const kstToday = new Date(kstNow.getFullYear(), kstNow.getMonth(), kstNow.getDate());
  
  switch (filter.preset) {
    case 'today':
      // 오늘 00:00:00 KST ~ 23:59:59 KST
      const todayStart = new Date(kstToday.getTime() - (9 * 60 * 60 * 1000)); // UTC로 변환
      const todayEnd = new Date(todayStart.getTime() + (24 * 60 * 60 * 1000) - 1);
      return { startDate: todayStart, endDate: todayEnd };
    
    case 'yesterday':
      // 어제 00:00:00 KST ~ 23:59:59 KST
      const yesterdayKst = new Date(kstToday.getTime() - (24 * 60 * 60 * 1000));
      const yesterdayStart = new Date(yesterdayKst.getTime() - (9 * 60 * 60 * 1000)); // UTC로 변환
      const yesterdayEnd = new Date(yesterdayStart.getTime() + (24 * 60 * 60 * 1000) - 1);
      return { startDate: yesterdayStart, endDate: yesterdayEnd };
    
    case 'thisWeek':
      // 이번 주 일요일 00:00:00 KST ~ 토요일 23:59:59 KST
      const thisWeekStartKst = new Date(kstToday);
      thisWeekStartKst.setDate(kstToday.getDate() - kstToday.getDay()); // 일요일로 설정
      const thisWeekStart = new Date(thisWeekStartKst.getTime() - (9 * 60 * 60 * 1000)); // UTC로 변환
      const thisWeekEnd = new Date(thisWeekStart.getTime() + (7 * 24 * 60 * 60 * 1000) - 1);
      return { startDate: thisWeekStart, endDate: thisWeekEnd };
    
    case 'lastWeek':
      // 지난 주 일요일 00:00:00 KST ~ 토요일 23:59:59 KST
      const lastWeekStartKst = new Date(kstToday);
      lastWeekStartKst.setDate(kstToday.getDate() - kstToday.getDay() - 7); // 지난 주 일요일
      const lastWeekStart = new Date(lastWeekStartKst.getTime() - (9 * 60 * 60 * 1000)); // UTC로 변환
      const lastWeekEnd = new Date(lastWeekStart.getTime() + (7 * 24 * 60 * 60 * 1000) - 1);
      return { startDate: lastWeekStart, endDate: lastWeekEnd };
    
    case 'thisMonth':
      // 이번 달 1일 00:00:00 KST ~ 마지막 날 23:59:59 KST
      const thisMonthStartKst = new Date(kstNow.getFullYear(), kstNow.getMonth(), 1);
      const thisMonthEndKst = new Date(kstNow.getFullYear(), kstNow.getMonth() + 1, 0, 23, 59, 59, 999);
      const thisMonthStart = new Date(thisMonthStartKst.getTime() - (9 * 60 * 60 * 1000)); // UTC로 변환
      const thisMonthEnd = new Date(thisMonthEndKst.getTime() - (9 * 60 * 60 * 1000)); // UTC로 변환
      return { startDate: thisMonthStart, endDate: thisMonthEnd };
    
    case 'lastMonth':
      // 지난 달 1일 00:00:00 KST ~ 마지막 날 23:59:59 KST
      const lastMonthStartKst = new Date(kstNow.getFullYear(), kstNow.getMonth() - 1, 1);
      const lastMonthEndKst = new Date(kstNow.getFullYear(), kstNow.getMonth(), 0, 23, 59, 59, 999);
      const lastMonthStart = new Date(lastMonthStartKst.getTime() - (9 * 60 * 60 * 1000)); // UTC로 변환
      const lastMonthEnd = new Date(lastMonthEndKst.getTime() - (9 * 60 * 60 * 1000)); // UTC로 변환
      return { startDate: lastMonthStart, endDate: lastMonthEnd };
    
    case 'custom':
      if (filter.startDate && filter.endDate) {
        // 사용자 정의 날짜도 한국 시간 기준으로 처리
        const customStart = new Date(filter.startDate.getTime() - (9 * 60 * 60 * 1000)); // UTC로 변환
        const customEnd = new Date(filter.endDate.getTime() - (9 * 60 * 60 * 1000) + (24 * 60 * 60 * 1000) - 1); // UTC로 변환
        return { startDate: customStart, endDate: customEnd };
      }
      // fallback to today
      const fallbackStart = new Date(kstToday.getTime() - (9 * 60 * 60 * 1000));
      const fallbackEnd = new Date(fallbackStart.getTime() + (24 * 60 * 60 * 1000) - 1);
      return { startDate: fallbackStart, endDate: fallbackEnd };
    
    default:
      // 기본값: 이번 주
      const defaultWeekStartKst = new Date(kstToday);
      defaultWeekStartKst.setDate(kstToday.getDate() - kstToday.getDay());
      const defaultStart = new Date(defaultWeekStartKst.getTime() - (9 * 60 * 60 * 1000));
      const defaultEnd = new Date(defaultStart.getTime() + (7 * 24 * 60 * 60 * 1000) - 1);
      return { startDate: defaultStart, endDate: defaultEnd };
  }
}

// PRD Phase 2: 날짜 필터 라벨 함수
function getDateFilterLabel(filter: DateFilter): string {
  switch (filter.preset) {
    case 'today':
      return '오늘';
    case 'yesterday':
      return '어제';
    case 'thisWeek':
      return '이번 주';
    case 'lastWeek':
      return '지난 주';
    case 'thisMonth':
      return '이번 달';
    case 'lastMonth':
      return '지난 달';
    case 'custom':
      if (filter.startDate && filter.endDate) {
        return `${format(filter.startDate, 'MM/dd', { locale: ko })} ~ ${format(filter.endDate, 'MM/dd', { locale: ko })}`;
      }
      return '사용자 정의';
    default:
      return '이번 주';
  }
}

// PRD Phase 2: 엑셀 파일명 생성 함수
function generateExcelFileName(filter: DateFilter): string {
  const now = new Date();
  const timestamp = format(now, 'yyyy-MM-dd_HHmm');
  const filterLabel = getDateFilterLabel(filter);
  
  return `대출신청목록_${filterLabel}_${timestamp}.xlsx`;
}

// 간단한 파이 차트 컴포넌트
interface SimpleBarChartProps {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
}

function SimpleBarChart({ data, maxValue }: SimpleBarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));
  
  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-20 text-sm text-gray-600 truncate">
            {item.label}
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-in-out"
              style={{ 
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.color || '#3b82f6'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
              {item.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 도넛 차트를 위한 간단한 컴포넌트
interface SimplePieChartProps {
  data: { label: string; value: number; color: string }[];
}

function SimplePieChart({ data }: SimplePieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* 간단한 시각적 표현 */}
      <div className="grid grid-cols-2 gap-4 w-full">
        {data.map((item, index) => (
          <div key={index} className="text-center p-4 rounded-lg border">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: item.color }}
            >
              {item.value}
            </div>
            <div className="text-sm font-medium">{item.label}</div>
            <div className="text-xs text-gray-500">
              {total > 0 ? `${((item.value / total) * 100).toFixed(1)}%` : '0%'}
            </div>
          </div>
        ))}
      </div>
      
      {/* 비율 바 */}
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        {data.map((item, index) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <div
              key={index}
              className="h-full float-left"
              style={{ 
                width: `${percentage}%`,
                backgroundColor: item.color
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // 기존 상태 관리
  const [hoveredPhone, setHoveredPhone] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  
  // PRD Phase 2: 새로운 상태 관리
  const [dateFilter, setDateFilter] = useState<DateFilter>({ preset: 'thisWeek' });
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // 자동 새로고침 필터 리셋 문제 해결: 최신 필터 상태를 항상 참조
  const dateFilterRef = useRef<DateFilter>(dateFilter);
  dateFilterRef.current = dateFilter;

  // 데이터 페칭 함수 (날짜 필터 적용) - 자동 새로고침 최적화
  const fetchDashboardData = useCallback(async (isRefresh = false, filter?: DateFilter) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const tableName = process.env.NODE_ENV === 'test' || process.env.VERCEL_ENV === 'preview' 
        ? 'loanbrothers_test' 
        : 'loanbrothers';

      // 자동 새로고침시 최신 필터 상태 사용, 수동 호출시 전달받은 필터 우선
      const currentFilter = filter || dateFilterRef.current;
      const { startDate, endDate } = getDateRange(currentFilter);

      // 병렬로 데이터 가져오기 (날짜 필터 적용)
      const [applicationsResult, statsResult] = await Promise.all([
        // 필터된 신청 목록
        supabase
          .from(tableName)
          .select('*')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .order('created_at', { ascending: false }),
        
        // 전체 통계 데이터 (필터 무관)
        supabase
          .from(tableName)
          .select('id, employed, location, created_at, status')
      ]);

      if (applicationsResult.error) throw applicationsResult.error;
      if (statsResult.error) throw statsResult.error;

      const applications = applicationsResult.data || [];
      const allData = statsResult.data || [];

      // 날짜 계산
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // 통계 계산 (전체 데이터 기준)
      const stats: DashboardStats = {
        total: allData.length,
        today: allData.filter(item => new Date(item.created_at) >= todayStart).length,
        thisWeek: allData.filter(item => new Date(item.created_at) >= weekStart).length,
        thisMonth: allData.filter(item => new Date(item.created_at) >= monthStart).length,
      };

      // 취업상태별 통계 (전체 데이터 기준)
      const employmentStats: EmploymentStats = {
        employed: allData.filter(item => item.employed).length,
        unemployed: allData.filter(item => !item.employed).length,
      };

      // 지역별 통계 (전체 데이터 기준, 상위 10개)
      const locationCounts = allData.reduce((acc, item) => {
        if (item.location) {
          acc[item.location] = (acc[item.location] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const locationStats: LocationStats[] = Object.entries(locationCounts)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setData({
        applications,
        stats,
        employmentStats,
        locationStats,
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('대시보드 데이터 로딩 에러:', err);
      setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []); // 의존성 배열: 빈 배열로 함수 재생성 방지

  // 상태 변경 함수
  const handleStatusChange = async (applicationId: string | number, newStatus: CounselStatus) => {
    try {
      setUpdatingStatus(String(applicationId));
      
      const tableName = process.env.NODE_ENV === 'test' || process.env.VERCEL_ENV === 'preview' 
        ? 'loanbrothers_test' 
        : 'loanbrothers';

      const { error } = await supabase
        .from(tableName)
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      // UI 즉시 업데이트
      if (data) {
        const updatedApplications = data.applications.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        );
        setData({ ...data, applications: updatedApplications });
      }

    } catch (err) {
      console.error('상태 변경 에러:', err);
      setError('상태 변경에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // PRD Phase 2: 날짜 필터 변경 함수
  const handleDateFilterChange = (preset: DateFilterPreset) => {
    const newFilter: DateFilter = { preset };
    setDateFilter(newFilter);
    setShowCustomDatePicker(false);
    fetchDashboardData(false, newFilter);
  };

  // PRD Phase 2: 사용자 정의 날짜 설정 함수
  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate + 'T23:59:59');
      
      const newFilter: DateFilter = { 
        preset: 'custom', 
        startDate, 
        endDate 
      };
      setDateFilter(newFilter);
      setShowCustomDatePicker(false);
      fetchDashboardData(false, newFilter);
    }
  };

  // PRD Phase 2: 엑셀 다운로드 함수
  const downloadExcel = async () => {
    if (!data || data.applications.length === 0) {
      setError('다운로드할 데이터가 없습니다.');
      return;
    }

    try {
      setDownloadingExcel(true);

      // 엑셀 데이터 준비 (PRD 명세에 따라)
      const excelData = data.applications.map(app => ({
        '나이': `${app.age}세`,
        '연락처': app.phone_number, // 마스킹 해제
        '지역': app.location,
        '대출금액': formatCurrency(app.loan_amount),
        '취업상태': app.employed ? '재직중' : '미취업',
        '신청일시': new Date(app.created_at).toLocaleString('ko-KR'),
        '상태': getStatusLabel(app.status)
      }));

      // 워크북 생성
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      
      // 컬럼 너비 설정
      const colWidths = [
        { wch: 8 },   // 나이
        { wch: 15 },  // 연락처
        { wch: 20 },  // 지역
        { wch: 15 },  // 대출금액
        { wch: 10 },  // 취업상태
        { wch: 20 },  // 신청일시
        { wch: 10 }   // 상태
      ];
      worksheet['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, '신청목록');
      
      // 파일명 생성 및 다운로드
      const fileName = generateExcelFileName(dateFilter);
      XLSX.writeFile(workbook, fileName);

    } catch (err) {
      console.error('엑셀 다운로드 에러:', err);
      setError('엑셀 다운로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setDownloadingExcel(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // 자동 새로고침 - 현재 필터 상태를 유지하면서 30초마다 실행
    const interval = setInterval(() => {
      // dateFilterRef.current를 사용하여 최신 필터 상태 전달
      fetchDashboardData(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchDashboardData]); // fetchDashboardData를 의존성에 추가

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // 차트 데이터 준비
  const employmentChartData = data ? [
    { label: '재직중', value: data.employmentStats.employed, color: '#3b82f6' },
    { label: '미취업', value: data.employmentStats.unemployed, color: '#ef4444' }
  ] : [];

  const locationChartData = data ? data.locationStats.map(stat => ({
    label: stat.location,
    value: stat.count,
    color: '#3b82f6'
  })) : [];

  // 로딩 상태
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-24" />
          </div>
          
          {/* 통계 카드 스켈레톤 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* 차트 스켈레톤 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>

          {/* 테이블 스켈레톤 */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>데이터를 불러오는 중 오류가 발생했습니다: {error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    재시도 중...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    재시도
                  </>
                )}
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">대출 상담 대시보드</h1>
            <p className="text-sm text-gray-500 mt-1">
              마지막 업데이트: {lastUpdated.toLocaleString('ko-KR')}
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
          >
            {refreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                새로고침 중...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                새로고침
              </>
            )}
          </Button>
        </div>

        {/* 에러 알림 (데이터가 있는 상태에서의 에러) */}
        {error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">오늘 신청</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.today}</div>
              <p className="text-xs text-muted-foreground">건</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">이번 주</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.thisWeek}</div>
              <p className="text-xs text-muted-foreground">건</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">이번 달</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.thisMonth}</div>
              <p className="text-xs text-muted-foreground">건</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 누적</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.total}</div>
              <p className="text-xs text-muted-foreground">건</p>
            </CardContent>
          </Card>
        </div>

        {/* 차트 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 취업상태별 분포 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                취업상태별 분포
              </CardTitle>
              <CardDescription>
                전체 신청자의 취업상태 분포
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <SimplePieChart data={employmentChartData} />
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">재직중: {data.employmentStats.employed}건</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm">미취업: {data.employmentStats.unemployed}건</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 지역별 신청 현황 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                지역별 신청 현황
              </CardTitle>
              <CardDescription>
                상위 10개 지역의 신청 건수
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 overflow-y-auto">
                <SimpleBarChart data={locationChartData} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PRD Phase 2: 신청 목록 (날짜 필터 + 엑셀 다운로드) */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>신청 목록</CardTitle>
                <CardDescription>
                  {getDateFilterLabel(dateFilter)} 기간의 대출 상담 신청 내역 ({data.applications.length}건)
                </CardDescription>
              </div>
              
              {/* PRD Phase 2: 필터 및 다운로드 컨트롤 */}
              <div className="flex flex-col sm:flex-row gap-2">
                {/* 날짜 필터 */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Select
                    value={dateFilter.preset}
                    onValueChange={(value: DateFilterPreset) => {
                      if (value === 'custom') {
                        setShowCustomDatePicker(true);
                      } else {
                        handleDateFilterChange(value);
                      }
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">오늘</SelectItem>
                      <SelectItem value="yesterday">어제</SelectItem>
                      <SelectItem value="thisWeek">이번 주</SelectItem>
                      <SelectItem value="lastWeek">지난 주</SelectItem>
                      <SelectItem value="thisMonth">이번 달</SelectItem>
                      <SelectItem value="lastMonth">지난 달</SelectItem>
                      <SelectItem value="custom">사용자 정의</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* 엑셀 다운로드 버튼 */}
                <Button
                  onClick={downloadExcel}
                  disabled={downloadingExcel || data.applications.length === 0}
                  variant="outline"
                  size="sm"
                >
                  {downloadingExcel ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      다운로드 중...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      엑셀 다운로드
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* 사용자 정의 날짜 선택기 */}
            {showCustomDatePicker && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="start-date">시작 날짜</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="end-date">종료 날짜</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCustomDateApply}
                      disabled={!customStartDate || !customEndDate}
                      size="sm"
                    >
                      적용
                    </Button>
                    <Button
                      onClick={() => setShowCustomDatePicker(false)}
                      variant="outline"
                      size="sm"
                    >
                      취소
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {data.applications.length === 0 ? (
              <div className="text-center py-12">
                <XCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">선택한 기간에 신청 데이터가 없습니다</h3>
                <p className="mt-1 text-sm text-gray-500">다른 날짜 범위를 선택해보세요.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {/* PRD Phase 2: ID 컬럼 제거 */}
                      <TableHead>나이</TableHead>
                      <TableHead>연락처</TableHead>
                      <TableHead>지역</TableHead>
                      <TableHead>대출금액</TableHead>
                      <TableHead>취업상태</TableHead>
                      <TableHead>신청일시</TableHead>
                      <TableHead>상태</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.applications.map((application) => (
                      <TableRow key={application.id}>
                        {/* PRD Phase 2: ID 셀 제거 */}
                        <TableCell>{application.age}세</TableCell>
                        
                        {/* 연락처 호버 기능 */}
                        <TableCell 
                          className="cursor-pointer transition-colors hover:bg-blue-50 relative group"
                          onMouseEnter={() => setHoveredPhone(String(application.id))}
                          onMouseLeave={() => setHoveredPhone(null)}
                        >
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="font-mono">
                              {hoveredPhone === String(application.id) 
                                ? application.phone_number 
                                : maskPhone(application.phone_number)
                              }
                            </span>
                            {hoveredPhone === String(application.id) ? (
                              <Eye className="h-3 w-3 text-blue-500" />
                            ) : (
                              <EyeOff className="h-3 w-3 text-gray-400" />
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>{application.location}</TableCell>
                        <TableCell>{formatCurrency(application.loan_amount)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {application.employed ? (
                              <>
                                <UserCheck className="h-4 w-4 text-green-600" />
                                <span className="text-green-600">재직중</span>
                              </>
                            ) : (
                              <>
                                <UserX className="h-4 w-4 text-red-600" />
                                <span className="text-red-600">미취업</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(application.created_at).toLocaleString('ko-KR')}
                        </TableCell>
                        
                        {/* 상태 드롭다운 기능 */}
                        <TableCell>
                          <Select
                            value={application.status || 'pending'}
                            onValueChange={(value: CounselStatus) => handleStatusChange(application.id, value)}
                            disabled={updatingStatus === String(application.id)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue>
                                <Badge 
                                  variant={getStatusVariant(application.status)}
                                  className={getStatusColor(application.status)}
                                >
                                  {updatingStatus === String(application.id) ? (
                                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                                  ) : null}
                                  {getStatusLabel(application.status)}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">대기중</SelectItem>
                              <SelectItem value="contacted">연락완료</SelectItem>
                              <SelectItem value="consulting">상담중</SelectItem>
                              <SelectItem value="completed">상담완료</SelectItem>
                              <SelectItem value="cancelled">취소</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthWrapper>
      <AdminDashboard />
    </AuthWrapper>
  );
} 