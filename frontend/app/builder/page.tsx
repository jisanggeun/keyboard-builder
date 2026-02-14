"use client";

import { useState, useMemo, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Keyboard3D } from "@/components/keyboard-3d";
import { SaveBuildDialog } from "@/components/save-build-dialog";
import { LoadBuildsDialog } from "@/components/load-builds-dialog";
import { SelectedParts, AllParts } from "@/lib/types";
import { checkCompatibilityLocal } from "@/lib/compatibility";
import { useAllParts, useBuilds, useSaveBuild, useUpdateBuild, useDeleteBuild } from "@/lib/hooks";
import { getBuild } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
    saveToLocalStorage,
    loadFromLocalStorage,
    queryParamsToSelection,
    generateShareUrl,
} from "@/lib/storage";

function restoreSelectionFromIds(
    ids: { pcb_id: number | null; case_id: number | null; plate_id: number | null; stabilizer_id: number | null; switch_id: number | null; keycap_id: number | null },
    parts: AllParts
): SelectedParts {
    return {
        pcb: parts.pcbs.find((p) => p.id === ids.pcb_id) ?? null,
        case: parts.cases.find((c) => c.id === ids.case_id) ?? null,
        plate: parts.plates.find((p) => p.id === ids.plate_id) ?? null,
        stabilizer: parts.stabilizers.find((s) => s.id === ids.stabilizer_id) ?? null,
        switch: parts.switches.find((s) => s.id === ids.switch_id) ?? null,
        keycap: parts.keycaps.find((k) => k.id === ids.keycap_id) ?? null,
    };
}

export default function BuilderPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-900" />}>
            <BuilderContent />
        </Suspense>
    );
}

