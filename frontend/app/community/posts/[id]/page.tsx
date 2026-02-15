"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { SiteHeader } from "@/components/site-header";
import {
    usePost, useTogglePostLike, useCreateComment, useDeleteComment, useDeletePost,
} from "@/lib/hooks";
import { CommentData, PostCategory, SelectedParts } from "@/lib/types";
import { Keyboard3D } from "@/components/keyboard-3d";

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

function Avatar({ src, nickname, size = "sm" }: { src: string | null; nickname: string | null; size?: "sm" | "md" }) {
    const dim = size === "md" ? "w-8 h-8" : "w-7 h-7";
    const textSize = size === "md" ? "text-xs" : "text-[10px]";
    if (src) {
        return <img src={src} alt="" className={`${dim} rounded-full object-cover flex-shrink-0`} />;
    }
    return (
        <div className={`${dim} rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center ${textSize} font-semibold text-white flex-shrink-0`}>
            {(nickname || "A").charAt(0).toUpperCase()}
        </div>
    );
}

function DeleteDialog({ message, onConfirm, onCancel, isPending }: {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    isPending: boolean;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl w-72 overflow-hidden shadow-xl">
                <div className="px-6 py-5 text-center">
                    <p className="text-sm text-gray-900 dark:text-white">{message}</p>
                </div>
                <div className="border-t dark:border-gray-700">
                    <button
                        onClick={onConfirm}
                        disabled={isPending}
                        className="w-full py-3 text-sm font-semibold text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b dark:border-gray-700 disabled:opacity-50"
                    >
                        {isPending ? "삭제 중..." : "삭제"}
                    </button>
                    <button
                        onClick={onCancel}
                        className="w-full py-3 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
}

function CommentInput({ avatarSrc, avatarNickname, value, onChange, onSubmit, isPending, placeholder }: {
    avatarSrc: string | null;
    avatarNickname: string | null;
    value: string;
    onChange: (v: string) => void;
    onSubmit: () => void;
    isPending: boolean;
    placeholder: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <Avatar src={avatarSrc} nickname={avatarNickname} size="md" />
            <div className="flex-1 relative">
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && value.trim()) {
                            e.preventDefault();
                            onSubmit();
                        }
                    }}
                    placeholder={placeholder}
                    rows={1}
                    className="w-full resize-none border-0 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-gray-900 dark:focus:border-white focus:outline-none focus:ring-0 pb-2 transition-colors"
                />
                {value.trim() && (
                    <button
                        onClick={onSubmit}
                        disabled={isPending}
                        className="absolute right-0 top-0 text-sm font-semibold text-blue-500 hover:text-blue-600 dark:text-blue-400 disabled:opacity-50 transition-colors"
                    >
                        {isPending ? "..." : "게시"}
                    </button>
                )}
            </div>
        </div>
    );
}

interface CommentItemProps {
    comment: CommentData;
    currentUserId: number | null;
    isLoggedIn: boolean;
    userAvatar: { src: string | null; nickname: string | null };
    replyingTo: number | null;
    replyText: string;
    isPending: boolean;
    deletingCommentId: number | null;
    onReplyClick: (commentId: number) => void;
    onReplyTextChange: (text: string) => void;
    onReplySubmit: (parentCommentId: number) => void;
    onReplyCancel: () => void;
    onDeleteRequest: (commentId: number) => void;
}

