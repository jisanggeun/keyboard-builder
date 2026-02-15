import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    getAllParts, getBuilds, getBuild, createBuild, updateBuild, deleteBuild,
    getPopularBuilds, getRecentBuilds, toggleBuildLike,
    updateProfile, changePassword, deleteAccount,
    getPosts, getPost, createPost, updatePost, deletePost, togglePostLike,
    getComments, createComment, deleteComment,
} from "./api"
import {
    AllParts, BuildListItem, Build, BuildCreateData, BuildUpdateData,
    PublicBuild, LikeResponse, UserUpdate, PasswordChange,
    PostListItem, PostDetail, PostCreateData, PostCategory, CommentData,
} from "./types"

// Parts

export function useAllParts() {
    return useQuery<AllParts>({
        queryKey: ["allParts"],
        queryFn: getAllParts,
    })
}

// User builds

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

// Public builds

export function usePopularBuilds(token?: string | null) {
    return useQuery<PublicBuild[]>({
        queryKey: ["builds", "popular"],
        queryFn: () => getPopularBuilds(token),
    })
}

export function useRecentBuilds(token?: string | null) {
    return useQuery<PublicBuild[]>({
        queryKey: ["builds", "recent"],
        queryFn: () => getRecentBuilds(token),
    })
}

export function useToggleBuildLike(token: string | null) {
    const queryClient = useQueryClient()
    return useMutation<LikeResponse, Error, number>({
        mutationFn: (buildId: number) => toggleBuildLike(token!, buildId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["builds", "popular"] })
            queryClient.invalidateQueries({ queryKey: ["builds", "recent"] })
        },
    })
}

// Account

export function useUpdateProfile(token: string | null) {
    return useMutation({
        mutationFn: (data: UserUpdate) => updateProfile(token!, data),
    })
}

export function useChangePassword(token: string | null) {
    return useMutation({
        mutationFn: (data: PasswordChange) => changePassword(token!, data),
    })
}

export function useDeleteAccount(token: string | null) {
    return useMutation({
        mutationFn: () => deleteAccount(token!),
    })
}

// Community - Posts

export function usePosts(params?: { category?: PostCategory; sort?: string }) {
    return useQuery<PostListItem[]>({
        queryKey: ["posts", params?.category, params?.sort],
        queryFn: () => getPosts(params),
    })
}

export function usePost(postId: number | null, token?: string | null) {
    return useQuery<PostDetail>({
        queryKey: ["posts", postId],
        queryFn: () => getPost(postId!, token),
        enabled: !!postId,
    })
}

export function useCreatePost(token: string | null) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: PostCreateData) => createPost(token!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] })
        },
    })
}

export function useUpdatePost(token: string | null) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ postId, data }: { postId: number; data: Partial<PostCreateData> }) =>
            updatePost(token!, postId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] })
        },
    })
}

export function useDeletePost(token: string | null) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (postId: number) => deletePost(token!, postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] })
        },
    })
}

export function useTogglePostLike(token: string | null) {
    const queryClient = useQueryClient()
    return useMutation<LikeResponse, Error, number>({
        mutationFn: (postId: number) => togglePostLike(token!, postId),
        onSuccess: (_data, postId) => {
            queryClient.invalidateQueries({ queryKey: ["posts", postId] })
            queryClient.invalidateQueries({ queryKey: ["posts"] })
        },
    })
}

// Community - Comments

export function useComments(postId: number | null) {
    return useQuery<CommentData[]>({
        queryKey: ["comments", postId],
        queryFn: () => getComments(postId!),
        enabled: !!postId,
    })
}

export function useCreateComment(token: string | null) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ postId, content }: { postId: number; content: string }) =>
            createComment(token!, postId, content),
        onSuccess: (_data, { postId }) => {
            queryClient.invalidateQueries({ queryKey: ["comments", postId] })
            queryClient.invalidateQueries({ queryKey: ["posts", postId] })
        },
    })
}

export function useDeleteComment(token: string | null) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (commentId: number) => deleteComment(token!, commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments"] })
            queryClient.invalidateQueries({ queryKey: ["posts"] })
        },
    })
}
