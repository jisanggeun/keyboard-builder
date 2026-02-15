"use client";

import { useMemo } from "react";
import { PublicBuild, SelectedParts } from "@/lib/types";
import { Keyboard3D } from "@/components/keyboard-3d";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BuildCardProps {
    build: PublicBuild;
    onLike?: () => void;
    onSelect?: () => void;
    isLiking?: boolean;
    isSelected?: boolean;
}

export function BuildCard({ build, onLike, onSelect, isLiking, isSelected }: BuildCardProps) {
    const selected: SelectedParts = useMemo(() => ({
        pcb: build.pcb,
        case: build.case,
        plate: build.plate,
        stabilizer: build.stabilizer,
        switch: build.switch,
        keycap: build.keycap,
    }), [build]);

    const partsSummary = [
        build.pcb && `PCB: ${build.pcb.name}`,
        build.case && `Case: ${build.case.name}`,
        build.switch && `Switch: ${build.switch.name}`,
        build.keycap && `Keycap: ${build.keycap.name}`,
    ].filter(Boolean);

    const partCount = [
        build.pcb, build.case, build.plate,
        build.stabilizer, build.switch, build.keycap,
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
                            {build.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {build.user_nickname || "Anonymous"}
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2 shrink-0">
                        {build.pcb?.layout && (
                            <Badge variant="outline" className="text-[10px] px-1.5">{build.pcb.layout}</Badge>
                        )}
                        <Badge variant="secondary" className="text-[10px] px-1.5">
                            {partCount}/6
                        </Badge>
                    </div>
                </div>

                {/* Parts summary */}
                <div className="space-y-0.5">
                    {partsSummary.slice(0, 2).map((part, i) => (
                        <p key={i} className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {part}
                        </p>
                    ))}
                    {partsSummary.length > 2 && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            +{partsSummary.length - 2}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t dark:border-gray-700">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onLike?.();
                        }}
                        disabled={isLiking}
                        className={`flex items-center gap-1 text-sm transition-colors ${
                            build.is_liked
                                ? "text-red-500"
                                : "text-gray-400 hover:text-red-500"
                        }`}
                    >
                        <svg
                            className="w-4 h-4"
                            fill={build.is_liked ? "currentColor" : "none"}
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
                        {build.like_count}
                    </button>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(build.created_at).toLocaleDateString("ko-KR")}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
