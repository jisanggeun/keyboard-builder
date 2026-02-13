"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
    const { user, logout, isLoading } = useAuth();

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            KeyboardBuilder
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            커스텀 키보드 호환성 검증 플랫폼
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {!isLoading && (
                            user ? (
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {user.nickname || user.email}
                                    </span>
                                    <button
                                        onClick={logout}
                                        className="text-sm text-gray-500 hover:text-red-500 transition"
                                    >
                                        로그아웃
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="text-sm bg-gray-900 dark:bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-blue-700 transition"
                                >
                                    로그인
                                </Link>
                            )
                        )}
                    </div>
                </div>
            </header>

            {/* Main */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        나만의 커스텀 키보드 조합 만들기
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        부품 선택 시 자동 호환성 검증
                    </p>
                </div>

                <div className="flex justify-center">
                    <Link
                        href="/builder"
                        className="bg-gray-900 dark:bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-800 dark:hover:bg-blue-700 transition"
                    >
                        빌더 시작하기
                    </Link>
                </div>
            </div>
        </main>
    );
}
