"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
    usePost, useTogglePostLike, useCreateComment, useDeleteComment, useDeletePost,
} from "@/lib/hooks";
import { PostCategory, SelectedParts } from "@/lib/types";
import { Keyboard3D } from "@/components/keyboard-3d";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, token } = useAuth();
    const postId = Number(params.id);

    const { data: post, isLoading } = usePost(postId, token);
    const toggleLike = useTogglePostLike(token);
    const createComment = useCreateComment(token);
    const deleteComment = useDeleteComment(token);
    const deletePost = useDeletePost(token);

    const [commentText, setCommentText] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    if (isLoading) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">로딩 중...</p>
            </main>
        );
    }

    if (!post) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">게시글을 찾을 수 없습니다.</p>
            </main>
        );
    }

    const buildSelected: SelectedParts | null = useMemo(() => {
        if (!post?.build) return null;
        return {
            pcb: post.build.pcb,
            case: post.build.case,
            plate: post.build.plate,
            stabilizer: post.build.stabilizer,
            switch: post.build.switch,
            keycap: post.build.keycap,
        };
    }, [post?.build]);

    const isAuthor = user?.id === post.author.id;

    const handleLike = () => {
        if (!token) return;
        toggleLike.mutate(postId);
    };

    const handleSubmitComment = async () => {
        if (!commentText.trim() || !token) return;
        await createComment.mutateAsync({ postId, content: commentText.trim() });
        setCommentText("");
    };

    const handleDeleteComment = (commentId: number) => {
        if (!token) return;
        deleteComment.mutate(commentId);
    };

    const handleDeletePost = async () => {
        if (!token) return;
        await deletePost.mutateAsync(postId);
        router.push("/community");
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/community" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">게시글</h1>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {/* Post content */}
                <article className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category]}`}>
                            {CATEGORY_LABELS[post.category]}
                        </span>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        {post.title}
                    </h2>

                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-6">
                        <div className="flex items-center gap-2">
                            {post.author.profile_image ? (
                                <img src={post.author.profile_image} alt="" className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-white">
                                    {(post.author.nickname || "A").charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span>{post.author.nickname || "Anonymous"}</span>
                        </div>
                        <span>{new Date(post.created_at).toLocaleDateString("ko-KR")}</span>
                    </div>

                    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {post.content}
                    </div>

                    {/* Build 3D Preview */}
                    {buildSelected && post.build && (
                        <div className="mt-6 border dark:border-gray-700 rounded-lg overflow-hidden">
                            <div className="h-48 w-full">
                                <Keyboard3D selected={buildSelected} mini />
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-900 space-y-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {post.build.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {[
                                        post.build.pcb && `PCB: ${post.build.pcb.name}`,
                                        post.build.case && `Case: ${post.build.case.name}`,
                                        post.build.plate && `Plate: ${post.build.plate.name}`,
                                        post.build.switch && `Switch: ${post.build.switch.name}`,
                                        post.build.keycap && `Keycap: ${post.build.keycap.name}`,
                                    ].filter(Boolean).join(" / ")}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t dark:border-gray-700">
                        <button
                            onClick={handleLike}
                            disabled={!token || toggleLike.isPending}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                                post.is_liked
                                    ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                                    : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                        >
                            <svg
                                className="w-5 h-5"
                                fill={post.is_liked ? "currentColor" : "none"}
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                            <span className="text-sm">{post.like_count}</span>
                        </button>

                        {isAuthor && (
                            <div className="flex items-center gap-2">
                                {!showDeleteConfirm ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        onClick={() => setShowDeleteConfirm(true)}
                                    >
                                        삭제
                                    </Button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-red-500">삭제하시겠습니까?</span>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleDeletePost}
                                            disabled={deletePost.isPending}
                                        >
                                            확인
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowDeleteConfirm(false)}
                                        >
                                            취소
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </article>

                {/* Comments */}
                <section className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        댓글 {post.comment_count > 0 && `(${post.comment_count})`}
                    </h3>

                    {/* Comment form */}
                    {user ? (
                        <div className="mb-6">
                            <Textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="댓글을 작성하세요"
                                className="mb-2"
                            />
                            <Button
                                size="sm"
                                onClick={handleSubmitComment}
                                disabled={!commentText.trim() || createComment.isPending}
                            >
                                {createComment.isPending ? "등록 중..." : "댓글 등록"}
                            </Button>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            댓글을 작성하려면{" "}
                            <Link href="/login" className="text-blue-500 hover:underline">로그인</Link>
                            이 필요합니다.
                        </p>
                    )}

                    {/* Comment list */}
                    <div className="space-y-4">
                        {post.comments.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">아직 댓글이 없습니다.</p>
                        ) : (
                            post.comments.map((comment) => (
                                <div key={comment.id} className="border-b dark:border-gray-700 pb-4 last:border-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {comment.author.profile_image ? (
                                                <img src={comment.author.profile_image} alt="" className="w-5 h-5 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-[10px] font-medium text-white">
                                                    {(comment.author.nickname || "A").charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {comment.author.nickname || "Anonymous"}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(comment.created_at).toLocaleDateString("ko-KR")}
                                            </span>
                                        </div>
                                        {user?.id === comment.author.id && (
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                disabled={deleteComment.isPending}
                                                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                삭제
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                        {comment.content}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
