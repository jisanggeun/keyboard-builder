"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { SiteHeader } from "@/components/site-header";
import { useBuilds, useCreatePost } from "@/lib/hooks";
import { PostCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CATEGORY_OPTIONS: { value: PostCategory; label: string }[] = [
    { value: "question", label: "질문" },
    { value: "review", label: "리뷰" },
    { value: "info", label: "정보" },
    { value: "showcase", label: "빌드 공유" },
];

export default function WritePage() {
    const router = useRouter();
    const { user, token, isLoading } = useAuth();
    const createPostMutation = useCreatePost(token);
    const { data: builds } = useBuilds(token);

    const [category, setCategory] = useState<PostCategory>("question");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [selectedBuildId, setSelectedBuildId] = useState<number | null>(null);
    const [error, setError] = useState("");

    if (isLoading) return null;
    if (!user) {
        router.push("/login");
        return null;
    }

    const handleSubmit = async () => {
        setError("");
        if (!title.trim()) {
            setError("제목을 입력해주세요.");
            return;
        }
        if (!content.trim()) {
            setError("내용을 입력해주세요.");
            return;
        }

        try {
            const post = await createPostMutation.mutateAsync({
                title: title.trim(),
                content: content.trim(),
                category,
                build_id: category === "showcase" ? selectedBuildId : undefined,
            });
            router.push(`/community/posts/${post.id}`);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "게시글 작성에 실패했습니다.";
            setError(message);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SiteHeader />

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {/* Category */}
                <div className="space-y-2">
                    <Label>카테고리</Label>
                    <div className="flex gap-2">
                        {CATEGORY_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setCategory(opt.value)}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                    category === opt.value
                                        ? "bg-gray-900 dark:bg-blue-600 text-white"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Build selector for showcase */}
                {category === "showcase" && (
                    <div className="space-y-2">
                        <Label>빌드 선택</Label>
                        {builds && builds.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {builds.map((b) => (
                                    <button
                                        key={b.id}
                                        type="button"
                                        onClick={() => setSelectedBuildId(
                                            selectedBuildId === b.id ? null : b.id
                                        )}
                                        className={`text-left p-3 rounded-lg border transition-colors ${
                                            selectedBuildId === b.id
                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                        }`}
                                    >
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {b.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            파츠 {[b.has_pcb, b.has_case, b.has_plate, b.has_stabilizer, b.has_switch, b.has_keycap].filter(Boolean).length}/6
                                        </p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                저장된 빌드가 없습니다.{" "}
                                <Link href="/builder" className="text-blue-500 hover:underline">빌더에서 먼저 빌드를 저장</Link>해주세요.
                            </p>
                        )}
                    </div>
                )}

                {/* Title */}
                <div className="space-y-2">
                    <Label htmlFor="title">제목</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 입력하세요"
                    />
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <Label htmlFor="content">내용</Label>
                    <Textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="내용을 입력하세요"
                        className="min-h-[200px]"
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-500">{error}</p>
                )}

                <div className="flex gap-3">
                    <Button
                        onClick={handleSubmit}
                        disabled={createPostMutation.isPending}
                    >
                        {createPostMutation.isPending ? "등록 중..." : "등록"}
                    </Button>
                    <Button variant="outline" onClick={() => router.back()}>
                        취소
                    </Button>
                </div>
            </div>
        </main>
    );
}
