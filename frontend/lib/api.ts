import { AllParts } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// PCB, Case, Switch, Plate, Stabilizer, Keycap 
export async function getAllParts(): Promise<AllParts> {
    const res = await fetch(`${API_URL}/parts/all`);
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