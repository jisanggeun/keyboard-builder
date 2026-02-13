"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";

type Tab = "login" | "register";

export default function LoginPage() {
    const router = useRouter();
    const { login, register } = useAuth();

    const [tab, setTab] = useState<Tab>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nickname, setNickname] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!validateEmail(email)) {
            setError("올바른 이메일 형식을 입력해주세요.");
            return;
        }

        if (password.length < 6) {
            setError("비밀번호는 최소 6자 이상이어야 합니다.");
            return;
        }

        setIsSubmitting(true);

        try {
            if (tab === "login") {
                await login(email, password);
            } else {
                await register(email, password, nickname || undefined);
            }
            router.push("/builder");
        } catch (err) {
            setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
            <Card className="w-full max-w-md p-6 sm:p-8 dark:bg-gray-800 dark:border-gray-700">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        KeyboardBuilder
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        커스텀 키보드 호환성 검증 플랫폼
                    </p>
                </div>

                {/* Tab */}
                <div className="flex border-b dark:border-gray-700 mb-6">
                    <button
                        onClick={() => { setTab("login"); setError(""); }}
                        className={`flex-1 pb-3 text-sm font-medium transition ${
                            tab === "login"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                        }`}
                    >
                        로그인
                    </button>
                    <button
                        onClick={() => { setTab("register"); setError(""); }}
                        className={`flex-1 pb-3 text-sm font-medium transition ${
                            tab === "register"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                        }`}
                    >
                        회원가입
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            이메일
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            required
                            className="w-full px-3 py-2 border rounded-lg text-sm
                                bg-white dark:bg-gray-700
                                border-gray-300 dark:border-gray-600
                                text-gray-900 dark:text-white
                                placeholder-gray-400 dark:placeholder-gray-500
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            비밀번호
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="6자 이상"
                            required
                            minLength={6}
                            className="w-full px-3 py-2 border rounded-lg text-sm
                                bg-white dark:bg-gray-700
                                border-gray-300 dark:border-gray-600
                                text-gray-900 dark:text-white
                                placeholder-gray-400 dark:placeholder-gray-500
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {tab === "register" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                닉네임 (선택)
                            </label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="닉네임"
                                className="w-full px-3 py-2 border rounded-lg text-sm
                                    bg-white dark:bg-gray-700
                                    border-gray-300 dark:border-gray-600
                                    text-gray-900 dark:text-white
                                    placeholder-gray-400 dark:placeholder-gray-500
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 bg-gray-900 dark:bg-blue-600 text-white rounded-lg text-sm font-medium
                            hover:bg-gray-800 dark:hover:bg-blue-700 transition
                            disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting
                            ? "처리중..."
                            : tab === "login" ? "로그인" : "회원가입"
                        }
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a href="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition">
                        홈으로 돌아가기
                    </a>
                </div>
            </Card>
        </main>
    );
}
