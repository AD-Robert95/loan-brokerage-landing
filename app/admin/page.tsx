import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// TODO: 추후 서버 연동 및 인증 처리 필요
// TODO: 로그인/권한 체크 후 접근 허용
// TODO: DB 연동 시 getServerSideProps 또는 server component로 데이터 fetch

// 목업 데이터
const mockCounsels = [
  {
    id: "clxyz1",
    name: "홍길동",
    phone: "010-1234-5678",
    createdAt: "2025-05-18T14:22:00.000Z",
    status: "대기중",
  },
  {
    id: "clxyz2",
    name: "김철수",
    phone: "010-2345-6789",
    createdAt: "2025-05-17T10:11:00.000Z",
    status: "상담완료",
  },
];

function maskPhone(phone: string) {
  return phone.replace(/(\d{3})(\d{2,4})(\d{4})/, '$1-****-$3');
}

export default function AdminCounselListPage() {
  // TODO: 로딩/에러/빈 상태 처리
  return (
    <main className="max-w-3xl mx-auto py-10 px-2">
      <h1 className="text-2xl font-bold mb-6">상담 신청 내역</h1>
      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>연락처</TableHead>
              <TableHead>신청일자</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>상세</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockCounsels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-400">상담 데이터가 없습니다.</TableCell>
              </TableRow>
            ) : (
              mockCounsels.map((counsel) => (
                <TableRow key={counsel.id}>
                  <TableCell>{counsel.name}</TableCell>
                  <TableCell>{maskPhone(counsel.phone)}</TableCell>
                  <TableCell>{new Date(counsel.createdAt).toLocaleDateString('ko-KR')}</TableCell>
                  <TableCell>
                    <Badge variant={counsel.status === '대기중' ? 'default' : 'secondary'}>
                      {counsel.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {/* 추후 상세보기 페이지로 이동 */}
                    <Link href={`/admin/counsel/${counsel.id}`}>
                      <Button size="sm" variant="outline">상세</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
      {/* TODO: 페이지네이션, 필터, 검색 등 확장 */}
    </main>
  );
} 