"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { usePopularBuilds, useRecentBuilds, useToggleBuildLike, usePosts } from "@/lib/hooks";
import { PostCategory, PublicBuild, SelectedParts } from "@/lib/types";
import { UserMenu } from "@/components/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { BuildCard } from "@/components/build-card";
import { Keyboard3D } from "@/components/keyboard-3d";
import { Badge } from "@/components/ui/badge";

const CATEGORY_LABELS: Record<PostCategory, string> = {
    question: "질문",
    review: "리뷰",
    info: "정보",
    showcase: "빌드 공유",
};

const CATEGORY_COLORS: Record<PostCategory, string> = {
    question: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    review: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    info: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    showcase: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
};

function BuildDetailPanel({ build, onClose }: { build: PublicBuild; onClose: () => void }) {
    const selected: SelectedParts = useMemo(() => ({
        pcb: build.pcb,
        case: build.case,
        plate: build.plate,
        stabilizer: build.stabilizer,
        switch: build.switch,
        keycap: build.keycap,
    }), [build]);

    const parts = [
        { label: "PCB", part: build.pcb },
        { label: "Case", part: build.case },
        { label: "Plate", part: build.plate },
        { label: "Stabilizer", part: build.stabilizer },
        { label: "Switch", part: build.switch },
        { label: "Keycap", part: build.keycap },
    ];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {build.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {build.user_nickname || "Anonymous"}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* 3D Preview */}
            <div className="h-64 w-full rounded-lg overflow-hidden">
                <Keyboard3D selected={selected} />
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2">
                {build.pcb?.layout && (
                    <Badge variant="outline">{build.pcb.layout}</Badge>
                )}
                {build.case?.mounting_type && (
                    <Badge variant="secondary">{build.case.mounting_type} Mount</Badge>
                )}
                {build.case?.material && (
                    <Badge variant="secondary">{build.case.material}</Badge>
                )}
            </div>

            {/* Parts list */}
            <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    부품 구성
                </h4>
                <div className="space-y-1.5">
                    {parts.map(({ label, part }) => (
                        <div
                            key={label}
                            className={`flex items-center justify-between py-2 px-3 rounded-lg text-sm ${
                                part
                                    ? "bg-gray-50 dark:bg-gray-800"
                                    : "bg-gray-50/50 dark:bg-gray-800/50"
                            }`}
                        >
                            <span className="text-gray-500 dark:text-gray-400 text-xs w-20 shrink-0">
                                {label}
                            </span>
                            {part ? (
                                <div className="text-right min-w-0 flex-1">
                                    <p className="text-gray-900 dark:text-white truncate">
                                        {part.name}
                                    </p>
                                    {part.manufacturer && (
                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                            {part.manufacturer}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <span className="text-gray-300 dark:text-gray-600 text-xs">
                                    미선택
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 pt-2 border-t dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {build.like_count}
                </span>
                <span>
                    {new Date(build.created_at).toLocaleDateString("ko-KR")}
                </span>
            </div>
        </div>
    );
}

export default function Home() {
    const { user, token, isLoading } = useAuth();
    const { data: popularBuilds } = usePopularBuilds(token);
    const { data: recentBuilds } = useRecentBuilds(token);
    const [postCategory, setPostCategory] = useState<PostCategory | undefined>(undefined);
    const { data: popularPosts } = usePosts({ sort: "popular", category: postCategory });
    const toggleLike = useToggleBuildLike(token);

    const [selectedBuild, setSelectedBuild] = useState<PublicBuild | null>(null);
    const displayBuildRef = useRef<PublicBuild | null>(null);
    if (selectedBuild) {
        displayBuildRef.current = selectedBuild;
    }

    const handleLike = (buildId: number) => {
        if (!token) return;
        toggleLike.mutate(buildId);
    };

    const handleSelectBuild = (build: PublicBuild) => {
        setSelectedBuild((prev) => prev?.id === build.id ? null : build);
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
                            KeyboardBuilder
                        </Link>
                        <nav className="hidden sm:flex items-center gap-1">
                            <Link
                                href="/builder"
                                className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                빌더
                            </Link>
                            <Link
                                href="/community"
                                className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                커뮤니티
                            </Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-3">
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

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Main content */}
                <div className="space-y-10">
                    {/* Mobile nav */}
                    <div className="flex sm:hidden gap-2">
                        <Link
                            href="/builder"
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border dark:border-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            빌더
                        </Link>
                        <Link
                            href="/community"
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border dark:border-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            커뮤니티
                        </Link>
                    </div>

                    {/* 인기 빌드 */}
                    {popularBuilds && popularBuilds.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    인기 빌드
                                </h2>
                                <Link
                                    href="/community?category=showcase&sort=popular"
                                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    더보기
                                </Link>
                            </div>
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                                {popularBuilds.slice(0, 4).map((build) => (
                                    <BuildCard
                                        key={build.id}
                                        build={build}
                                        onLike={() => handleLike(build.id)}
                                        onSelect={() => handleSelectBuild(build)}
                                        isLiking={toggleLike.isPending}
                                        isSelected={selectedBuild?.id === build.id}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 인기 게시물 */}
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                인기 게시물
                            </h2>
                            <Link
                                href={`/community?sort=popular${postCategory ? `&category=${postCategory}` : ""}`}
                                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                더보기
                            </Link>
                        </div>
                        <div className="flex gap-1.5 mb-4">
                            {(
                                [
                                    { value: undefined, label: "전체" },
                                    { value: "question" as PostCategory, label: "질문" },
                                    { value: "review" as PostCategory, label: "리뷰" },
                                    { value: "info" as PostCategory, label: "정보" },
                                    { value: "showcase" as PostCategory, label: "빌드 공유" },
                                ] as const
                            ).map((tab) => (
                                <button
                                    key={tab.label}
                                    onClick={() => setPostCategory(tab.value)}
                                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                        postCategory === tab.value
                                            ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        {popularPosts && popularPosts.length > 0 ? (
                            <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg divide-y dark:divide-gray-700">
                                {popularPosts.slice(0, 5).map((post) => (
                                    <Link
                                        key={post.id}
                                        href={`/community/posts/${post.id}`}
                                        className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors first:rounded-t-lg last:rounded-b-lg"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${CATEGORY_COLORS[post.category]}`}>
                                                {CATEGORY_LABELS[post.category]}
                                            </span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {post.title}
                                            </span>
                                            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                                                {post.author.nickname || "Anonymous"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 shrink-0">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                                {post.like_count}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                {post.comment_count}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                                게시물이 없습니다.
                            </p>
                        )}
                    </section>

                    {/* 최신 빌드 */}
                    {recentBuilds && recentBuilds.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    최신 빌드
                                </h2>
                                <Link
                                    href="/community?category=showcase"
                                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    더보기
                                </Link>
                            </div>
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                                {recentBuilds.slice(0, 4).map((build) => (
                                    <BuildCard
                                        key={build.id}
                                        build={build}
                                        onLike={() => handleLike(build.id)}
                                        onSelect={() => handleSelectBuild(build)}
                                        isLiking={toggleLike.isPending}
                                        isSelected={selectedBuild?.id === build.id}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* Side panel - fixed on right edge with slide animation */}
            <aside
                className={`hidden lg:block fixed right-0 top-16 w-96 h-[calc(100vh-4rem)] overflow-y-auto border-l dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-10 transition-transform duration-300 ease-in-out ${
                    selectedBuild ? "translate-x-0" : "translate-x-full"
                }`}
            >
                {displayBuildRef.current && (
                    <div className="p-5">
                        <BuildDetailPanel
                            build={displayBuildRef.current}
                            onClose={() => setSelectedBuild(null)}
                        />
                    </div>
                )}
            </aside>
        </main>
    );
}
