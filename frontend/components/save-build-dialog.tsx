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
    onSave: (name: string) => void;
    isLoading: boolean;
    defaultName?: string;
    isUpdate?: boolean;
}

export function SaveBuildDialog({
    open,
    onOpenChange,
    onSave,
    isLoading,
    defaultName = "",
    isUpdate = false,
}: SaveBuildDialogProps) {
    const [name, setName] = useState(defaultName);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        onSave(trimmed);
    };

    return (
        <Dialog open={open} onOpenChange={(v) => {
            if (!v) setName(defaultName);
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
