"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { usePosts, usePost, useTogglePostLike } from "@/lib/hooks";
import { PostCategory, PostListItem, SelectedParts } from "@/lib/types";
import { SiteHeader } from "@/components/site-header";
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

function BuildDetailPanel({ post, onClose, onLike, isLoggedIn }: { post: PostListItem; onClose: () => void; onLike: () => void; isLoggedIn: boolean }) {
    const build = post.build;

    const selected: SelectedParts = useMemo(() => ({
        pcb: build?.pcb ?? null,
        case: build?.case ?? null,
        plate: build?.plate ?? null,
        stabilizer: build?.stabilizer ?? null,
        switch: build?.switch ?? null,
        keycap: build?.keycap ?? null,
    }), [build]);

    const parts = [
        { label: "PCB", part: build?.pcb },
        { label: "Case", part: build?.case },
        { label: "Plate", part: build?.plate },
        { label: "Stabilizer", part: build?.stabilizer },
        { label: "Switch", part: build?.switch },
        { label: "Keycap", part: build?.keycap },
    ];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {build?.name || post.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {post.author.nickname || "Anonymous"}
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
                {build?.pcb?.layout && (
                    <Badge variant="outline">{build.pcb.layout}</Badge>
                )}
                {build?.case?.mounting_type && (
                    <Badge variant="secondary">{build.case.mounting_type} Mount</Badge>
                )}
                {build?.case?.material && (
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
                <button
                    onClick={onLike}
                    disabled={!isLoggedIn}
                    className={`flex items-center gap-1 transition-colors ${
                        post.is_liked
                            ? "text-red-500"
                            : isLoggedIn
                                ? "hover:text-red-500"
                                : "opacity-50 cursor-not-allowed"
                    }`}
                >
                    <svg className="w-4 h-4" fill={post.is_liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {post.like_count}
                </button>
                <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {post.comment_count}
                </span>
                <span>
                    {new Date(post.created_at).toLocaleDateString("ko-KR")}
                </span>
            </div>
        </div>
    );
}

function PostPreviewPanel({ postId, token, onClose, likeOverride }: {
    postId: number;
    token?: string | null;
    onClose: () => void;
    likeOverride?: { is_liked: boolean; like_count: number } | null;
}) {
    const { data: post, isLoading } = usePost(postId, token);
    const postLikeMutation = useTogglePostLike(token ?? null);
    // Use list's optimistic state when detail hasn't synced yet
    const isLiked = likeOverride?.is_liked ?? post?.is_liked ?? false;
    const likeCount = likeOverride?.like_count ?? post?.like_count ?? 0;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    게시물 미리보기
                </h3>
                <button
                    onClick={onClose}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {isLoading ? (
                <p className="text-sm text-gray-400 py-4">로딩 중...</p>
            ) : !post ? (
                <p className="text-sm text-gray-400 py-4">게시글을 찾을 수 없습니다.</p>
            ) : (
                <>
                    {/* Category + Title */}
                    <div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category]}`}>
                            {CATEGORY_LABELS[post.category]}
                        </span>
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white mt-2">
                            {post.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span>{post.author.nickname || "Anonymous"}</span>
                            <span>{new Date(post.created_at).toLocaleDateString("ko-KR")}</span>
                        </div>
                    </div>

                    {/* Build 3D Preview */}
                    {post.build && (
                        <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                            <div className="h-56 w-full">
                                <Keyboard3D
                                    selected={{
                                        pcb: post.build.pcb,
                                        case: post.build.case,
                                        plate: post.build.plate,
                                        stabilizer: post.build.stabilizer,
                                        switch: post.build.switch,
                                        keycap: post.build.keycap,
                                    }}
                                    mini
                                />
                            </div>
                            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400">
                                {post.build.name}
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap border-t dark:border-gray-700 pt-3">
                        {post.content}
                    </div>

                    {/* Like */}
                    <div className="flex items-center gap-4 border-t dark:border-gray-700 pt-3 text-sm text-gray-500 dark:text-gray-400">
                        <button
                            onClick={() => token && postLikeMutation.mutate(post.id)}
                            disabled={!token}
                            className={`flex items-center gap-1.5 transition-colors ${
                                isLiked
                                    ? "text-red-500"
                                    : token
                                        ? "hover:text-red-500"
                                        : "opacity-50 cursor-not-allowed"
                            }`}
                        >
                            <svg className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {likeCount}
                        </button>
                        <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {post.comment_count}
                        </span>
                    </div>

                    {/* Comments */}
                    {post.comments && post.comments.length > 0 && (
                        <div className="border-t dark:border-gray-700 pt-3 space-y-3">
                            <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
                                댓글 ({post.comments.length})
                            </h5>
                            <div className="space-y-2.5">
                                {post.comments.map((c) => (
                                    <div key={c.id} className="text-sm">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <span className="font-medium text-gray-900 dark:text-white text-xs">
                                                {c.author.nickname || "Anonymous"}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                {new Date(c.created_at).toLocaleDateString("ko-KR")}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                                            {c.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Link to full page */}
                    <Link
                        href={`/community/posts/${post.id}`}
                        className="block text-center text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 pt-2 border-t dark:border-gray-700"
                    >
                        전체보기
                    </Link>
                </>
            )}
        </div>
    );
}

export default function Home() {
    const { token, isLoading: authLoading } = useAuth();
    const resolvedToken = authLoading ? undefined : token;

    // All sections use the post system for unified likes/comments
    const { data: showcasePopular } = usePosts({ category: "showcase", sort: "popular" }, resolvedToken);
    const { data: showcaseRecent } = usePosts({ category: "showcase", sort: "recent" }, resolvedToken);
    const [postCategory, setPostCategory] = useState<PostCategory | undefined>(undefined);
    const { data: popularPosts } = usePosts({ sort: "popular", category: postCategory }, resolvedToken);

    // Single like mutation for everything
    const togglePostLike = useTogglePostLike(token ?? null);

    const [selectedBuildPostId, setSelectedBuildPostId] = useState<number | null>(null);
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

    // Find the selected build post from either list
    const selectedBuildPost = useMemo(() => {
        if (!selectedBuildPostId) return null;
        return showcasePopular?.find(p => p.id === selectedBuildPostId)
            ?? showcaseRecent?.find(p => p.id === selectedBuildPostId)
            ?? null;
    }, [selectedBuildPostId, showcasePopular, showcaseRecent]);

    const handleLike = (postId: number) => {
        if (!token) return;
        togglePostLike.mutate(postId);
    };

    const handleSelectBuild = (post: PostListItem) => {
        setSelectedPostId(null);
        setSelectedBuildPostId((prev) => prev === post.id ? null : post.id);
    };

    const handleSelectPost = (postId: number) => {
        setSelectedBuildPostId(null);
        setSelectedPostId((prev) => prev === postId ? null : postId);
    };

    const handleClosePanel = () => {
        setSelectedBuildPostId(null);
        setSelectedPostId(null);
    };

    // Derive like state from the list cache for the modal
    const selectedPostLikeOverride = useMemo(() => {
        if (!selectedPostId || !popularPosts) return null;
        const found = popularPosts.find(p => p.id === selectedPostId);
        return found ? { is_liked: found.is_liked, like_count: found.like_count } : null;
    }, [selectedPostId, popularPosts]);

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SiteHeader />

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Main content */}
                <div className="space-y-10">
                    {/* 인기 빌드 */}
                    {showcasePopular && showcasePopular.length > 0 && (
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
                                {showcasePopular.slice(0, 4).map((post) => (
                                    <BuildCard
                                        key={post.id}
                                        post={post}
                                        onLike={() => handleLike(post.id)}
                                        onSelect={() => handleSelectBuild(post)}
                                        isLiking={togglePostLike.isPending}
                                        isSelected={selectedBuildPostId === post.id}
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
                                    <button
                                        key={post.id}
                                        onClick={() => handleSelectPost(post.id)}
                                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors first:rounded-t-lg last:rounded-b-lg text-left ${
                                            selectedPostId === post.id ? "bg-gray-50 dark:bg-gray-750" : ""
                                        }`}
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
                                            <span
                                                role="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleLike(post.id);
                                                }}
                                                className={`flex items-center gap-1 transition-colors ${
                                                    post.is_liked ? "text-red-500" : "hover:text-red-500"
                                                }`}
                                            >
                                                <svg className="w-3.5 h-3.5" fill={post.is_liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
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
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                                게시물이 없습니다.
                            </p>
                        )}
                    </section>

                    {/* 최신 빌드 */}
                    {showcaseRecent && showcaseRecent.length > 0 && (
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
                                {showcaseRecent.slice(0, 4).map((post) => (
                                    <BuildCard
                                        key={post.id}
                                        post={post}
                                        onLike={() => handleLike(post.id)}
                                        onSelect={() => handleSelectBuild(post)}
                                        isLiking={togglePostLike.isPending}
                                        isSelected={selectedBuildPostId === post.id}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* Build side panel */}
            <aside
                className={`hidden lg:block fixed right-0 top-16 w-96 h-[calc(100vh-4rem)] overflow-y-auto border-l dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-10 transition-transform duration-300 ease-in-out ${
                    selectedBuildPostId ? "translate-x-0" : "translate-x-full"
                }`}
            >
                {selectedBuildPost && (
                    <div className="p-5">
                        <BuildDetailPanel
                            post={selectedBuildPost}
                            onClose={handleClosePanel}
                            onLike={() => handleLike(selectedBuildPost.id)}
                            isLoggedIn={!!token}
                        />
                    </div>
                )}
            </aside>

            {/* Post preview modal overlay */}
            {selectedPostId && (
                <div
                    className="fixed inset-0 z-20 flex items-center justify-center"
                    onClick={handleClosePanel}
                >
                    <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
                    <div
                        className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <PostPreviewPanel
                                postId={selectedPostId}
                                token={resolvedToken}
                                onClose={handleClosePanel}
                                likeOverride={selectedPostLikeOverride}
                            />
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
