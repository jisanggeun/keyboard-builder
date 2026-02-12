import { useQuery } from "@tanstack/react-query"
import { getAllParts } from "./api"
import { AllParts } from "./types"

export function useAllParts() {
    return useQuery<AllParts>({
        queryKey: ["allParts"],
        queryFn: getAllParts,
    })
}

/*
    설명:
    - queryKey: 캐시 식별자
    - queryFn: 실제 API 호출 함수
*/