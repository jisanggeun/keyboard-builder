"use client";

import { useState, useMemo, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import dynamic from "next/dynamic";
const Keyboard3D = dynamic(
    () => import("@/components/keyboard-3d").then((mod) => mod.Keyboard3D),
    { ssr: false }
);
import { SaveBuildDialog } from "@/components/save-build-dialog";
import { LoadBuildsDialog } from "@/components/load-builds-dialog";
import { SelectedParts, AllParts, PCB, Case as CaseType, Plate, Switch, Stabilizer, Keycap } from "@/lib/types";
import { checkCompatibilityLocal } from "@/lib/compatibility";
import { useAllParts, useBuilds, useSaveBuild, useUpdateBuild, useDeleteBuild } from "@/lib/hooks";
import { PartsFilter, applyFilters, toggleFilter } from "@/components/parts-filter";
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
    const { user, token } = useAuth();
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
    const [activeTab, setActiveTab] = useState<"pcb" | "case" | "switch" | "plate" | "stabilizer" | "keycap">("pcb");
    const [previewExpanded, setPreviewExpanded] = useState(false);

    // Parts filters
    const [pcbFilters, setPcbFilters] = useState<Record<string, Set<string>>>({});
    const [caseFilters, setCaseFilters] = useState<Record<string, Set<string>>>({});
    const [plateFilters, setPlateFilters] = useState<Record<string, Set<string>>>({});
    const [stabFilters, setStabFilters] = useState<Record<string, Set<string>>>({});
    const [switchFilters, setSwitchFilters] = useState<Record<string, Set<string>>>({});
    const [keycapFilters, setKeycapFilters] = useState<Record<string, Set<string>>>({});

    const pcbFilterConfig = useMemo(() => [
        { key: "layout", label: "Layout", getValue: (p: PCB) => p.layout },
        { key: "mounting_type", label: "Mounting", getValue: (p: PCB) => p.mounting_type },
        { key: "hotswap", label: "Hotswap", getValue: (p: PCB) => p.hotswap, type: "boolean" as const },
        { key: "switch_type", label: "Switch Type", getValue: (p: PCB) => p.switch_type },
    ], []);

    const caseFilterConfig = useMemo(() => [
        { key: "layout", label: "Layout", getValue: (c: CaseType) => c.layout },
        { key: "mounting_type", label: "Mounting", getValue: (c: CaseType) => c.mounting_type },
        { key: "material", label: "Material", getValue: (c: CaseType) => c.material },
    ], []);

    const plateFilterConfig = useMemo(() => [
        { key: "layout", label: "Layout", getValue: (p: Plate) => p.layout },
        { key: "material", label: "Material", getValue: (p: Plate) => p.material },
        { key: "switch_type", label: "Switch Type", getValue: (p: Plate) => p.switch_type },
    ], []);

    const stabFilterConfig = useMemo(() => [
        { key: "stab_type", label: "Type", getValue: (s: Stabilizer) => s.stab_type },
    ], []);

    const switchFilterConfig = useMemo(() => [
        { key: "switch_type", label: "Switch Type", getValue: (s: Switch) => s.switch_type },
        { key: "tactile", label: "Tactile", getValue: (s: Switch) => s.tactile, type: "boolean" as const },
        { key: "clicky", label: "Clicky", getValue: (s: Switch) => s.clicky, type: "boolean" as const },
    ], []);

    const keycapFilterConfig = useMemo(() => [
        { key: "profile", label: "Profile", getValue: (k: Keycap) => k.profile },
        { key: "material", label: "Material", getValue: (k: Keycap) => k.material },
    ], []);

    const filteredPcbs = useMemo(() => applyFilters(pcbs, pcbFilters, pcbFilterConfig), [pcbs, pcbFilters, pcbFilterConfig]);
    const filteredCases = useMemo(() => applyFilters(cases, caseFilters, caseFilterConfig), [cases, caseFilters, caseFilterConfig]);
    const filteredPlates = useMemo(() => applyFilters(plates, plateFilters, plateFilterConfig), [plates, plateFilters, plateFilterConfig]);
    const filteredStabilizers = useMemo(() => applyFilters(stabilizers, stabFilters, stabFilterConfig), [stabilizers, stabFilters, stabFilterConfig]);
    const filteredSwitches = useMemo(() => applyFilters(switches, switchFilters, switchFilterConfig), [switches, switchFilters, switchFilterConfig]);
    const filteredKeycaps = useMemo(() => applyFilters(keycaps, keycapFilters, keycapFilterConfig), [keycaps, keycapFilters, keycapFilterConfig]);

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

    const handleSaveBuild = useCallback((name: string, isPublic: boolean) => {
        const buildData = {
            name,
            is_public: isPublic,
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

    const selectedParts: { label: string; name: string | null; price: string | null }[] = [
        { label: "PCB", name: selected.pcb?.name ?? null, price: selected.pcb?.price ? `$${selected.pcb.price}` : null },
        { label: "Case", name: selected.case?.name ?? null, price: selected.case?.price ? `$${selected.case.price}` : null },
        { label: "Plate", name: selected.plate?.name ?? null, price: selected.plate?.price ? `$${selected.plate.price}` : null },
        { label: "Switch", name: selected.switch?.name ?? null, price: selected.switch?.price ? `$${selected.switch.price}${selected.pcb ? ` x ${getSwitchCount(selected.pcb.layout)}` : ""}` : null },
        { label: "Stabilizer", name: selected.stabilizer?.name ?? null, price: selected.stabilizer?.price ? `$${selected.stabilizer.price}` : null },
        { label: "Keycap", name: selected.keycap?.name ?? null, price: selected.keycap?.price ? `$${selected.keycap.price}` : null },
    ];

    const totalPrice = (
        (selected.pcb?.price || 0) +
        (selected.case?.price || 0) +
        (selected.plate?.price || 0) +
        (selected.stabilizer?.price || 0) +
        (selected.pcb && selected.switch ? (selected.switch.price || 0) * (getSwitchCount(selected.pcb.layout) || 0) : 0) +
        (selected.keycap?.price || 0)
    );

    const tabs = [
        { key: "pcb" as const, label: "PCB", selected: selected.pcb?.name },
        { key: "case" as const, label: "Case", selected: selected.case?.name },
        { key: "switch" as const, label: "Switch", selected: selected.switch?.name },
        { key: "plate" as const, label: "Plate", selected: selected.plate?.name },
        { key: "stabilizer" as const, label: "Stabilizer", selected: selected.stabilizer?.name },
        { key: "keycap" as const, label: "Keycap", selected: selected.keycap?.name },
    ];

    const renderPartsList = () => {
        switch (activeTab) {
            case "pcb":
                return (
                    <>
                        <PartsFilter items={pcbs} activeFilters={pcbFilters} onToggleFilter={(k, v) => setPcbFilters((prev) => toggleFilter(prev, k, v))} onReset={() => setPcbFilters({})} filterConfig={pcbFilterConfig} />
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                            {filteredPcbs.map((pcb) => (
                                <div key={pcb.id} onClick={() => setSelected({ ...selected, pcb: selected.pcb?.id === pcb.id ? null : pcb })}
                                    className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 hover:shadow-md ${selected.pcb?.id === pcb.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400 shadow-md" : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"}`}>
                                    <p className="font-medium dark:text-white">{pcb.name}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        <Badge variant="secondary">{pcb.layout}</Badge>
                                        <Badge variant="secondary">{pcb.mounting_type}</Badge>
                                        {pcb.compatible_group_name && <Badge variant="outline" className="text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-600">{pcb.compatible_group_name}</Badge>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                );
            case "case":
                return (
                    <>
                        <PartsFilter items={cases} activeFilters={caseFilters} onToggleFilter={(k, v) => setCaseFilters((prev) => toggleFilter(prev, k, v))} onReset={() => setCaseFilters({})} filterConfig={caseFilterConfig} />
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                            {filteredCases.map((c) => (
                                <div key={c.id} onClick={() => setSelected({ ...selected, case: selected.case?.id === c.id ? null : c })}
                                    className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 hover:shadow-md ${selected.case?.id === c.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400 shadow-md" : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"}`}>
                                    <p className="font-medium dark:text-white">{c.name}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        <Badge variant="secondary">{c.layout}</Badge>
                                        <Badge variant="secondary">{c.mounting_type}</Badge>
                                        {c.compatible_group_name && <Badge variant="outline" className="text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-600">{c.compatible_group_name}</Badge>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                );
            case "switch":
                return (
                    <>
                        <PartsFilter items={switches} activeFilters={switchFilters} onToggleFilter={(k, v) => setSwitchFilters((prev) => toggleFilter(prev, k, v))} onReset={() => setSwitchFilters({})} filterConfig={switchFilterConfig} />
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                            {filteredSwitches.map((sw) => (
                                <div key={sw.id} onClick={() => setSelected({ ...selected, switch: selected.switch?.id === sw.id ? null : sw })}
                                    className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 hover:shadow-md ${selected.switch?.id === sw.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400 shadow-md" : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"}`}>
                                    <p className="font-medium dark:text-white">{sw.name}</p>
                                    <div className="flex gap-1 mt-1">
                                        <Badge variant="secondary">{sw.switch_type}</Badge>
                                        {sw.tactile && <Badge variant="secondary">Tactile</Badge>}
                                        {sw.clicky && <Badge variant="secondary">Clicky</Badge>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                );
            case "plate":
                return (
                    <>
                        <PartsFilter items={plates} activeFilters={plateFilters} onToggleFilter={(k, v) => setPlateFilters((prev) => toggleFilter(prev, k, v))} onReset={() => setPlateFilters({})} filterConfig={plateFilterConfig} />
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                            {filteredPlates.map((plate) => (
                                <div key={plate.id} onClick={() => setSelected({ ...selected, plate: selected.plate?.id === plate.id ? null : plate })}
                                    className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 hover:shadow-md ${selected.plate?.id === plate.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400 shadow-md" : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"}`}>
                                    <p className="font-medium dark:text-white">{plate.name}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        <Badge variant="secondary">{plate.layout}</Badge>
                                        <Badge variant="secondary">{plate.material}</Badge>
                                        {plate.compatible_group_name && <Badge variant="outline" className="text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-600">{plate.compatible_group_name}</Badge>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                );
            case "stabilizer":
                return (
                    <>
                        <PartsFilter items={stabilizers} activeFilters={stabFilters} onToggleFilter={(k, v) => setStabFilters((prev) => toggleFilter(prev, k, v))} onReset={() => setStabFilters({})} filterConfig={stabFilterConfig} />
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                            {filteredStabilizers.map((stab) => (
                                <div key={stab.id} onClick={() => setSelected({ ...selected, stabilizer: selected.stabilizer?.id === stab.id ? null : stab })}
                                    className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 hover:shadow-md ${selected.stabilizer?.id === stab.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400 shadow-md" : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"}`}>
                                    <p className="font-medium dark:text-white">{stab.name}</p>
                                    <div className="flex gap-1 mt-1">
                                        <Badge variant="secondary">{stab.stab_type}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                );
            case "keycap":
                return (
                    <>
                        <PartsFilter items={keycaps} activeFilters={keycapFilters} onToggleFilter={(k, v) => setKeycapFilters((prev) => toggleFilter(prev, k, v))} onReset={() => setKeycapFilters({})} filterConfig={keycapFilterConfig} />
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                            {filteredKeycaps.map((keycap) => (
                                <div key={keycap.id} onClick={() => setSelected({ ...selected, keycap: selected.keycap?.id === keycap.id ? null : keycap })}
                                    className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 hover:shadow-md ${selected.keycap?.id === keycap.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400 shadow-md" : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"}`}>
                                    <p className="font-medium dark:text-white">{keycap.name}</p>
                                    <div className="flex gap-1 mt-1">
                                        <Badge variant="secondary">{keycap.profile}</Badge>
                                        <Badge variant="secondary">{keycap.material}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                );
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SiteHeader />

            <div className="max-w-[1400px] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
                {/* 메인: 탭 + 파츠 리스트 */}
                <div className="flex-1 min-w-0">
                    {/* 탭 */}
                    <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`relative px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap border transition-colors ${
                                    activeTab === tab.key
                                        ? "bg-blue-500 text-white border-blue-500 dark:bg-blue-600 dark:border-blue-600 shadow-sm"
                                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                                }`}
                            >
                                {tab.label}
                                {tab.selected && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white dark:border-gray-900" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* 파츠 리스트 */}
                    <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
                        {renderPartsList()}
                    </Card>
                </div>

                {/* 사이드바: 3D + 선택 요약 + 호환성 */}
                <aside className="w-full lg:w-80 xl:w-96 shrink-0">
                    <div className="lg:sticky lg:top-20 space-y-4">
                        {/* 3D 미리보기 */}
                        <Card className="dark:bg-gray-800 dark:border-gray-700 overflow-hidden relative">
                            <div className="h-56 xl:h-64">
                                <Keyboard3D selected={selected} />
                            </div>
                            <button
                                onClick={() => setPreviewExpanded(true)}
                                className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-md bg-black/40 text-white hover:bg-black/60 transition"
                                title="확대"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                                </svg>
                            </button>
                        </Card>

                        {/* 선택한 파츠 */}
                        <Card className="p-5 dark:bg-gray-800 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-bold dark:text-white">선택한 파츠</h2>
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
                                        초기화
                                    </button>
                                )}
                            </div>
                            <div className="space-y-2">
                                {selectedParts.map((part) => (
                                    <div
                                        key={part.label}
                                        className={`flex items-center justify-between text-sm p-2.5 rounded-lg border transition-colors ${
                                            part.name
                                                ? "bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/40"
                                                : "bg-gray-50 border-gray-100 border-dashed dark:bg-gray-700/30 dark:border-gray-700"
                                        }`}
                                    >
                                        <span className="text-gray-500 dark:text-gray-400 w-20 shrink-0 font-medium">{part.label}</span>
                                        {part.name ? (
                                            <>
                                                <span className="flex-1 truncate font-medium dark:text-white mx-2">{part.name}</span>
                                                <span className="text-gray-500 dark:text-gray-400 shrink-0">{part.price}</span>
                                            </>
                                        ) : (
                                            <span className="flex-1 text-gray-400 dark:text-gray-500 mx-2">미선택</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {hasAnySelected && (
                                <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">총 예상 가격</span>
                                    <span className="text-lg font-bold text-blue-600">${totalPrice.toFixed(2)}</span>
                                </div>
                            )}
                        </Card>

                        {/* 호환성 */}
                        {compatibility && (
                            <div className={`p-3 rounded-lg text-xs ${
                                compatibility.compatible
                                ? "bg-green-50 border border-green-200 dark:bg-green-900/30 dark:border-green-700"
                                : "bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-700"
                            }`}>
                                <p className={`font-medium ${
                                    compatibility.compatible
                                    ? "text-green-800 dark:text-green-400"
                                    : "text-red-800 dark:text-red-400"
                                }`}>
                                    {compatibility.compatible ? "모든 파츠 호환" : "호환성 문제 발견"}
                                </p>
                                {compatibility.issues.map((issue, i) => (
                                    <p key={i} className={`mt-1 ${
                                        issue.type === "error"
                                        ? "text-red-600 dark:text-red-400"
                                        : "text-yellow-600 dark:text-yellow-400"
                                    }`}>
                                        {issue.type === "warning" ? "[주의] " : "[오류] "}{issue.message}
                                    </p>
                                ))}
                            </div>
                        )}

                        {/* 액션 버튼 */}
                        <div className="flex flex-wrap gap-2">
                            {user && (
                                <>
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setLoadDialogOpen(true)}>
                                        불러오기
                                    </Button>
                                    <Button size="sm" className="flex-1" onClick={() => setSaveDialogOpen(true)} disabled={!hasAnySelected}>
                                        {currentBuildId ? "업데이트" : "저장"}
                                    </Button>
                                </>
                            )}
                            {hasAnySelected && (
                                <Button variant="outline" size="sm" className={user ? "w-full" : ""} onClick={handleShareBuild}>
                                    공유
                                </Button>
                            )}
                        </div>
                        {currentBuildName && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">현재: {currentBuildName}</p>
                        )}
                        {shareMessage && (
                            <p className="text-xs text-green-600 dark:text-green-400 text-center">{shareMessage}</p>
                        )}
                    </div>
                </aside>
            </div>

            {/* 3D 확대 모달 */}
            {previewExpanded && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-8" onClick={() => setPreviewExpanded(false)}>
                    <div className="relative w-full max-w-4xl h-[70vh] bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setPreviewExpanded(false)}
                            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <Keyboard3D selected={selected} expanded />
                    </div>
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
