"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { usePopularBuilds, useRecentBuilds, useToggleBuildLike } from "@/lib/hooks";
import { UserMenu } from "@/components/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { BuildCard } from "@/components/build-card";

export default function Home() {
    const { user, token, isLoading } = useAuth();
    const { data: popularBuilds } = usePopularBuilds(token);
    const { data: recentBuilds } = useRecentBuilds(token);
    const toggleLike = useToggleBuildLike(token);

    const handleLike = (buildId: number) => {
        if (!token) return;
        toggleLike.mutate(buildId);
    };

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
                        <nav className="hidden sm:flex items-center gap-1 mr-2">
                            <Link
                                href="/builder"
                                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                빌더
                            </Link>
                            <Link
                                href="/community"
                                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                커뮤니티
                            </Link>
                        </nav>
                        <ThemeToggle />
                        {!isLoading && (
                            user ? (
                                <UserMenu />
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

            {/* Hero */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        나만의 커스텀 키보드 조합 만들기
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        부품 선택 시 자동 호환성 검증
                    </p>
                    <div className="flex justify-center gap-3">
                        <Link
                            href="/builder"
                            className="bg-gray-900 dark:bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-800 dark:hover:bg-blue-700 transition"
                        >
                            빌더 시작하기
                        </Link>
                        <Link
                            href="/community"
                            className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                            커뮤니티
                        </Link>
                    </div>
                </div>

                {/* Mobile nav */}
                <div className="flex sm:hidden justify-center gap-3 mb-8">
                    <Link
                        href="/builder"
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        빌더
                    </Link>
                    <Link
                        href="/community"
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        커뮤니티
                    </Link>
                </div>

                {/* Popular builds */}
                {popularBuilds && popularBuilds.length > 0 && (
                    <section className="mb-12">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            인기 빌드
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {popularBuilds.slice(0, 8).map((build) => (
                                <BuildCard
                                    key={build.id}
                                    build={build}
                                    onLike={() => handleLike(build.id)}
                                    isLiking={toggleLike.isPending}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Recent builds */}
                {recentBuilds && recentBuilds.length > 0 && (
                    <section className="mb-12">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            최신 빌드
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {recentBuilds.slice(0, 8).map((build) => (
                                <BuildCard
                                    key={build.id}
                                    build={build}
                                    onLike={() => handleLike(build.id)}
                                    isLiking={toggleLike.isPending}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}
