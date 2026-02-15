"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth-context";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const { theme, setTheme } = useTheme();

    if (isLoading) return null;
    if (!user) {
        router.push("/login");
        return null;
    }

    const themeOptions = [
        { value: "light", label: "라이트" },
        { value: "dark", label: "다크" },
        { value: "system", label: "시스템" },
    ] as const;

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SiteHeader />

            <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
                {/* Theme */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">테마</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            {themeOptions.map((option) => (
                                <Button
                                    key={option.value}
                                    variant={theme === option.value ? "default" : "outline"}
                                    onClick={() => setTheme(option.value)}
                                    className="flex-1"
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Language placeholder */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">언어</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            현재 한국어만 지원됩니다. 추후 다국어 지원이 추가될 예정입니다.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
