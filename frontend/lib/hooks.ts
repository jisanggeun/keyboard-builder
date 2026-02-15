import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    getAllParts, getBuilds, getBuild, createBuild, updateBuild, deleteBuild,
    updateProfile, changePassword, deleteAccount,
    getPosts, getPost, createPost, updatePost, deletePost, togglePostLike,
    getComments, createComment, deleteComment,
} from "./api"
import {
    AllParts, BuildListItem, Build, BuildCreateData, BuildUpdateData,
    LikeResponse, UserUpdate, PasswordChange,
    PostListItem, PostDetail, PostCreateData, PostCategory, CommentData,
} from "./types"

/** Read the freshest token directly from localStorage to avoid stale closures */
function freshToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("token")
}

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

export function usePosts(params?: { category?: PostCategory; sort?: string }, token?: string | null) {
    return useQuery<PostListItem[]>({
        queryKey: ["posts", params?.category, params?.sort, !!token],
        queryFn: () => getPosts(params, freshToken()),
        enabled: token !== undefined,
    })
}

export function usePost(postId: number | null, token?: string | null) {
    return useQuery<PostDetail>({
        queryKey: ["posts", postId, !!token],
        queryFn: () => getPost(postId!, freshToken()),
        enabled: !!postId && token !== undefined,
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
    // Likes only happen when logged in, so auth flag is always true
    const detailKey = (postId: number) => ["posts", postId, true] as const
    return useMutation({
        mutationFn: (postId: number) => togglePostLike(token!, postId),
        onMutate: async (postId: number) => {
            await queryClient.cancelQueries({ queryKey: ["posts", postId] })

            const prevDetail = queryClient.getQueryData<PostDetail>(detailKey(postId))
            if (prevDetail) {
                queryClient.setQueryData<PostDetail>(detailKey(postId), {
                    ...prevDetail,
                    is_liked: !prevDetail.is_liked,
                    like_count: prevDetail.is_liked ? prevDetail.like_count - 1 : prevDetail.like_count + 1,
                })
            }

            // Update all post list caches optimistically
            const prevLists: Array<{ key: readonly unknown[]; data: PostListItem[] }> = []
            queryClient.getQueriesData<PostListItem[]>({ queryKey: ["posts"] }).forEach(([key, data]) => {
                if (!Array.isArray(data)) return
                prevLists.push({ key, data })
                queryClient.setQueryData<PostListItem[]>(key, data.map(p =>
                    p.id === postId
                        ? { ...p, is_liked: !p.is_liked, like_count: p.is_liked ? p.like_count - 1 : p.like_count + 1 }
                        : p
                ))
            })

            return { prevDetail, prevLists }
        },
        onSuccess: (data: LikeResponse, postId: number) => {
            const detail = queryClient.getQueryData<PostDetail>(detailKey(postId))
            if (detail) {
                queryClient.setQueryData<PostDetail>(detailKey(postId), {
                    ...detail,
                    is_liked: data.liked,
                    like_count: data.like_count,
                })
            }
            queryClient.getQueriesData<PostListItem[]>({ queryKey: ["posts"] }).forEach(([key, list]) => {
                if (!Array.isArray(list)) return
                queryClient.setQueryData<PostListItem[]>(key, list.map(p =>
                    p.id === postId
                        ? { ...p, is_liked: data.liked, like_count: data.like_count }
                        : p
                ))
            })
        },
        onError: (_err: Error, postId: number, context) => {
            if (context?.prevDetail) {
                queryClient.setQueryData(detailKey(postId), context.prevDetail)
            }
            context?.prevLists.forEach(({ key, data }) => {
                queryClient.setQueryData(key, data)
            })
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
        onMutate: async ({ postId }) => {
            // Optimistically increment comment_count in all post list caches
            queryClient.getQueriesData<PostListItem[]>({ queryKey: ["posts"] }).forEach(([key, data]) => {
                if (!Array.isArray(data)) return
                queryClient.setQueryData<PostListItem[]>(key, data.map(p =>
                    p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p
                ))
            })
            // Optimistically increment in post detail cache (logged in = true)
            const detailKey = ["posts", postId, true] as const
            const prevDetail = queryClient.getQueryData<PostDetail>(detailKey)
            if (prevDetail) {
                queryClient.setQueryData<PostDetail>(detailKey, {
                    ...prevDetail,
                    comment_count: prevDetail.comment_count + 1,
                })
            }
        },
        onSettled: (_data, _err, { postId }) => {
            queryClient.invalidateQueries({ queryKey: ["comments", postId] })
            queryClient.invalidateQueries({ queryKey: ["posts"] })
        },
    })
}

export function useDeleteComment(token: string | null, postId?: number | null) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (commentId: number) => deleteComment(token!, commentId),
        onMutate: async () => {
            if (!postId) return
            // Optimistically decrement comment_count in all post list caches
            queryClient.getQueriesData<PostListItem[]>({ queryKey: ["posts"] }).forEach(([key, data]) => {
                if (!Array.isArray(data)) return
                queryClient.setQueryData<PostListItem[]>(key, data.map(p =>
                    p.id === postId ? { ...p, comment_count: Math.max(0, p.comment_count - 1) } : p
                ))
            })
            // Optimistically decrement in post detail cache (logged in = true)
            const detailKey = ["posts", postId, true] as const
            const prevDetail = queryClient.getQueryData<PostDetail>(detailKey)
            if (prevDetail) {
                queryClient.setQueryData<PostDetail>(detailKey, {
                    ...prevDetail,
                    comment_count: Math.max(0, prevDetail.comment_count - 1),
                })
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["comments"] })
            queryClient.invalidateQueries({ queryKey: ["posts"] })
        },
    })
}
