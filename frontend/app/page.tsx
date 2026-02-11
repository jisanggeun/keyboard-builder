import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            KeyboardBuilder
          </h1>
          <p className="text-gray-500 text-sm">
            커스텀 키보드 호환성 검증 플랫폼
          </p>
        </div>
      </header>
      {/* 메인 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            나만의 커스텀 키보드 조합 만들기
          </h2>
          <p className="text-gray-600">
            부품 선택 시 자동 호환성 검증
          </p>
        </div>

        <div className="flex justify-center">
          <Link
            href="/builder"
            className="bg-gray-900 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-800 transition">
              빌더 시작하기
            </Link>
        </div>
      </div>
    </main>
  );
}