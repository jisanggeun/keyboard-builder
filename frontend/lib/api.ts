import {
    AllParts, Build, BuildListItem, BuildCreateData, BuildUpdateData,
    PublicBuild, LikeResponse, UserUpdate, PasswordChange,
    PostListItem, PostDetail, PostCreateData, PostCategory, CommentData,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function getAllParts(): Promise<AllParts> {
    const res = await fetch(`${API_URL}/parts/all`);
    return res.json();
}

// Build API

export async function createBuild(token: string, data: BuildCreateData): Promise<Build> {
    const res = await fetch(`${API_URL}/builds`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to create build");
    }
    return res.json();
}

export async function getBuilds(token: string): Promise<BuildListItem[]> {
    const res = await fetch(`${API_URL}/builds`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to fetch builds");
    }
    return res.json();
}

export async function getBuild(token: string, id: number): Promise<Build> {
    const res = await fetch(`${API_URL}/builds/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to fetch build");
    }
    return res.json();
}

export async function updateBuild(token: string, id: number, data: BuildUpdateData): Promise<Build> {
    const res = await fetch(`${API_URL}/builds/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to update build");
    }
    return res.json();
}

export async function deleteBuild(token: string, id: number): Promise<void> {
    const res = await fetch(`${API_URL}/builds/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to delete build");
    }
}

// Public builds

export async function getPopularBuilds(token?: string | null, limit = 8): Promise<PublicBuild[]> {
    const headers: Record<string, string> = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(`${API_URL}/builds/popular?limit=${limit}`, { headers, cache: 'no-store' });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to fetch popular builds");
    }
    return res.json();
}

export async function getRecentBuilds(token?: string | null, limit = 8): Promise<PublicBuild[]> {
    const headers: Record<string, string> = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(`${API_URL}/builds/recent?limit=${limit}`, { headers, cache: 'no-store' });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to fetch recent builds");
    }
    return res.json();
}

export async function toggleBuildLike(token: string, buildId: number): Promise<LikeResponse> {
    const res = await fetch(`${API_URL}/builds/${buildId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        keepalive: true,
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to toggle like");
    }
    return res.json();
}

// Account

export async function updateProfile(token: string, data: UserUpdate): Promise<void> {
    const res = await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to update profile");
    }
}

export async function changePassword(token: string, data: PasswordChange): Promise<void> {
    const res = await fetch(`${API_URL}/auth/password`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to change password");
    }
}

export async function deleteAccount(token: string): Promise<void> {
    const res = await fetch(`${API_URL}/auth/me`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to delete account");
    }
}

// Community

export async function getPosts(
    params?: { category?: PostCategory; sort?: string; limit?: number; offset?: number },
    token?: string | null,
): Promise<PostListItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.sort) searchParams.set("sort", params.sort);
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.offset) searchParams.set("offset", String(params.offset));

    const headers: Record<string, string> = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(`${API_URL}/community/posts?${searchParams.toString()}`, { headers, cache: 'no-store' });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to fetch posts");
    }
    return res.json();
}

export async function getPost(postId: number, token?: string | null): Promise<PostDetail> {
    const headers: Record<string, string> = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(`${API_URL}/community/posts/${postId}`, { headers, cache: 'no-store' });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to fetch post");
    }
    return res.json();
}

export async function createPost(token: string, data: PostCreateData): Promise<PostDetail> {
    const res = await fetch(`${API_URL}/community/posts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to create post");
    }
    return res.json();
}

export async function updatePost(
    token: string, postId: number, data: Partial<PostCreateData>
): Promise<PostDetail> {
    const res = await fetch(`${API_URL}/community/posts/${postId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to update post");
    }
    return res.json();
}

export async function deletePost(token: string, postId: number): Promise<void> {
    const res = await fetch(`${API_URL}/community/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to delete post");
    }
}

export async function togglePostLike(token: string, postId: number): Promise<LikeResponse> {
    const res = await fetch(`${API_URL}/community/posts/${postId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        keepalive: true,
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to toggle like");
    }
    return res.json();
}

export async function getComments(postId: number): Promise<CommentData[]> {
    const res = await fetch(`${API_URL}/community/posts/${postId}/comments`);
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to fetch comments");
    }
    return res.json();
}

export async function createComment(token: string, postId: number, content: string): Promise<CommentData> {
    const res = await fetch(`${API_URL}/community/posts/${postId}/comments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to create comment");
    }
    return res.json();
}

export async function deleteComment(token: string, commentId: number): Promise<void> {
    const res = await fetch(`${API_URL}/community/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to delete comment");
    }
}
