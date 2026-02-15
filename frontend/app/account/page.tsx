"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useChangePassword, useDeleteAccount } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountPage() {
    const router = useRouter();
    const { user, token, logout, isLoading } = useAuth();
    const changePasswordMutation = useChangePassword(token);
    const deleteAccountMutation = useDeleteAccount(token);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");

    if (isLoading) return null;
    if (!user) {
        router.push("/login");
        return null;
    }

    const handleChangePassword = async () => {
        setPasswordMessage(null);

        if (newPassword.length < 6) {
            setPasswordMessage({ type: "error", text: "새 비밀번호는 최소 6자 이상이어야 합니다." });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: "error", text: "새 비밀번호가 일치하지 않습니다." });
            return;
        }

        try {
            await changePasswordMutation.mutateAsync({
                current_password: currentPassword,
                new_password: newPassword,
            });
            setPasswordMessage({ type: "success", text: "비밀번호가 변경되었습니다." });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "비밀번호 변경에 실패했습니다.";
            setPasswordMessage({ type: "error", text: message });
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await deleteAccountMutation.mutateAsync();
            logout();
            router.push("/");
        } catch {
            setPasswordMessage({ type: "error", text: "계정 삭제에 실패했습니다." });
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">계정</h1>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
                {/* Email info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">이메일</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                    </CardContent>
                </Card>

                {/* Password change */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">비밀번호 변경</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">현재 비밀번호</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">새 비밀번호</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="최소 6자"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        {passwordMessage && (
                            <p className={`text-sm ${passwordMessage.type === "success" ? "text-green-600" : "text-red-500"}`}>
                                {passwordMessage.text}
                            </p>
                        )}
                        <Button
                            onClick={handleChangePassword}
                            disabled={changePasswordMutation.isPending || !currentPassword || !newPassword}
                        >
                            {changePasswordMutation.isPending ? "변경 중..." : "비밀번호 변경"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Delete account */}
                <Card className="border-red-200 dark:border-red-800">
                    <CardHeader>
                        <CardTitle className="text-lg text-red-600">계정 삭제</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            계정을 삭제하면 모든 빌드와 게시글이 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                        </p>
                        {!showDeleteConfirm ? (
                            <Button
                                variant="destructive"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                계정 삭제
                            </Button>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-red-600">
                                    확인을 위해 &quot;삭제&quot;를 입력해주세요.
                                </p>
                                <Input
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    placeholder="삭제"
                                />
                                <div className="flex gap-2">
                                    <Button
                                        variant="destructive"
                                        onClick={handleDeleteAccount}
                                        disabled={deleteConfirmText !== "삭제" || deleteAccountMutation.isPending}
                                    >
                                        {deleteAccountMutation.isPending ? "삭제 중..." : "영구 삭제"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowDeleteConfirm(false);
                                            setDeleteConfirmText("");
                                        }}
                                    >
                                        취소
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
