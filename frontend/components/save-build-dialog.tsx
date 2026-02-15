"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface SaveBuildDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (name: string, isPublic: boolean) => void;
    isLoading: boolean;
    defaultName?: string;
    defaultIsPublic?: boolean;
    isUpdate?: boolean;
}

export function SaveBuildDialog({
    open,
    onOpenChange,
    onSave,
    isLoading,
    defaultName = "",
    defaultIsPublic = false,
    isUpdate = false,
}: SaveBuildDialogProps) {
    const [name, setName] = useState(defaultName);
    const [isPublic, setIsPublic] = useState(defaultIsPublic);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        onSave(trimmed, isPublic);
    };

    return (
        <Dialog open={open} onOpenChange={(v) => {
            if (!v) {
                setName(defaultName);
                setIsPublic(defaultIsPublic);
            }
            onOpenChange(v);
        }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isUpdate ? "빌드 업데이트" : "빌드 저장"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="build-name">빌드 이름</Label>
                            <Input
                                id="build-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="예: 나의 첫 빌드"
                                autoFocus
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                role="switch"
                                aria-checked={isPublic}
                                onClick={() => setIsPublic((prev) => !prev)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                                    isPublic ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                                }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                                        isPublic ? "translate-x-5" : "translate-x-0"
                                    }`}
                                />
                            </button>
                            <Label className="cursor-pointer" onClick={() => setIsPublic((prev) => !prev)}>
                                공개 빌드
                            </Label>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            공개 빌드는 메인 페이지에 표시되며 다른 사용자가 볼 수 있습니다.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            취소
                        </Button>
                        <Button type="submit" disabled={!name.trim() || isLoading}>
                            {isLoading ? "저장 중..." : isUpdate ? "업데이트" : "저장"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
