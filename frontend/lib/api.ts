import { AllParts, Build, BuildListItem, BuildCreateData, BuildUpdateData } from "./types";

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