function BuilderContent() {
    const { user, token, logout, isLoading: authLoading } = useAuth();
    const searchParams = useSearchParams();

    const { data } = useAllParts();
    const pcbs = data?.pcbs ?? [];
    const cases = data?.cases ?? [];
    const plates = data?.plates ?? [];
    const stabilizers = data?.stabilizers ?? [];
    const switches = data?.switches ?? [];
    const keycaps = data?.keycaps ?? [];

    const [selected, setSelected] = useState<SelectedParts>({
        pcb: null, case: null, plate: null,
        stabilizer: null, switch: null, keycap: null,
    });

    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [loadDialogOpen, setLoadDialogOpen] = useState(false);
    const [currentBuildId, setCurrentBuildId] = useState<number | null>(null);
    const [currentBuildName, setCurrentBuildName] = useState("");
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [shareMessage, setShareMessage] = useState("");
    const [showMiniPreview, setShowMiniPreview] = useState(false);
    const mainPreviewRef = useRef<HTMLDivElement>(null);

    // IntersectionObserver: show mini preview when main preview is out of view
    useEffect(() => {
        const el = mainPreviewRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setShowMiniPreview(!entry.isIntersecting);
            },
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const { data: builds = [], isLoading: buildsLoading } = useBuilds(token);
    const saveBuild = useSaveBuild(token);
    const updateBuild = useUpdateBuild(token);
    const deleteBuildMutation = useDeleteBuild(token);

    // Restore selection from URL params or localStorage on initial load
    const restoredRef = useRef(false);
    useEffect(() => {
        if (!data || restoredRef.current) return;
        restoredRef.current = true;

        const urlSelection = queryParamsToSelection(searchParams);
        if (urlSelection) {
            setSelected(restoreSelectionFromIds(urlSelection, data));
            return;
        }

        const stored = loadFromLocalStorage();
        if (stored) {
            setSelected(restoreSelectionFromIds(stored, data));
        }
    }, [data, searchParams]);

    // Auto-save to localStorage when selection changes
    const initialRenderRef = useRef(true);
    useEffect(() => {
        if (initialRenderRef.current) {
            initialRenderRef.current = false;
            return;
        }
        saveToLocalStorage(selected);
    }, [selected]);

    const getSwitchCount = (layout: string | undefined): number | null => {
        switch (layout) {
            case "60%": return 61;
            case "65%": return 68;
            case "75%": return 84;
            case "TKL": return 87;
            case "Full": return 104;
            default: return null;
        }
    };

    const compatibility = useMemo(() => {
        const selectedCount = [
            selected.pcb, selected.case, selected.plate,
            selected.stabilizer, selected.switch, selected.keycap
        ].filter(Boolean).length;

        if (selectedCount < 2) return null;
        return checkCompatibilityLocal(selected);
    }, [selected]);

    const hasAnySelected = selected.pcb || selected.case || selected.plate ||
        selected.stabilizer || selected.switch || selected.keycap;

    const handleSaveBuild = useCallback((name: string) => {
        const buildData = {
            name,
            pcb_id: selected.pcb?.id ?? null,
            case_id: selected.case?.id ?? null,
            plate_id: selected.plate?.id ?? null,
            stabilizer_id: selected.stabilizer?.id ?? null,
            switch_id: selected.switch?.id ?? null,
            keycap_id: selected.keycap?.id ?? null,
        };

        if (currentBuildId) {
            updateBuild.mutate(
                { id: currentBuildId, data: { ...buildData } },
                {
                    onSuccess: () => {
                        setSaveDialogOpen(false);
                        setCurrentBuildName(name);
                    },
                }
            );
        } else {
            saveBuild.mutate(buildData, {
                onSuccess: (result) => {
                    setSaveDialogOpen(false);
                    setCurrentBuildId(result.id);
                    setCurrentBuildName(name);
                },
            });
        }
    }, [selected, currentBuildId, saveBuild, updateBuild]);

    const handleLoadBuild = useCallback(async (buildId: number) => {
        if (!token || !data) return;
        try {
            const build = await getBuild(token, buildId);
            setSelected({
                pcb: build.pcb ? data.pcbs.find((p) => p.id === build.pcb!.id) ?? build.pcb : null,
                case: build.case ? data.cases.find((c) => c.id === build.case!.id) ?? build.case : null,
                plate: build.plate ? data.plates.find((p) => p.id === build.plate!.id) ?? build.plate : null,
                stabilizer: build.stabilizer ? data.stabilizers.find((s) => s.id === build.stabilizer!.id) ?? build.stabilizer : null,
                switch: build.switch ? data.switches.find((s) => s.id === build.switch!.id) ?? build.switch : null,
                keycap: build.keycap ? data.keycaps.find((k) => k.id === build.keycap!.id) ?? build.keycap : null,
            });
            setCurrentBuildId(buildId);
            setCurrentBuildName(build.name);
            setLoadDialogOpen(false);
        } catch {
            // failed to load
        }
    }, [token, data]);

    const handleDeleteBuild = useCallback((buildId: number) => {
        setDeletingId(buildId);
        deleteBuildMutation.mutate(buildId, {
            onSuccess: () => {
                setDeletingId(null);
                if (currentBuildId === buildId) {
                    setCurrentBuildId(null);
                    setCurrentBuildName("");
                }
            },
            onError: () => {
                setDeletingId(null);
            },
        });
    }, [deleteBuildMutation, currentBuildId]);

    const handleShareBuild = useCallback(() => {
        const url = generateShareUrl(selected);
        navigator.clipboard.writeText(url).then(() => {
            setShareMessage("URL이 복사되었습니다!");
            setTimeout(() => setShareMessage(""), 2000);
        });
    }, [selected]);

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* 헤더 */}
            <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            KeyboardBuilder
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm hidden sm:block">
                            커스텀 키보드 파츠 호환성 검증
                        </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <ThemeToggle />
                        {!authLoading && (
                            user ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                        {user.nickname || user.email}
                                    </span>
                                    <button
                                        onClick={logout}
                                        className="text-xs sm:text-sm text-gray-500 hover:text-red-500 transition"
                                    >
                                        로그아웃
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="text-xs sm:text-sm bg-gray-900 dark:bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 dark:hover:bg-blue-700 transition"
                                >
                                    로그인
                                </Link>
                            )
                        )}
                        <a href="/" className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition">
                            홈으로
                        </a>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* 빌드 저장/불러오기/공유 버튼 */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    {user && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setLoadDialogOpen(true)}
                            >
                                불러오기
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setSaveDialogOpen(true)}
                                disabled={!hasAnySelected}
                            >
                                {currentBuildId ? "업데이트" : "저장"}
                            </Button>
                        </>
                    )}
                    {hasAnySelected && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleShareBuild}
                        >
                            공유
                        </Button>
                    )}
                    {currentBuildName && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                            현재: {currentBuildName}
                        </span>
                    )}
                    {shareMessage && (
                        <span className="text-sm text-green-600 dark:text-green-400 ml-2">
                            {shareMessage}
                        </span>
                    )}
                </div>

                {/* 선택한 파츠 요약 */}
                <Card className="p-4 sm:p-6 mb-4 sm:mb-6 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h2 className="text-base sm:text-lg font-bold dark:text-white">선택한 파츠</h2>
                        {hasAnySelected && (
                            <button onClick={() => {
                                setSelected({
                                    pcb: null, case: null, plate: null,
                                    stabilizer: null, switch: null, keycap: null
                                });
                                setCurrentBuildId(null);
                                setCurrentBuildName("");
                            }}
                                className="text-sm text-gray-500 hover:text-red-500 transition"
                            >
                                전체 초기화
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {/* PCB */}
                        <div className={`p-3 rounded-lg border text-center ${
                            selected.pcb
                            ? "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700"
                            : "bg-gray-50 border-dashed dark:bg-gray-700 dark:border-gray-600"
                        }`}>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">PCB</p>
                            {selected.pcb ? (
                                <>
                                    <p className="font-medium text-sm truncate dark:text-white">{selected.pcb.name}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">${selected.pcb.price}</p>
                                </>
                            ) : (
                                <p className="text-sm text-gray-400 dark:text-gray-500">미선택</p>
                            )}
                        </div>

                        {/* Case */}
                        <div className={`p-3 rounded-lg border text-center ${
                            selected.case
                            ? "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700"
                            : "bg-gray-50 border-dashed dark:bg-gray-700 dark:border-gray-600"
                        }`}>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Case</p>
                            {selected.case ? (
                                <>
                                    <p className="font-medium text-sm truncate dark:text-white">{selected.case.name}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">${selected.case.price}</p>
                                </>
                            ) : (
                                <p className="text-sm text-gray-400 dark:text-gray-500">미선택</p>
                            )}
                        </div>

                        {/* Switch */}
                        <div className={`p-3 rounded-lg border text-center ${
                            selected.switch
                            ? "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700"
                            : "bg-gray-50 border-dashed dark:bg-gray-700 dark:border-gray-600"
                        }`}>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Switch</p>
                            {selected.switch ? (
                                <>
                                    <p className="font-medium text-sm truncate dark:text-white">{selected.switch.name}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        ${selected.switch.price} x {selected.pcb ? getSwitchCount(selected.pcb.layout) + "개" : "?개"}
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-gray-400 dark:text-gray-500">미선택</p>
                            )}
                        </div>

                        {/* Plate */}
                        <div className={`p-3 rounded-lg border text-center ${
                            selected.plate
                            ? "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700"
                            : "bg-gray-50 border-dashed dark:bg-gray-700 dark:border-gray-600"
                        }`}>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Plate</p>
                            {selected.plate ? (
                                <>
                                    <p className="font-medium text-sm truncate dark:text-white">{selected.plate.name}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">${selected.plate.price}</p>
                                </>
                            ) : (
                                <p className="text-sm text-gray-400 dark:text-gray-500">미선택</p>
                            )}
                        </div>

                        {/* Stabilizer */}
                        <div className={`p-3 rounded-lg border text-center ${
                            selected.stabilizer
                            ? "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700"
                            : "bg-gray-50 border-dashed dark:bg-gray-700 dark:border-gray-600"
                        }`}>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Stabilizer</p>
                            {selected.stabilizer ? (
                                <>
                                    <p className="font-medium text-sm truncate dark:text-white">{selected.stabilizer.name}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">${selected.stabilizer.price}</p>
                                </>
                            ) : (
                                <p className="text-sm text-gray-400 dark:text-gray-500">미선택</p>
                            )}

                        </div>

                        {/* Keycap */}
                        <div className={`p-3 rounded-lg border text-center ${
                            selected.keycap
                            ? "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700"
                            : "bg-gray-50 border-dashed dark:bg-gray-700 dark:border-gray-600"
                        }`}>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Keycap</p>
                            {selected.keycap ? (
                                <>
                                    <p className="font-medium text-sm truncate dark:text-white">{selected.keycap.name}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">${selected.keycap.price}</p>
                                </>
                            ) : (
                                <p className="text-sm text-gray-400 dark:text-gray-500">미선택</p>
                            )}
                        </div>
                    </div>

                    {/* 총 가격 */}
                    {hasAnySelected && (
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t dark:border-gray-700 flex justify-between items-center">
                            <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">총 예상 가격</span>
                            <span className="text-lg sm:text-xl font-bold text-blue-600">
                                ${(
                                    (selected.pcb?.price || 0) +
                                    (selected.case?.price || 0) +
                                    (selected.plate?.price || 0) +
                                    (selected.stabilizer?.price || 0) +
                                    (selected.pcb && selected.switch ? (selected.switch.price || 0) * (getSwitchCount(selected.pcb.layout) || 0) : 0) +
                                    (selected.keycap?.price || 0)
                                ).toFixed(2)}
                            </span>
                        </div>
                    )}
                </Card>
                {/* 3D 미리보기 */}
                <div className="mb-6" ref={mainPreviewRef}>
                    <h2 className="text-base sm:text-lg font-bold mb-3 dark:text-white">3D 미리보기</h2>
                    <Keyboard3D selected={selected} />
                </div>
                {/* 파츠 호환 상태 */}
                <div className="mb-8">
                    {compatibility && (
                        <div className={`p-4 rounded-lg ${
                            compatibility.compatible
                            ? "bg-green-50 border border-green-200 dark:bg-green-900/30 dark:border-green-700"
                            : "bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-700"
                        }`}>
                            <p className={`font-medium ${
                                compatibility.compatible
                                ? "text-green-800 dark:text-green-400"
                                : "text-red-800 dark:text-red-400"
                            }`}>
                                {compatibility.compatible
                                ? "모든 파츠 호환"
                                : "파츠 호환성 문제 발생"}
                            </p>
                            {compatibility.issues.map((issue, i) => (
                                <p key={i} className={`text-sm mt-1 ${
                                    issue.type === "error"
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-yellow-600 dark:text-yellow-400"
                                }`}>
                                    {issue.type === "warning" ? "[주의] " : "[오류] "}{issue.message}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
                {/* 파츠 선택 그리드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* PCB */}
                    <Card className="p-3 sm:p-4 dark:bg-gray-800 dark:border-gray-700">
                        <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 dark:text-white">PCB</h3>
                        <div className="space-y-2">
                            {pcbs.map((pcb) => (
                                <div
                                    key={pcb.id}
                                    onClick={() => setSelected({
                                        ...selected,
                                        pcb: selected.pcb?.id === pcb.id ? null : pcb
                                    })}
                                    className={`p-3 rounded-lg cursor-pointer border transition-all duration-200
                                        hover:shadow-md hover:-translate-y-1 ${
                                        selected.pcb?.id === pcb.id
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400 shadow-md"
                                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                                    }`}
                                >
                                    <p className="font-medium dark:text-white">{pcb.name}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        <Badge variant="secondary">{pcb.layout}</Badge>
                                        <Badge variant="secondary">{pcb.mounting_type}</Badge>
                                        {pcb.compatible_group_name && (
                                            <Badge variant="outline" className="text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-600">
                                                {pcb.compatible_group_name}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Case */}
                    <Card className="p-3 sm:p-4 dark:bg-gray-800 dark:border-gray-700">
                        <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 dark:text-white">Case</h3>
                        <div className="space-y-2">
                            {cases.map((c) => (
                                <div
                                    key={c.id}
                                    onClick={() => setSelected({
                                        ...selected,
                                        case: selected.case?.id === c.id ? null : c
                                    })}
                                    className={`p-3 rounded-lg cursor-pointer border transition-all duration-200
                                        hover:shadow-md hover:-translate-y-1 ${
                                        selected.case?.id === c.id
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400 shadow-md"
                                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                                    }`}
                                >
                                    <p className="font-medium dark:text-white">{c.name}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        <Badge variant="secondary">{c.layout}</Badge>
                                        <Badge variant="secondary">{c.mounting_type}</Badge>
                                        {c.compatible_group_name && (
                                            <Badge variant="outline" className="text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-600">
                                                {c.compatible_group_name}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Switch */}
                    <Card className="p-3 sm:p-4 dark:bg-gray-800 dark:border-gray-700">
                        <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 dark:text-white">Switch</h3>
                        <div className="space-y-2">
                            {switches.map((sw) => (
                                <div
                                    key={sw.id}
                                    onClick={() => setSelected({
                                        ...selected,
                                        switch: selected.switch?.id === sw.id ? null : sw
                                    })}
                                    className={`p-3 rounded-lg cursor-pointer border transition-all duration-200
                                        hover:shadow-md hover:-translate-y-1 ${
                                        selected.switch?.id === sw.id
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400 shadow-md"
                                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                                    }`}
                                >
                                    <p className="font-medium dark:text-white">{sw.name}</p>
                                    <div className="flex gap-1 mt-1">
                                        <Badge variant="secondary">{sw.switch_type}</Badge>
                                        {sw.tactile && <Badge variant="secondary">Tactile</Badge>}
                                        {sw.clicky && <Badge variant="secondary">Clicky</Badge>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Plate */}
                    <Card className="p-3 sm:p-4 dark:bg-gray-800 dark:border-gray-700">
                        <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 dark:text-white">Plate</h3>
                        <div className="space-y-2">
                            {plates.map((plate) => (
                                <div
                                    key={plate.id}
                                    onClick={() => setSelected({
                                        ...selected,
                                        plate: selected.plate?.id === plate.id ? null : plate
                                    })}
                                    className={`p-3 rounded-lg cursor-pointer border transition-all duration-200
                                        hover:shadow-md hover:-translate-y-1 ${
                                        selected.plate?.id === plate.id
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400 shadow-md"
                                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                                    }`}
                                >
                                    <p className="font-medium dark:text-white">{plate.name}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        <Badge variant="secondary">{plate.layout}</Badge>
                                        <Badge variant="secondary">{plate.material}</Badge>
                                        {plate.compatible_group_name && (
                                            <Badge variant="outline" className="text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-600">
                                                {plate.compatible_group_name}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Stabilizer */}
                    <Card className="p-3 sm:p-4 dark:bg-gray-800 dark:border-gray-700">
                        <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 dark:text-white">Stabilizer</h3>
                        <div className="space-y-2">
                            {stabilizers.map((stab) => (
                                <div
                                    key={stab.id}
                                    onClick={() => setSelected({
                                        ...selected,
                                        stabilizer: selected.stabilizer?.id === stab.id ? null : stab
                                    })}
                                    className={`p-3 rounded-lg cursor-pointer border transition-all duration-200
                                        hover:shadow-md hover:-translate-y-1 ${
                                        selected.stabilizer?.id === stab.id
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400 shadow-md"
                                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                                    }`}
                                >
                                    <p className="font-medium dark:text-white">{stab.name}</p>
                                    <div className="flex gap-1 mt-1">
                                        <Badge variant="secondary">{stab.stab_type}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Keycap */}
                    <Card className="p-3 sm:p-4 dark:bg-gray-800 dark:border-gray-700">
                        <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 dark:text-white">Keycap</h3>
                        <div className="space-y-2">
                            {keycaps.map((keycap) => (
                                <div
                                    key={keycap.id}
                                    onClick={() => setSelected({
                                        ...selected,
                                        keycap: selected.keycap?.id === keycap.id ? null : keycap
                                    })}
                                    className={`p-3 rounded-lg cursor-pointer border transition-all duration-200
                                        hover:shadow-md hover:-translate-y-1 ${
                                        selected.keycap?.id === keycap.id
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400 shadow-md"
                                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                                    }`}
                                >
                                    <p className="font-medium dark:text-white">{keycap.name}</p>
                                    <div className="flex gap-1 mt-1">
                                        <Badge variant="secondary">{keycap.profile}</Badge>
                                        <Badge variant="secondary">{keycap.material}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Floating Mini 3D Preview */}
            {showMiniPreview && hasAnySelected && (
                <div className="fixed bottom-4 right-4 z-40 w-72 h-52 rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => mainPreviewRef.current?.scrollIntoView({ behavior: "smooth" })}
                        className="absolute top-1.5 right-1.5 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-black/50 text-white text-xs hover:bg-black/70 transition"
                        title="메인 미리보기로 이동"
                    >
                        ↑
                    </button>
                    <Keyboard3D selected={selected} mini />
                </div>
            )}

            {/* Dialogs */}
            <SaveBuildDialog
                open={saveDialogOpen}
                onOpenChange={setSaveDialogOpen}
                onSave={handleSaveBuild}
                isLoading={saveBuild.isPending || updateBuild.isPending}
                defaultName={currentBuildName}
                isUpdate={!!currentBuildId}
            />
            <LoadBuildsDialog
                open={loadDialogOpen}
                onOpenChange={setLoadDialogOpen}
                builds={builds}
                isLoading={buildsLoading}
                onLoad={handleLoadBuild}
                onDelete={handleDeleteBuild}
                deletingId={deletingId}
            />
        </main>
    );
}
