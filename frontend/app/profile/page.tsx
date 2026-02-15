"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { SiteHeader } from "@/components/site-header";
import { useUpdateProfile } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
    const router = useRouter();
    const { user, token, isLoading, refreshUser } = useAuth();
    const updateProfileMutation = useUpdateProfile(token);

    const [nickname, setNickname] = useState(user?.nickname ?? "");
    const [profileImage, setProfileImage] = useState(user?.profile_image ?? "");
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    if (isLoading) return null;
    if (!user) {
        router.push("/login");
        return null;
    }

    const handleSave = async () => {
        setMessage(null);
        try {
            await updateProfileMutation.mutateAsync({
                nickname: nickname || null,
                profile_image: profileImage || null,
            });
            await refreshUser();
            setMessage({ type: "success", text: "프로필이 업데이트되었습니다." });
        } catch (err: unknown) {
            const text = err instanceof Error ? err.message : "프로필 업데이트에 실패했습니다.";
            setMessage({ type: "error", text });
        }
    };

    const displayName = nickname || user.email;
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SiteHeader />

            <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
                {/* Preview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">미리보기</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt={displayName}
                                    className="w-16 h-16 rounded-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gray-900 dark:bg-blue-600 flex items-center justify-center text-white text-2xl font-medium">
                                    {initial}
                                </div>
                            )}
                            <div>
                                <p className="text-lg font-medium text-gray-900 dark:text-white">
                                    {displayName}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">프로필 수정</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nickname">닉네임</Label>
                            <Input
                                id="nickname"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="닉네임을 입력하세요"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profileImage">프로필 이미지 URL</Label>
                            <Input
                                id="profileImage"
                                value={profileImage}
                                onChange={(e) => setProfileImage(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                        {message && (
                            <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-500"}`}>
                                {message.text}
                            </p>
                        )}
                        <Button
                            onClick={handleSave}
                            disabled={updateProfileMutation.isPending}
                        >
                            {updateProfileMutation.isPending ? "저장 중..." : "저장"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