function CommentItem({
    comment, currentUserId, isLoggedIn, userAvatar, replyingTo, replyText,
    isPending, deletingCommentId, onReplyClick, onReplyTextChange, onReplySubmit, onReplyCancel, onDeleteRequest,
}: CommentItemProps) {
    const [showReplies, setShowReplies] = useState(true);
    const isReply = comment.parent_comment_id !== null;
    const isOwn = currentUserId === comment.author.id;

    const timeAgo = (dateStr: string) => {
        const now = Date.now();
        const diff = now - new Date(dateStr).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return "방금";
        if (minutes < 60) return `${minutes}분`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}시간`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}일`;
        const weeks = Math.floor(days / 7);
        if (weeks < 5) return `${weeks}주`;
        return new Date(dateStr).toLocaleDateString("ko-KR");
    };

    return (
        <div className={isReply ? "flex gap-3" : "flex gap-3"}>
            <Avatar src={comment.author.profile_image} nickname={comment.author.nickname} />
            <div className="flex-1 min-w-0">
                <div className="text-sm">
                    <span className="font-semibold text-gray-900 dark:text-white mr-1.5">
                        {comment.author.nickname || "Anonymous"}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                        {comment.content}
                    </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
                    {!isReply && isLoggedIn && (
                        <button
                            onClick={() => onReplyClick(comment.id)}
                            className="text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            답글 달기
                        </button>
                    )}
                    {isOwn && (
                        <button
                            onClick={() => onDeleteRequest(comment.id)}
                            disabled={deletingCommentId === comment.id}
                            className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
                        >
                            삭제
                        </button>
                    )}
                </div>

                {/* Reply input */}
                {replyingTo === comment.id && (
                    <div className="mt-3">
                        <CommentInput
                            avatarSrc={userAvatar.src}
                            avatarNickname={userAvatar.nickname}
                            value={replyText}
                            onChange={onReplyTextChange}
                            onSubmit={() => onReplySubmit(comment.id)}
                            isPending={isPending}
                            placeholder="답글 달기..."
                        />
                        <button
                            onClick={onReplyCancel}
                            className="mt-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            취소
                        </button>
                    </div>
                )}

                {/* Replies toggle + list */}
                {!isReply && comment.replies.length > 0 && (
                    <div className="mt-2">
                        <button
                            onClick={() => setShowReplies(!showReplies)}
                            className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <span className="w-6 h-px bg-gray-300 dark:bg-gray-600" />
                            {showReplies ? "답글 숨기기" : `답글 보기 (${comment.replies.length}개)`}
                        </button>
                        {showReplies && (
                            <div className="mt-2 space-y-3">
                                {comment.replies.map((reply) => (
                                    <CommentItem
                                        key={reply.id}
                                        comment={reply}
                                        currentUserId={currentUserId}
                                        isLoggedIn={isLoggedIn}
                                        userAvatar={userAvatar}
                                        replyingTo={replyingTo}
                                        replyText={replyText}
                                        isPending={isPending}
                                        deletingCommentId={deletingCommentId}
                                        onReplyClick={onReplyClick}
                                        onReplyTextChange={onReplyTextChange}
                                        onReplySubmit={onReplySubmit}
                                        onReplyCancel={onReplyCancel}
                                        onDeleteRequest={onDeleteRequest}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, token, isLoading: authLoading } = useAuth();
    const postId = Number(params.id);
    const resolvedToken = authLoading ? undefined : token;

    const { data: post, isLoading } = usePost(postId, resolvedToken);
    const toggleLike = useTogglePostLike(token);
    const createComment = useCreateComment(token);
    const deleteComment = useDeleteComment(token, postId);
    const deletePost = useDeletePost(token);

    const [commentText, setCommentText] = useState("");
    const [showPostDeleteDialog, setShowPostDeleteDialog] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState("");

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

    const buildSelected: SelectedParts | null = post.build ? {
        pcb: post.build.pcb,
        case: post.build.case,
        plate: post.build.plate,
        stabilizer: post.build.stabilizer,
        switch: post.build.switch,
        keycap: post.build.keycap,
    } : null;

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

    const handleConfirmDeleteComment = () => {
        if (!token || deletingCommentId === null) return;
        deleteComment.mutate(deletingCommentId, {
            onSettled: () => setDeletingCommentId(null),
        });
    };

    const handleSubmitReply = async (parentCommentId: number) => {
        if (!replyText.trim() || !token) return;
        await createComment.mutateAsync({ postId, content: replyText.trim(), parentCommentId });
        setReplyText("");
        setReplyingTo(null);
    };

    const handleConfirmDeletePost = async () => {
        if (!token) return;
        await deletePost.mutateAsync(postId);
        router.push("/community");
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SiteHeader />

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
                            <button
                                onClick={() => setShowPostDeleteDialog(true)}
                                className="text-sm font-semibold text-gray-400 hover:text-red-500 transition-colors"
                            >
                                삭제
                            </button>
                        )}
                    </div>
                </article>

                {/* Comments */}
                <section className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6">
                    <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 mb-4">
                        {post.comment_count > 0 ? `댓글 ${post.comment_count}개` : "댓글"}
                    </h3>

                    {/* Comment list */}
                    <div className="space-y-4">
                        {post.comments.length === 0 && (
                            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                                아직 댓글이 없습니다. 첫 댓글을 남겨보세요.
                            </p>
                        )}
                        {post.comments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                currentUserId={user?.id ?? null}
                                isLoggedIn={!!user}
                                userAvatar={{ src: user?.profile_image ?? null, nickname: user?.nickname ?? null }}
                                replyingTo={replyingTo}
                                replyText={replyText}
                                isPending={createComment.isPending}
                                deletingCommentId={deletingCommentId}
                                onReplyClick={(id) => {
                                    setReplyingTo(replyingTo === id ? null : id);
                                    setReplyText("");
                                }}
                                onReplyTextChange={setReplyText}
                                onReplySubmit={handleSubmitReply}
                                onReplyCancel={() => { setReplyingTo(null); setReplyText(""); }}
                                onDeleteRequest={setDeletingCommentId}
                            />
                        ))}
                    </div>

                    {/* Comment input - Instagram style at bottom */}
                    <div className="mt-4 pt-4 border-t dark:border-gray-700">
                        {user ? (
                            <CommentInput
                                avatarSrc={user.profile_image ?? null}
                                avatarNickname={user.nickname ?? null}
                                value={commentText}
                                onChange={setCommentText}
                                onSubmit={handleSubmitComment}
                                isPending={createComment.isPending}
                                placeholder="댓글 달기..."
                            />
                        ) : (
                            <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                                <Link href="/login" className="text-blue-500 hover:text-blue-600 font-semibold">로그인</Link>
                                하고 댓글을 남겨보세요.
                            </p>
                        )}
                    </div>
                </section>
            </div>

            {/* Delete dialogs */}
            {showPostDeleteDialog && (
                <DeleteDialog
                    message="게시물을 삭제하시겠습니까?"
                    onConfirm={handleConfirmDeletePost}
                    onCancel={() => setShowPostDeleteDialog(false)}
                    isPending={deletePost.isPending}
                />
            )}
            {deletingCommentId !== null && (
                <DeleteDialog
                    message="댓글을 삭제하시겠습니까?"
                    onConfirm={handleConfirmDeleteComment}
                    onCancel={() => setDeletingCommentId(null)}
                    isPending={deleteComment.isPending}
                />
            )}
        </main>
    );
}
