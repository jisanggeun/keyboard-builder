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
            <header className="bg-white border=b">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">KeyboardBuilder</h1>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-8">
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
                                    onClick={() => setSelected({ ...selected, pcb })}
                                    className={`p-3 rounded-lg cursor-pointer border transition ${
                                        selected.pcb?.id === pcb.id
                                        ? "border-blue-500 bg-blue-50"
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
                                    onClick={() => setSelected({ ...selected, case: c })}
                                    className={`p-3 rounded-lg cursor-pointer border transition ${
                                        selected.case?.id === c.id
                                        ? "border-blue-500 bg-blue-50"
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
                        <h3 className="font=bold text-lg mb-3">Switch</h3>
                        <div className="space-y-2">
                            {switches.map((sw) => (
                                <div
                                    key={sw.id}
                                    onClick={() => setSelected({ ...selected, switch: sw })}
                                    className={`p-3 rounded-lg cursor-pointer border transition ${
                                        selected.switch?.id === sw.id
                                        ? "border-blue-500 bg-blue-50"
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
                                    onClick={() => setSelected({ ...selected, plate })}
                                    className={`p-3 rounded-lg cursor-pointer border transition ${
                                        selected.plate?.id === plate.id
                                        ? "border-blue-500 bg-blue-50"
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
                                    onClick={() => setSelected({ ...selected, stabilizer: stab })}
                                    className={`p-3 rounded-lg cursor-pointer border transition ${
                                        selected.stabilizer?.id === stab.id
                                        ? "border-blue-500 bg-blue-50"
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
                                    onClick={() => setSelected({ ...selected, keycap })}
                                    className={`p-3 rounded-lg cursor-pointer border transition ${
                                        selected.keycap?.id === keycap.id
                                        ? "border-blue-500 bg-blue-50"
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