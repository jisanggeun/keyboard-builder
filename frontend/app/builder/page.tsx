"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    PCB, Case, Plate, Stabilizer, Switch, Keycap,
    SelectedParts, CompatibilityResult
} from "@/lib/types";
import {
    getPCBs, getCases, getPlates, getStabilizers,
    getSwitches, getKeycaps, checkCompatibility
} from "@/lib/api";

export default function BuilderPage() {
    // 파츠 목록
    const [pcbs, setPcbs] = useState<PCB[]>([]);
    const [cases, setCases] = useState<Case[]>([]);
    const [plates, setPlates] = useState<Plate[]>([]);
    const [stabilizers, setStabilizers] = useState<Stabilizer[]>([]);
    const [switches, setSwitches] = useState<Switch[]>([]);
    const [keycaps, setKeycaps] = useState<Keycap[]>([]);

    // 선택된 파츠
    const [selected, setSelected] = useState<SelectedParts>({
        pcb: null,
        case: null,
        plate: null,
        stabilizer: null,
        switch: null,
        keycap: null,
    });

    // 호환성 결과
    const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(null);

    // PCB 사이즈 별 스위치 가격
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

    // 파츠 목록 가져오기
    useEffect(() => {
        async function loadParts() {
            const [pcbData, caseData, plateData, stabData, switchData, keycapData] = await Promise.all([
                getPCBs(),
                getCases(),
                getPlates(),
                getStabilizers(),
                getSwitches(),
                getKeycaps(),
            ]);
            setPcbs(pcbData);
            setCases(caseData);
            setPlates(plateData);
            setStabilizers(stabData);
            setSwitches(switchData);
            setKeycaps(keycapData);
        }
        loadParts();
    }, []);

    // 호환성 검사
    useEffect(() => {
        async function check() {
            // 최소 2개 이상 선택 시 검사
            const selectedCount = [
                selected.pcb,
                selected.case,
                selected.plate,
                selected.stabilizer,
                selected.switch,
                selected.keycap,
            ].filter(Boolean).length;

            if(selectedCount < 2) {
                setCompatibility(null);
                return;
            }

            const result = await checkCompatibility(
                selected.pcb?.id,
                selected.case?.id,
                selected.plate?.id,
                selected.switch?.id,
                selected.keycap?.id,
            );
            setCompatibility(result);
        }
        check();
    }, [selected]);

    return (
        <main className="min-h-screen bg-gray-50">
            {/* 헤더 */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            ⌨️ KeyboardBuilder
                        </h1>
                        <p className="text-gray-500 text-sm">
                            커스텀 키보드 파츠 호환성 검증
                        </p>
                    </div>
                    <a href="/" className="text-gray-600 hover:text-gray-900 transition">
                        홈으로
                    </a>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* 선택한 파츠 요약 */}
                <Card className="p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold mb-4">선택한 파츠</h2>
                        {(selected.pcb || selected.case || selected.plate ||
                            selected.stabilizer || selected.switch || selected.keycap) && (
                                <button onClick={() => setSelected({
                                    pcb: null, case: null, plate: null,
                                    stabilizer: null, switch: null, keycap:null
                                })}
                                className="text-sm text-gray-500 hover:text-red-500 transition"
                            >
                                전체 초기화
                            </button>
                            )
                        }
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {/* PCB */}
                        <div className={`p-3 rounded-lg border text-center ${
                            selected.pcb ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-dashed"
                        }`}>
                            <p className="text-xs text-gray-500 mb-1">PCB</p>
                            {selected.pcb ? (
                                <>
                                    <p className="font-medium text-sm truncate">{selected.pcb.name}</p>
                                    <p className="text-xs text-gray-600">${selected.pcb.price}</p>
                                </>
                            ) : (
                                <p className="text-sm text-gray-400">미선택</p>
                            )}
                        </div>
                        
                        {/* Case */}
                        <div className={`p-3 rounded-lg border text-center ${
                            selected.case ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-dashed"
                        }`}>
                            <p className="text-xs text-gray-500 mb-1">Case</p>
                            {selected.case ? (
                                <>
                                    <p className="font-medium text-sm truncate">{selected.case.name}</p>
                                    <p className="text-xs text-gray-600">${selected.case.price}</p>
                                </>
                            ) : (
                                <p className="text-sm text-gray-400">미선택</p>
                            )}
                        </div>

                        {/* Switch */}
                        <div className={`p-3 rounded-lg border text-center ${
                            selected.switch ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-dashed"
                        }`}>
                            <p className="text-xs text-gray-500 mb-1">Switch</p>
                            {selected.switch ? (
                                <>
                                    <p className="font-medium text-sm truncate">{selected.switch.name}</p>
                                    <p className="text-xs text-gray-600">
                                        ${selected.switch.price} x {selected.pcb ? getSwitchCount(selected.pcb.layout) + "개" : "?개"}
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-gray-400">미선택</p>
                            )}
                        </div>

                        {/* Plate */}
                        <div className={`p-3 rounded-lg border text-center ${
                            selected.plate ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-dashed"
                        }`}>
                            <p className="text-xs text-gray-500 mb-1">Plate</p>
                            {selected.plate ? (
                                <>
                                    <p className="font-medium text-sm truncate">{selected.plate.name}</p>
                                    <p className="text-xs text-gray-600">${selected.plate.price}</p>
                                </>
                            ) : (
                                <p className="text-sm text-gray-400">미선택</p>
                            )}
                        </div>

                        {/* Stabilizer */}
                        <div className={`p-3 rounded-lg border text-center ${
                            selected.stabilizer ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-dashed"
                        }`}>
                            <p className="text-xs text-gray-500 mb-1">Stabilizer</p>
                            {selected.stabilizer ? (
                                <>
                                    <p className="font-medium text-sm truncate">{selected.stabilizer.name}</p>
                                    <p className="text-xs text-gray-600">${selected.stabilizer.price}</p>
                                </>
                            ) : (
                                <p className="text-sm text-gray-400">미선택</p>
                            )}

                        </div>
                            
                        {/* Keycap */}
                        <div className={`p-3 rounded-lg border text-center ${
                            selected.keycap ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-dashed"
                        }`}>
                            <p className="text-xs text-gray-500 mb-1">Keycap</p>
                            {selected.keycap ? (
                                <>
                                    <p className="font-medium text-sm truncate">{selected.keycap.name}</p>
                                    <p className="text-xs text-gray-600">${selected.keycap.price}</p>
                                </>
                            ) : (
                                <p className="text-sm text-gray-400">미선택</p>
                            )}
                        </div>
                    </div>
                    
                    {/* 총 가격 */}
                    {(selected.pcb || selected.case || selected.plate ||
                        selected.stabilizer || selected.switch || selected.keycap) && (
                            <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                <span className="text-gray-600">총 예상 가격</span>
                                <span className="text-xl font-bold text-blue-600">
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
                        )
                    }
                </Card>
                {/* 파츠 호환 상태 */}
                <div className="mb-8">
                    {compatibility && (
                        <div className={`p-4 rounded-lg ${
                            compatibility.compatible
                            ? "bg-green-50 border border-green-200"
                            : "bg-red-50 border border-red-200"
                        }`}>
                            <p className={`font-medium ${
                                compatibility.compatible ? "text-green-800" : "text-red-800"
                            }`}>
                                {compatibility.compatible ? "모든 파츠 호환" : "파츠 호환성 문제 발생"}
                            </p>
                            {compatibility.issues.map((issue, i) => (
                                <p key={i} className="text-red-600 text-sm mt-1">
                                    {issue.message}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
                {/* 파츠 선택 그리드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* PCB */}
                    <Card className="p-4">
                        <h3 className="font-bold text-lg mb-3">PCB</h3>
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
                                        ? "border-blue-500 bg-blue-50 shadow-md"
                                        : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    <p className="font-medium">{pcb.name}</p>
                                    <div className="flex gap-1 mt-1">
                                        <Badge variant="secondary">{pcb.layout}</Badge>
                                        <Badge variant="secondary">{pcb.mounting_type}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card> 

                    {/* Case */}
                    <Card className="p-4">
                        <h3 className="font-bold text-lg mb-3">Case</h3>
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
                                        ? "border-blue-500 bg-blue-50 shadow-md"
                                        : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    <p className="font-medium">{c.name}</p>
                                    <div className="flex gap-1 mt-1">
                                        <Badge variant="secondary">{c.layout}</Badge>
                                        <Badge variant="secondary">{c.mounting_type}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Switch */}
                    <Card className="p-4">
                        <h3 className="font-bold text-lg mb-3">Switch</h3>
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
                                        ? "border-blue-500 bg-blue-50 shadow-md"
                                        : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    <p className="font-medium">{sw.name}</p>
                                    <div className="flex gap-1 mt-1">
                                        <Badge variant="secondary">{sw.switch_type}</Badge>
                                        {sw.tactile && <Badge variant="outline">Tacttile</Badge>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Plate */}
                    <Card className="p-4">
                        <h3 className="font-bold text-lg mb-3">Plate</h3>
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
                                        ? "border-blue-500 bg-blue-50 shadow-md"
                                        : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    <p className="font-medium">{plate.name}</p>
                                    <div className="flex gap-1 mt-1">
                                        <Badge variant="secondary">{plate.layout}</Badge>
                                        <Badge variant="secondary">{plate.material}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Stabilizer */}
                    <Card className="p-4">
                        <h3 className="font-bold text-lg mb-3">Stabilizer</h3>
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
                                        ? "border-blue-500 bg-blue-50 shadow-md"
                                        : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    <p className="font-medium">{stab.name}</p>
                                    <div className="flex gap-1 mt-1">
                                        <Badge variant="secondary">{stab.stab_type}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Keycap */}
                    <Card className="p-4">
                        <h3 className="font-bold text-lg mb-3">Keycap</h3>
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
                                        ? "border-blue-500 bg-blue-50 shadow-md"
                                        : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    <p className="font-medium">{keycap.name}</p>
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
        </main>
    );
}

/* 
    Client Component 사용
    - 브라우저에서 랜더링
    - useState, useEffect 사용하기 때문
*/