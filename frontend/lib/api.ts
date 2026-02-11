import { PCB, Case, Plate, Stabilizer, Switch, Keycap, CompatibilityResult } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// PCB 
export async function getPCBs(): Promise<PCB[]> {
    const res = await fetch(`${API_URL}/parts/pcbs`);
    return res.json();
}

export async function getPCB(id: number): Promise<PCB> {
    const res = await fetch(`${API_URL}/parts/pcbs/${id}`);
    return res.json()
}

// Case
export async function getCases(): Promise<Case[]> {
    const res = await fetch(`${API_URL}/parts/cases`);
    return res.json();
}

// Plate
export async function getPlates(): Promise<Plate[]> {
    const res = await fetch(`${API_URL}/parts/plates`);
    return res.json();
}

// Stabilizer
export async function getStabilizers(): Promise<Stabilizer[]> {
    const res = await fetch(`${API_URL}/parts/stabilizers`);
    return res.json();
}

// Switch
export async function getSwitches(): Promise<Switch[]> {
    const res = await fetch(`${API_URL}/parts/switches`);
    return res.json();
}

// Keycap
export async function getKeycaps(): Promise<Keycap[]> {
    const res = await fetch(`${API_URL}/parts/keycaps`);
    return res.json();
}

// 호환성 검사
export async function checkCompatibility(
    pcbId?: number,
    caseId?: number,
    plateId?: number,
    switchId?: number,
    keycapId?: number
): Promise<CompatibilityResult> {
    const params = new URLSearchParams();
    if(pcbId) params.append("pcb_id", pcbId.toString());
    if(caseId) params.append("case_id", caseId.toString());
    if(plateId) params.append("plate_id", plateId.toString());
    if(switchId) params.append("switch_id", switchId.toString());
    if(keycapId) params.append("keycap_id", keycapId.toString());

    const res = await fetch(`${API_URL}/parts/compatibility/check?${params}`, {
        method: "POST",
    });
    return res.json();
}

/*
    비동기 처리 = 기다리는 동안 다른 일 할 수 있도록 함
    여기선 부품 하나 고르고 멈추면 안되니 비동기 처리 진행

    사용자가 PCB 선택
    - API 호출 (호환성 체크)
    - 그 동안 UI는 계속 반응
    - 결과 오면 화면 업데이트
*/