"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface User {
    id: number;
    email: string;
    nickname: string | null;
    profile_image: string | null;
    created_at: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, nickname?: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMe = useCallback(async (accessToken: string) => {
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!res.ok) {
                throw new Error("Token invalid");
            }
            const data: User = await res.json();
            setUser(data);
            setToken(accessToken);
        } catch {
            localStorage.removeItem("token");
            setUser(null);
            setToken(null);
        }
    }, []);

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        if (savedToken) {
            fetchMe(savedToken).finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [fetchMe]);

    const login = async (email: string, password: string) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Login failed");
        }

        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        setToken(data.access_token);
        await fetchMe(data.access_token);
    };

    const register = async (email: string, password: string, nickname?: string) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, nickname: nickname || null }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Registration failed");
        }

        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        setToken(data.access_token);
        await fetchMe(data.access_token);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
