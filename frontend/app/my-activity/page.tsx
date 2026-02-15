"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useMyPosts, useMyComments, useDeletePost, useDeleteComment } from "@/lib/hooks";
import { PostListItem, MyComment, PostCategory } from "@/lib/types";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

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

function PostRow({ post, onDelete }: { post: PostListItem; onDelete: () => void }) {
    const [confirmDelete, setConfirmDelete] = useState(false);

    return (
        <div className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
            <Link href={`/community/posts/${post.id}`} className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${CATEGORY_COLORS[post.category]}`}>
                        {CATEGORY_LABELS[post.category]}
                    </span>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {post.title}
                    </h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
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
                    <span>{new Date(post.created_at).toLocaleDateString("ko-KR")}</span>
                </div>
            </Link>
            <div className="shrink-0">
                {confirmDelete ? (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={onDelete}
                        >
                            확인
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setConfirmDelete(false)}
                        >
                            취소
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmDelete(true)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                        삭제
                    </Button>
                )}
            </div>
        </div>
    );
}

function CommentRow({ comment, onDelete }: { comment: MyComment; onDelete: () => void }) {
    const [confirmDelete, setConfirmDelete] = useState(false);

    return (
        <div className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
            <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {comment.content}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Link
                        href={`/community/posts/${comment.post_id}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400 truncate max-w-[200px]"
                    >
                        {comment.post_title}
                    </Link>
                    {comment.parent_comment_id && (
                        <span className="text-gray-400 dark:text-gray-500">답글</span>
                    )}
                    {comment.reply_count > 0 && (
                        <span>답글 {comment.reply_count}개</span>
                    )}
                    <span>{new Date(comment.created_at).toLocaleDateString("ko-KR")}</span>
                </div>
            </div>
            <div className="shrink-0">
                {confirmDelete ? (
                    <div className="flex flex-col items-end gap-1">
                        {comment.reply_count > 0 && (
                            <p className="text-xs text-red-500">
                                답글 {comment.reply_count}개도 함께 삭제됩니다
                            </p>
                        )}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={onDelete}
                            >
                                확인
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setConfirmDelete(false)}
                            >
                                취소
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmDelete(true)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                        삭제
                    </Button>
                )}
            </div>
        </div>
    );
}

export default function MyActivityPage() {
    const router = useRouter();
    const { user, token, isLoading: authLoading } = useAuth();
    const [tab, setTab] = useState<"posts" | "comments">("posts");

    const { data: posts, isLoading: postsLoading } = useMyPosts(token);
    const { data: comments, isLoading: commentsLoading } = useMyComments(token);
    const deletePostMutation = useDeletePost(token);
    const deleteCommentMutation = useDeleteComment(token);

    if (authLoading) return null;
    if (!user) {
        router.push("/login");
        return null;
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SiteHeader />

            <div className="max-w-4xl mx-auto px-4 py-6">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    내 활동
                </h1>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setTab("posts")}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            tab === "posts"
                                ? "bg-gray-900 dark:bg-blue-600 text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                    >
                        내 게시물
                        {posts && <span className="ml-1.5 text-xs opacity-70">({posts.length})</span>}
                    </button>
                    <button
                        onClick={() => setTab("comments")}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            tab === "comments"
                                ? "bg-gray-900 dark:bg-blue-600 text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                    >
                        내 댓글
                        {comments && <span className="ml-1.5 text-xs opacity-70">({comments.length})</span>}
                    </button>
                </div>

                {/* Posts Tab */}
                {tab === "posts" && (
                    postsLoading ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-12">로딩 중...</p>
                    ) : !posts || posts.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-12">작성한 게시물이 없습니다.</p>
                    ) : (
                        <div className="space-y-2">
                            {posts.map((post) => (
                                <PostRow
                                    key={post.id}
                                    post={post}
                                    onDelete={() => deletePostMutation.mutate(post.id)}
                                />
                            ))}
                        </div>
                    )
                )}

                {/* Comments Tab */}
                {tab === "comments" && (
                    commentsLoading ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-12">로딩 중...</p>
                    ) : !comments || comments.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-12">작성한 댓글이 없습니다.</p>
                    ) : (
                        <div className="space-y-2">
                            {comments.map((comment) => (
                                <CommentRow
                                    key={comment.id}
                                    comment={comment}
                                    onDelete={() => deleteCommentMutation.mutate(comment.id)}
                                />
                            ))}
                        </div>
                    )
                )}
            </div>
        </main>
    );
}
