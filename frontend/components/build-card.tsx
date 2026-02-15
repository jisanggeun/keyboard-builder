"use client";

import { useMemo } from "react";
import { PostListItem, SelectedParts } from "@/lib/types";
import { Keyboard3D } from "@/components/keyboard-3d";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BuildCardProps {
    post: PostListItem;
    onLike?: () => void;
    onSelect?: () => void;
    isLiking?: boolean;
    isSelected?: boolean;
}

export function BuildCard({ post, onLike, onSelect, isLiking, isSelected }: BuildCardProps) {
    const build = post.build;

    const selected: SelectedParts = useMemo(() => ({
        pcb: build?.pcb ?? null,
        case: build?.case ?? null,
        plate: build?.plate ?? null,
        stabilizer: build?.stabilizer ?? null,
        switch: build?.switch ?? null,
        keycap: build?.keycap ?? null,
    }), [build]);

    const partCount = [
        build?.pcb, build?.case, build?.plate,
        build?.stabilizer, build?.switch, build?.keycap,
    ].filter(Boolean).length;

    return (
        <Card
            className={`hover:shadow-md transition-all overflow-hidden cursor-pointer ${
                isSelected ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""
            }`}
            onClick={onSelect}
        >
            {/* 3D Preview */}
            <div className="h-44 w-full">
                <Keyboard3D selected={selected} mini />
            </div>

            <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {build?.name || post.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {post.author.nickname || "Anonymous"}
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2 shrink-0">
                        {build?.pcb?.layout && (
                            <Badge variant="outline" className="text-[10px] px-1.5">{build.pcb.layout}</Badge>
                        )}
                        <Badge variant="secondary" className="text-[10px] px-1.5">
                            {partCount}/6
                        </Badge>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onLike?.();
                            }}
                            disabled={isLiking}
                            className={`flex items-center gap-1 text-sm transition-colors ${
                                post.is_liked
                                    ? "text-red-500"
                                    : "text-gray-400 hover:text-red-500"
                            }`}
                        >
                            <svg
                                className="w-4 h-4"
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
                            {post.like_count}
                        </button>
                        <span className="flex items-center gap-1 text-sm text-gray-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {post.comment_count}
                        </span>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(post.created_at).toLocaleDateString("ko-KR")}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
