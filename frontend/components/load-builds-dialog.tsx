"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BuildListItem } from "@/lib/types";

interface LoadBuildsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    builds: BuildListItem[];
    isLoading: boolean;
    onLoad: (buildId: number) => void;
    onDelete: (buildId: number) => void;
    deletingId: number | null;
}

export function LoadBuildsDialog({
    open,
    onOpenChange,
    builds,
    isLoading,
    onLoad,
    onDelete,
    deletingId,
}: LoadBuildsDialogProps) {
    const partLabels = [
        { key: "has_pcb" as const, label: "PCB" },
        { key: "has_case" as const, label: "Case" },
        { key: "has_plate" as const, label: "Plate" },
        { key: "has_stabilizer" as const, label: "Stab" },
        { key: "has_switch" as const, label: "Switch" },
        { key: "has_keycap" as const, label: "Keycap" },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>저장된 빌드</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-2">
                    {isLoading && (
                        <p className="text-sm text-gray-500 text-center py-4">
                            불러오는 중...
                        </p>
                    )}
                    {!isLoading && builds.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                            저장된 빌드가 없습니다
                        </p>
                    )}
                    {builds.map((build) => (
                        <div
                            key={build.id}
                            className="border rounded-lg p-3 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium dark:text-white">
                                    {build.name}
                                </h4>
                                <span className="text-xs text-gray-500">
                                    {new Date(build.updated_at).toLocaleDateString("ko-KR")}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-3">
                                {partLabels.map(({ key, label }) =>
                                    build[key] ? (
                                        <Badge key={key} variant="secondary" className="text-xs">
                                            {label}
                                        </Badge>
                                    ) : null
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => onLoad(build.id)}
                                >
                                    불러오기
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => onDelete(build.id)}
                                    disabled={deletingId === build.id}
                                >
                                    {deletingId === build.id ? "삭제 중..." : "삭제"}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
