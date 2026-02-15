"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { usePosts, useTogglePostLike } from "@/lib/hooks";
import { PostCategory, PostListItem, SelectedParts } from "@/lib/types";
import { SiteHeader } from "@/components/site-header";
import { Keyboard3D } from "@/components/keyboard-3d";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CATEGORY_LABELS: Record<PostCategory | "all", string> = {
    all: "전체",
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

function PostItem({ post, onLike, canLike }: { post: PostListItem; onLike: () => void; canLike: boolean }) {
    const selected: SelectedParts | null = useMemo(() => {
        if (!post.build) return null;
        return {
            pcb: post.build.pcb,
            case: post.build.case,
            plate: post.build.plate,
            stabilizer: post.build.stabilizer,
            switch: post.build.switch,
            keycap: post.build.keycap,
        };
    }, [post.build]);

    return (
        <Link
            href={`/community/posts/${post.id}`}
            className="block bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
        >
            {/* 3D Preview for showcase posts with builds */}
            {selected && (
                <div className="h-36 w-full border-b dark:border-gray-700">
                    <Keyboard3D selected={selected} mini />
                </div>
            )}

            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category]}`}>
                                {CATEGORY_LABELS[post.category]}
                            </span>
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                {post.title}
                            </h3>
                        </div>
                        {post.build && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">
                                {[
                                    post.build.pcb && `PCB: ${post.build.pcb.name}`,
                                    post.build.switch && `Switch: ${post.build.switch.name}`,
                                    post.build.keycap && `Keycap: ${post.build.keycap.name}`,
                                ].filter(Boolean).join(" / ")}
                            </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span>{post.author.nickname || "Anonymous"}</span>
                            <span>{new Date(post.created_at).toLocaleDateString("ko-KR")}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 shrink-0">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onLike();
                            }}
                            disabled={!canLike}
                            className={`flex items-center gap-1 transition-colors ${
                                post.is_liked
                                    ? "text-red-500"
                                    : canLike
                                        ? "hover:text-red-500"
                                        : ""
                            }`}
                        >
                            <svg className="w-3.5 h-3.5" fill={post.is_liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {post.like_count}
                        </button>
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {post.comment_count}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function CommunityPage() {
    const { user, token, isLoading: authLoading } = useAuth();
    const resolvedToken = authLoading ? undefined : token;
    const [selectedCategory, setSelectedCategory] = useState<PostCategory | "all">("all");
    const [sort, setSort] = useState<"recent" | "popular">("recent");

    const { data: posts, isLoading: postsLoading } = usePosts({
        category: selectedCategory === "all" ? undefined : selectedCategory,
        sort,
    }, resolvedToken);
    const togglePostLike = useTogglePostLike(token ?? null);

    const categories: (PostCategory | "all")[] = ["all", "question", "review", "info", "showcase"];

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SiteHeader />

            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    {/* Category tabs */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                    selectedCategory === cat
                                        ? "bg-gray-900 dark:bg-blue-600 text-white"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                                }`}
                            >
                                {CATEGORY_LABELS[cat]}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Sort */}
                        <div className="flex border rounded-lg overflow-hidden">
                            <button
                                onClick={() => setSort("recent")}
                                className={`px-3 py-1.5 text-sm transition-colors ${
                                    sort === "recent"
                                        ? "bg-gray-900 dark:bg-gray-600 text-white"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                }`}
                            >
                                최신순
                            </button>
                            <button
                                onClick={() => setSort("popular")}
                                className={`px-3 py-1.5 text-sm transition-colors ${
                                    sort === "popular"
                                        ? "bg-gray-900 dark:bg-gray-600 text-white"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                }`}
                            >
                                인기순
                            </button>
                        </div>

                        {/* Write button */}
                        {user && (
                            <Link href="/community/write">
                                <Button>글쓰기</Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Posts list */}
                {postsLoading ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-12">로딩 중...</p>
                ) : !posts || posts.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-12">게시글이 없습니다.</p>
                ) : (
                    <div className="space-y-2">
                        {posts.map((post) => (
                            <PostItem
                                key={post.id}
                                post={post}
                                onLike={() => token && togglePostLike.mutate(post.id)}
                                canLike={!!token}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
