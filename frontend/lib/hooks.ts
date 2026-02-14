import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getAllParts, getBuilds, getBuild, createBuild, updateBuild, deleteBuild } from "./api"
import { AllParts, BuildListItem, Build, BuildCreateData, BuildUpdateData } from "./types"

export function useAllParts() {
    return useQuery<AllParts>({
        queryKey: ["allParts"],
        queryFn: getAllParts,
    })
}

export function useBuilds(token: string | null) {
    return useQuery<BuildListItem[]>({
        queryKey: ["builds"],
        queryFn: () => getBuilds(token!),
        enabled: !!token,
    })
}

export function useBuild(token: string | null, buildId: number | null) {
    return useQuery<Build>({
        queryKey: ["builds", buildId],
        queryFn: () => getBuild(token!, buildId!),
        enabled: !!token && !!buildId,
    })
}

export function useSaveBuild(token: string | null) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: BuildCreateData) => createBuild(token!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["builds"] })
        },
    })
}

export function useUpdateBuild(token: string | null) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: BuildUpdateData }) =>
            updateBuild(token!, id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["builds"] })
        },
    })
}

export function useDeleteBuild(token: string | null) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => deleteBuild(token!, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["builds"] })
        },
    })
}
